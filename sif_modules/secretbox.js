{
    INIT: function(){
       this.COMMON.reload.apply(this);
    },
    COMMAND: {
        reload: function(){
            log.info("Reloading Secretbox Data");
            this.COMMON.reload.apply(this);
        }
    },
	COMMON: {
        getRandomResult: function(dataArray, guaranteeArray){
            var shuffle = function(a) {for (let i = a.length; i; i--) {let j = Math.floor(Math.random() * i);[a[i - 1], a[j]] = [a[j], a[i - 1]];}}
            if (!guaranteeArray){ guaranteeArray = []; }
            if ((!(typeof dataArray === "object" && Array.isArray(dataArray)))){
                return dataArray;
            }
            var guarantee = null;
            if (typeof guaranteeArray === "object" && Array.isArray(guaranteeArray))
            guarantee = guaranteeArray.shift();
            var r = [];
            var isSimpleArray = false;
            for(var i=0;i<dataArray.length;i++){
                if (!(dataArray[i].id && (typeof dataArray[i].value === "object" && Array.isArray(dataArray[i].value)) && typeof dataArray[i].weight === "number") || isSimpleArray){
					log.debug("SimpleArray");
					console.log(typeof dataArray[i].value);
                    r = dataArray;
                    isSimpleArray = true;
                    break;
                }
                if (guarantee && guarantee == dataArray[i].id){
                    return this.getRandomResult(dataArray[i].value, guaranteeArray);
                }
                for (var j=0;j<dataArray[i].weight;j++){
                    r.push(dataArray[i].id);
                }
            }
			log.debug(JSON.stringify(r));
            shuffle(r);
            if (isSimpleArray){return r[0];}
            var id = r[0];
            for (var i=0;i<dataArray.length;i++){
                if (dataArray[i].id==id){
                    return this.getRandomResult(dataArray[i].value);
                }
            }
            throw new Error("no result was found?");
        },
        costCheck: function(user, type, amount){
            var defer = q.defer();
            switch(type){
                case "social_point": {
                    DB.first("user","SELECT social_point FROM users WHERE user_id=?",[user]).then(function(u){
                       defer.resolve(u.social_point>=amount); 
                    });
                    break;
                }
                case "free_muse_gacha": {
                    DB.first("user","SELECT last_free_muse_gacha FROM users WHERE user_id=?",[user]).then(function(u){
                       defer.resolve(u.last_free_muse_gacha<=Date.now()-CONFIG.game.gacha.free_gacha_delay); 
                    });
                    break;
                }
                case "free_aqours_gacha": {
                    DB.first("user","SELECT last_free_aqours_gacha FROM users WHERE user_id=?",[user]).then(function(u){
                       defer.resolve(u.last_free_muse_gacha<=Date.now()-CONFIG.game.gacha.free_gacha_delay); 
                    });
                    break;
                }
                case "loveca": {
                    DB.first("user","SELECT sns_coin FROM users WHERE user_id=?",[user]).then(function(u){
                       defer.resolve(u.sns_coin>=amount); 
                    });
                    break;
                }
                default: {
                    defer.reject(false);
                }
            }
            return defer.promise;
        },
        costEnforce: function(user, type, amount){
            var defer = q.defer();
            switch(type){
                case "social_point": {
                    DB.run("user","UPDATE users SET social_point=social_point-? WHERE user_id=?",[amount,user]).then(function(){
                       defer.resolve(true); 
                    });
                    break;
                }
                case "free_muse_gacha": {
                    DB.first("user","UPDATE users SET last_free_muse_gacha=? WHERE user_id=?",[Date.now(), user]).then(function(){
                       defer.resolve(true); 
                    });
                    break;
                }
                case "free_aqours_gacha": {
                    DB.first("user","UPDATE users SET last_free_aqours_gacha=? WHERE user_id=?",[Date.now(), user]).then(function(){
                       defer.resolve(true); 
                    });
                    break;
                }
                case "loveca": {
                    DB.first("user","UPDATE users SET sns_coin=sns_coin-? WHERE user_id=?",[amount,user]).then(function(){
                       defer.resolve(true); 
                    });
                    break;
                }
                default: {
                    defer.reject(false);
                }
            }
            return defer.promise;
        },
        reload: function(){
          this.COMMON.DATA = {box: {}};
          var list = JSON.parse(fs.readFileSync("./data/secretbox/list.json","utf8"));
          
          for (var i=0;i<list.length;i++){
              var b = list[i];
              this.COMMON.DATA.box[b.id] = b;
              if (b.enabled){
                  this.COMMON.DATA.box[b.id].data = JSON.parse(fs.readFileSync("./data/secretbox/" + b.data));
              }
          }
          
          log.info("SecretBox Data Loaded");
        },
        DATA: {},
		boxInfo: function(user_id, box_id){
			var defer = q.defer();
			
			DB.first("user","SELECT unit_max, (SELECT count(*) FROM unit WHERE owner_id=users.user_id AND removed=0) as unit_count,secretbox_gauge,last_free_muse_gacha,last_free_aqours_gacha,social_point,sns_coin FROM users WHERE user_id=?",[user_id]).then(function(userData){
				
				var hasFreeMuseGacha = (userData.last_free_muse_gacha <= Date.now() - CONFIG.game.gacha.free_gacha_delay);
                var hasFreeAqoursGacha = (userData.last_free_aqours_gacha <= Date.now() - CONFIG.game.gacha.free_gacha_delay);
				
				switch(box_id){
					case 1: {//Regular Student Scouting µ's
						defer.resolve({
							secret_box_id: 1,
							name: "Regular Student Scouting",
							title_asset: null,
							description: "dummy",
							start_date: "2013-06-05 00:00:00",
							end_date: "2037-12-31 23:59:59",
							add_gauge: 0,
							multi_type: hasFreeMuseGacha?0:1,
							multi_count: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count)),
							is_pay_cost: userData.social_point>=100,
							is_pay_multi_cost: (!hasFreeMuseGacha && userData.social_point>=200),
							within_single_limit: 1,
							within_multi_limit: 1,
							cost: {
								priority: hasFreeMuseGacha?1:2,
								type: hasFreeMuseGacha?4:3,
								item_id: null,
								amount: hasFreeMuseGacha?1:100,
								multi_amount: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count))*100
							},
							pon_count: 0,
							pon_upper_limit: 0,
							display_type: 0
						});
					
					
						break;
					}
					case 2: {//Regular Student Scouting µ's
						defer.resolve({
							secret_box_id: 2,
							name: "Honor Student Scouting",
							title_asset: null,
							description: "dummy",
							start_date: "2013-06-05 00:00:00",
							end_date: "2037-12-31 23:59:59",
							add_gauge: 10,
							multi_type: 1,
							multi_count: 11,
							is_pay_cost: userData.sns_coin>=5,
							is_pay_multi_cost: userData.sns_coin>=50,
							within_single_limit: 1,
							within_multi_limit: 1,
							cost: {
								priority: 3,
								type: 1,
								item_id: null,
								amount: 5,
								multi_amount: 50
							},
							pon_count: 0,
							pon_upper_limit: 0,
							display_type: 0
						});
					
					
						break;
					}
				}
				
				
				
				
			});
			
			
			return defer.promise;
		},
		scout: function(user_id, box, cost_priority, count){
            var defer = q.defer();
            var m = this;
            try {
            console.log(user_id, box, cost_priority, count);
            var data = this.COMMON.DATA;
            
            if (data.box[box] && //Check Box Exists
                data.box[box].costs[cost_priority] && //Check Cost Priority Exists
                data.box[box].costs[cost_priority].counts[count]){ // Check Count Exists
                
                m.COMMON.costCheck(user_id, data.box[box].costs[cost_priority].type, data.box[box].costs[cost_priority].counts[count]).then(function(success){
                    if (success){
                        try {
                        var cards = [];
                        for (var i=0;i<data.box[box].guarantee.length;i++){
                            if (count >= data.box[box].guarantee[i].min_count){
                                cards.push(m.COMMON.getRandomResult(data.box[box].data, data.box[box].guarantee[i].guarantee));
                            }
                        }
                        while (cards.length<count){
                            cards.push(m.COMMON.getRandomResult(data.box[box].data));
                        }
                        
                        log.debug(cards);
                        
                        COMMON.addMultipleCardsToUser(user_id, cards, function(uuids){
                            if (!uuids){
                                defer.reject({status: 403, result: {code: 20001, message: "Something went wrong"}});
                                return;
                            }
                            console.log("1");
                            COMMON.userInfo(user_id).then(function(beforeUserInfo){
								console.log("2");
                                m.COMMON.costEnforce(user_id, data.box[box].costs[cost_priority].type, data.box[box].costs[cost_priority].counts[count]).then(function(success){
                                    console.log("3");
                                    DB.run("user","UPDATE users SET secretbox_gauge=? WHERE user_id=?",[beforeUserInfo.secretbox_gauge + (data.box[box].add_gauge*count),user_id]).then(function(){
										console.log("4");
                                        COMMON.userInfo(user_id).then(function(afterUserInfo){
											console.log("5");
                                           var unitData = [];
										   
										   uuids.forEachThen(function(uuid, next){
											   console.log("6");
											   DB.first("user","SELECT unit_id, exp, next_exp, max_hp, level, unit_skill_level, rank, love, max_rank, max_level, max_love, unit_skill_exp, display_rank, unit_removable_skill_capacity FROM unit WHERE unit_owning_user_id=?",[uuid]).then(function(aData){
												   
												   DB.first("game_unit","SELECT rarity FROM unit_m WHERE unit_id=?",[aData.unit_id]).then(function(bData){
													   
													   unitData.push({
														  unit_rarity_id: bData.rarity,
														  add_type: 1001,
														  amount: 1,
														  item_category_id: 0,
														  unit_id: aData.unit_id,
														  unit_owning_user_id: uuid,
														  is_support_member: false,
														  exp: aData.exp,
														  next_exp: aData.next_exp,
														  max_hp: aData.max_hp,
														  level: aData.level,
														  skill_level: aData.unit_skill_level,
														  rank: aData.rank,
														  love: aData.love,
														  is_rank_max: aData.rank >= aData.max_rank,
														  is_level_max: aData.level >= aData.max_level,
														  is_love_max: aData.love >= aData.max_love,
														  new_unit_flag: false,
														  reward_box_flag: false,
														  unit_skill_exp: aData.unit_skill_exp,
														  display_rank: aData.display_rank,
														  unit_removable_skill_capacity: aData.unit_removable_skill_capacity
													   });
													   next();
												   }).catch(function(e){
													   console.log(e);
												       defer.reject({status: 403, result: {code: 20001, message: "Something Broke [5]"}});  
												   });
												   
											   }).catch(function(e){
												  console.log(e);
												   defer.reject({status: 403, result: {code: 20001, message: "Something Broke [4]"}});  
											   });
										   },function(){
												m.COMMON.boxInfo(user_id, box).then(function(boxInfo){
													var result = {
														is_unit_max: afterUserInfo.unit_count >= afterUserInfo.unit_max,
														item_list: [],
														gauge_info: {
															max_gauge_point: 100,
															gauge_point: afterUserInfo.secretbox_gauge,
															added_gauge_point: data.box[box].add_gauge*count
														},
														secret_box_page_id: data.box[box].page_id,
														secret_box_id: box,
														secret_box_info: boxInfo,
														secret_box_items: {
															unit: unitData,
															item: []
														},
														before_user_info: beforeUserInfo,
														after_user_info: afterUserInfo,
														next_free_muse_gacha_timestamp: Math.floor(Math.max((afterUserInfo.last_free_muse_gacha + 3600000)/1000,(Date.now()/1000)-3600)),
														next_free_aqours_gacha_timestamp: Math.floor(Math.max((afterUserInfo.last_free_aqours_gacha + 3600000)/1000,(Date.now()/1000)-3600))
													}
													
													console.log(JSON.stringify(result));
													defer.resolve({status: 200, result: result});
													
												});
										   });
										   
                                            
                                           
                                        }).catch(function(e){
                                          defer.reject({status: 403, result: {code: 20001, message: "Something Broke [3]"}});  
                                        });
                                        
                                    }).catch(function(e){
                                        console.log(e);
                                        defer.reject({status: 403, result: {code: 20001, message: "Something Broke [3]"}});
                                    });
                                    
                                    
                                    
                                }).catch(function(e){
                                    DB.run("user","DELETE FROM unit WHERE unit_owning_user_id IN (" + uuids.join(",") + ");",[]).then(function(){
                                        defer.reject({status: 403, result: {code: 20001, message: "Something Broke [2]"}});
                                    }).catch(function(e){
                                        defer.reject({status: 403, result: {code: 20001, message: "Something Broke [Free Cards Yo!?]"}});
                                    });                            
                                });

                            });                            
                        });
                        
                        
                        } catch (except){
                             defer.reject({status: 403, result: {code: 20001, message: "Something Broke"}});
                            console.log(except);
                        }
                    }else{
                        defer.reject({status: 403, result: {code: 20001, message: "You don't have the required items."}});
                    }
                }).catch(function(e){
                    if (e)console.log(e);
                    defer.reject({status: 403, result: {code: 20001, message: "Invalid [2]"}});
                });
                
            }else{
                 defer.reject({status: 403, result: {code: 20001, message: "Invalid [1]"}});
            }
            
            } catch (except){
                console.log(except);
            }
            
			
            
            return defer.promise;
		}
	},
	all: function(data){
		// {"module":"secretbox","action":"all","timeStamp":1480398839,"mgd":1,"commandNum":"60e5fb3e-a17f-43ec-8cf6-41c5dea413c5.1480398839.12"}
		// https://jsonblob.com/48121476-b5f8-11e6-871b-1f8181418de8
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			//That hardcoded secretbox stuff
			
			DB.first("user","SELECT unit_max, (SELECT count(*) FROM unit WHERE owner_id=users.user_id AND removed=0) as unit_count,secretbox_gauge,last_free_muse_gacha,last_free_aqours_gacha FROM users WHERE user_id=?",[user_id]).then(function(userData){
				
                var hasFreeMuseGacha = (userData.last_free_muse_gacha <= Date.now() - CONFIG.game.gacha.free_gacha_delay);
                var hasFreeAqoursGacha = (userData.last_free_aqours_gacha <= Date.now() - CONFIG.game.gacha.free_gacha_delay);

				DB.get("user","SELECT item_id, amount FROM item WHERE user_id=?",[user_id]).then(function(itemList){
					var result = {
						use_cache: 0,
						is_unit_max: userData.unit_count >= userData.unit_max,
						item_list: itemList,
						gauge_info: {
							max_gauge_point: 100,
							gauge_point: userData.secretbox_gauge
						},
						member_category_list: [
							{
								member_category: 1,
								tab_list: [
									{
										secret_box_tab_id: 1,
										title_img_asset: "assets/image/secretbox/tab/s_tab_01.png",
										title_img_se_asset: "assets/image/secretbox/tab/s_tab_01se.png",
										page_list: [
											{
												secret_box_page_id: 1,
												page_layout: 1,
												default_img_info: {
													banner_img_asset: "assets/image/secretbox/icon/s_ba_3_2.png",
													banner_se_img_asset: "assets/image/secretbox/icon/s_ba_3_2se.png",
													img_asset: "assets/image/secretbox/top/s_con_n_3_2.png",
													url: "/webview.php/secretBox/index?template_id=31&secret_box_id=2"
												},
												limited_img_info: [],
												effect_list: [],
												secret_box_list: [
													{
														secret_box_id: 1,
														name: "Regular Student Scouting",
														title_asset: null,
														description: "dummy",
														start_date: "2013-06-05 00:00:00",
														end_date: "2037-12-31 23:59:59",
														add_gauge: 0,
														multi_type: hasFreeMuseGacha?1:0,
														multi_count: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count)),
														is_pay_cost: true,
														is_pay_multi_cost: (!hasFreeMuseGacha),
														within_single_limit: 0,
														within_multi_limit: 0,
														cost: {
															priority: hasFreeMuseGacha?1:2,
															type: hasFreeMuseGacha?4:3,
															item_id: null,
															amount: hasFreeMuseGacha?1:100,
															multi_amount: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count))*100
														},
														pon_count: 0,
														pon_upper_limit: 0,
														display_type: 0
													},{
														secret_box_id: 2,
														name: "Honor Student Scouting",
														title_asset: null,
														description: "dummy",
														start_date: "2013-06-05 00:00:00",
														end_date: "2037-12-31 23:59:59",
														add_gauge: 10,
														multi_type: 1,
														multi_count: 11,
														is_pay_cost: userData.sns_coin>=5,
														is_pay_multi_cost: userData.sns_coin>=50,
														within_single_limit: 1,
														within_multi_limit: 1,
														cost: {
															priority: 3,
															type: 1,
															item_id: null,
															amount: 5,
															multi_amount: 50
														},
														pon_count: 0,
														pon_upper_limit: 0,
														display_type: 0
													}
												]
											}
										]
									}/*,{
										secret_box_tab_id: 3,
										title_img_asset: "assets/image/secretbox/tab/s_tab_03.png",
										title_img_se_asset: "assets/image/secretbox/tab/s_tab_03se.png",
										page_list: []
									}*/
								]
							},
							{
								member_category: 2,
								tab_list: [
									{
										secret_box_tab_id: 1,
										title_img_asset: "assets/image/secretbox/tab/s_tab_01.png",
										title_img_se_asset: "assets/image/secretbox/tab/s_tab_01se.png",
										page_list: [
											{
												secret_box_page_id: 32,
												page_layout: 1,
												default_img_info: {
													banner_img_asset: "assets/image/secretbox/icon/s_ba_62_2.png",
													banner_se_img_asset: "assets/image/secretbox/icon/s_ba_62_2se.png",
													img_asset: "assets/image/secretbox/top/s_con_n_62_2.png",
													url: "/webview.php/secretBox/index?template_id=31&secret_box_id=62"
												},
												limited_img_info: [],
												effect_list: [],
												secret_box_list: [
													/*{
														secret_box_id: 1,
														name: "Regular Scouting",
														title_asset: null,
														description: "dummy",
														start_date: "2013-06-05 00:00:00",
														end_date: "2037-12-31 23:59:59",
														add_gauge: 0,
														multi_type: 1,
														multi_count: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count)),
														is_pay_cost: userData.social_point>=100,
														is_pay_multi_cost: (!hasFreeMuseGacha && userData.social_point>=200),
														within_single_limit: 0,
														within_multi_limit: 0,
														cost: {
															priority: hasFreeMuseGacha?1:2,
															type: hasFreeMuseGacha?4:3,
															item_id: null,
															amount: hasFreeMuseGacha?1:100,
															multi_amount: Math.max(2,Math.min(10,userData.unit_max-userData.unit_count))*100
														},
														pon_count: 0,
														pon_upper_limit: 0,
														display_type: 0
													}*/
												]
											}
										
										
										
										]
									}
								]
							}
						]
					}
					
					defer.resolve({status: 200, result: result});
					
				}).catch(function(e){
					console.log(e);
					defer.reject({status: 403, result: {code: 20001, message: "Server Error [1]"}});
				});

			}).catch(function(e){
					console.log(e);
					defer.reject({status: 403, result: {code: 20001, message: "Server Error [0]"}});
				});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	pon: function(data){
        //https://jsonblob.com/dd247b4a-b724-11e6-871b-3972438bed3f
		var defer = q.defer();
		log.verbose(data);
        var m = this;
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
           m.COMMON.scout.apply(m,[user_id, data.secret_box_id, data.cost_priority, 1]).then(defer.resolve).catch(defer.reject);
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
    multi: function(data){
        var defer = q.defer();
        log.verbose(data);
        var m = this;
        COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
           m.COMMON.scout.apply(m,[user_id, data.secret_box_id, data.cost_priority, data.count]).then(defer.resolve).catch(defer.reject);
        }).catch(function(e){
            defer.reject(e);
        });
        return defer.promise;
    }
	
}