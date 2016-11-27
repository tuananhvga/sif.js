{
	unitall: function(data){
		//		https://jsonblob.com/dde46c8b-b3c6-11e6-871b-b1f2ac4f0587
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.get("user","SELECT * FROM unit WHERE owner_id=? AND removed=0",[user_id]).then(function(d){
				
				var list = [];
				
				for(var i=0;i<d.length;i++){
					var u = d[i];
					list.push({
						unit_owning_user_id: u.unit_owning_user_id,
						unit_id: u.unit_id,
						exp: u.exp,
						next_exp: u.next_exp,
						level: u.level,
						max_level: u.max_level,
						rank: u.rank,
						max_rank: u.max_rank,
						love: u.love,
						max_love: u.max_love,
						unit_skill_level: u.unit_skill_level,
						unit_skill_exp: u.unit_skill_exp,
						max_hp: u.max_hp,
						unit_removable_skill_capacity: u.unit_removable_skill_capacity,
						favorite_flag: u.favorite_flag==1,
						display_rank: u.display_rank,
						is_rank_max: u.rank>=u.max_rank,
						is_love_max: u.love>=u.max_love,
						is_level_max: u.level>=u.max_level,
						is_skill_level_max: (u.unit_skill_level==0||u.unit_sill_level>=8),
						insert_date: COMMON.unixToDateString(Math.floor(Date.now()/1000))
					});
				}
				defer.resolve({status:200, result: list});
			}).catch(function(e){
				defer.reject(e);
			});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	deckinfo: function(data){
		// https://jsonblob.com/e99b5bff-b3c9-11e6-871b-332a48815b98
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
		
			DB.get("user","SELECT team_name,team.team_id,slot_id,unit_owning_user_id,main FROM team_slot JOIN team ON team_slot.team_id = team.team_id AND team_slot.user_id = team.user_id WHERE team.user_id=?",[user_id]).then(function(d){
				var teams = [];
				
				for(var i=0;i<d.length;i++){
					var s = d[i];
					if (!teams[s.team_id]){
						teams[s.team_id] = {
							unit_deck_id: s.team_id,
							main_flag: s.main==1,
							deck_name: s.team_name,
							unit_owning_user_ids: []
						};
					}
					
					teams[s.team_id].unit_owning_user_ids.push({
						position: s.slot_id,
						unit_owning_user_id: s.unit_owning_user_id
					});
				}
				
				defer.resolve({status: 200, result: teams.filter(Boolean)});
				
				
				
				
			});
		
		}).catch(function(e){
			defer.reject(e);
		});
		
		return defer.promise;
	},
	supporterall: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {unit_support_list:[]}});
		
		return defer.promise;
	},
	removableskillinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {owning_info:[],equipment_info:[]}});
		
		return defer.promise;
	},
	favorite: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			//{"module":"unit","action":"favorite","timeStamp":1480216228,"mgd":2,"favorite_flag":1,"unit_owning_user_id":180943775,"commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480216228.8"}
			
			if (data.favorite_flag == 1 || data.favorite_flag == 0){
				DB.first("user","SELECT unit_owning_user_id FROM unit WHERE unit_owning_user_id=? AND owner_id=?",[data.unit_owning_user_id, user_id]).then(function(d){
					if (d){
						DB.run("user","UPDATE unit SET favorite_flag=? WHERE unit_owning_user_id=? AND owner_id=?",[data.favorite_flag, d.unit_owning_user_id, user_id]).then(function(){
							defer.resolve({status:200, result: []});
						}).catch(function(d){
							defer.reject({status: 403, result: {code: 20001, message: ""}});
						});
					}else{
						defer.reject({status: 403, result: {code: 20001, message: ""}});
					}
				}).catch(function(e){
					defer.reject({status: 403, result: {code: 20001, message: ""}});
				});
			}else{
				defer.reject({status: 403, result: {code: 20001, message: ""}});
			}
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
	},
	deck: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			var hasMainTeam = false;
			var MainTeamID = 1;
			for(let i=0;i<data.unit_deck_list.length;i++){
				var t = data.unit_deck_list[i];
				console.log(t);
				if (t.main_flag == 1){
					if (hasMainTeam == false){
						if (t.unit_deck_detail.length == 9){
							hasMainTeam = true;
							MainTeamID = t.unit_deck_id;
						}
					}else{
						defer.reject({status: 403, result: {code: 20001, message: "Multiple Main Teams"}});
						return;
					}
				}				
			}
			if (!hasMainTeam){
				defer.reject({status: 403, result: {code: 20001, message: "No Main Team"}});
				return;
			}
			
			var allCardsUsed = [];
			var cardsToInsert = [];
			for(let i=0;i<data.unit_deck_list.length;i++){
				var t = data.unit_deck_list[i];
				
				if (t.deck_name.length > 10){
					defer.reject({status: 403, result: {code: 20001, message: "Invalid Team Name"}});
					return;
				}
				
				if ([1,2,3,4,5,6,7,8,9].indexOf(t.unit_deck_id)<0){
					defer.reject({status: 403, result: {code: 20001, message: "Invalid Team ID"}});
					return;
				}
				
				var positionsUsed = [];
				var cardsUsed = [];
				for (let j=0;j<t.unit_deck_detail.length;j++){
					//For each Card on Team
					var c = t.unit_deck_detail[j];
					if ([1,2,3,4,5,6,7,8,9].indexOf(c.position)>=0){
						if (positionsUsed.indexOf(c.position) < 0){
							positionsUsed.push(c.position);
							if (typeof c.unit_owning_user_id === "number" && parseInt(c.unit_owning_user_id) === c.unit_owning_user_id){
								if (cardsUsed.indexOf(c.unit_owning_user_id) < 0){
									cardsUsed.push(c.unit_owning_user_id);
									cardsToInsert.push({
										team_id: t.unit_deck_id,
										slot_id: c.position,
										card_id: c.unit_owning_user_id
									});
									if (allCardsUsed.indexOf(c.unit_owning_user_id)<0){
										allCardsUsed.push(c.unit_owning_user_id);
									}
								}else{
									defer.reject({status: 403, result: {code: 20001, message: "Duplicate Card on a Team"}});
									return;
								}
							}else{
								defer.reject({status: 403, result: {code: 20001, message: "Invalid Card ID"}});
							}
						}else{
							defer.reject({status: 403, result: {code: 20001, message: "Duplicate Position"}});
							return;
						}
						
					}else{
						defer.reject({status: 403, result: {code: 20001, message: "Team contains an invalid position."}});
						return;
					}
				}				
			}
			
			DB.get("user","SELECT unit_owning_user_id FROM unit WHERE owner_id=? AND removed=0 AND unit_owning_user_id IN (" + allCardsUsed.join(",") + ")",[user_id]).then(function(d){
				if (d.length == allCardsUsed.length){
					
					var setTeamData = function(index, callback){
						if (data.unit_deck_list.length > index){
							var t = data.unit_deck_list[index];
							
							DB.run("user","INSERT OR REPLACE into team VALUES (?, ?, ?, ?)",[user_id, t.unit_deck_id, t.deck_name, t.main_flag]).then(function(){
								setTeamData(index+1, callback);
							}).catch(function(e){
								console.log(e);
								defer.reject({status: 403, result: {code: 20001, message: "Server Error"}});
								return;
							});
						}else{
							callback();
						}
						
					}
					
					setTeamData(0, function(){
						DB.run("user","DELETE from team_slot WHERE user_id=?",[user_id]).then(function(){
							
							var query = "INSERT OR REPLACE INTO team_slot VALUES ";
							
							for (var i=0;i<cardsToInsert.length;i++){
								var c = cardsToInsert[i];
								if (i!=0){ query += ",\n"; }
								query += `(${user_id}, ${c.team_id}, ${c.slot_id}, ${c.card_id})`;
							}
							query += ";";
							
							DB.run("user",query,[]).then(function(){
								defer.resolve({status: 200, result: []});
							}).catch(function(e){
								defer.reject({status: 403, result: {code: 20001, message: "Good Luck, New Account Time 2"}});
							});
							
							
							
						}).catch(function(e){
							defer.reject({status: 403, result: {code: 20001, message: "Good Luck, New Account Time"}});
						});
						
					});
				}else{
					defer.reject({status: 403, result: {code: 20001, message: "Invalid Cards on Team"}});
				}
			}).catch(function(e){
				console.log(e);
				defer.reject({status: 403, result: {code: 20001, message: "Server Error"}});
			});
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
	},
	sale: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			//{"module":"unit","action":"sale","timeStamp":1480265333,"mgd":2,"unit_support_list":[],"unit_owning_user_id":[183071223],"commandNum":"fd914565-36a6-42bc-b771-b8cf3fab7ff8.1480265333.7"}
			console.log(data.unit_owning_user_id);
			
			if (data.unit_owning_user_id.length > 50){
				defer.reject({status: 403, result: {code: 20001, message: "Too Many Units"}});
				return;
			}
			
			//Check All Valid Number
			for (var i=0;i<data.unit_owning_user_id.length;i++){
				if (!(typeof data.unit_owning_user_id[i] === "number" && parseInt(data.unit_owning_user_id[i])===data.unit_owning_user_id[i])){
					defer.reject({status: 403, result: {code: 20001, message: "Invalid Unit ID"}});
					return;
				}
			}
			
			//Check Duplicates
			if (data.unit_owning_user_id.length != data.unit_owning_user_id.uniqueValues().length){
				defer.reject({status: 403, result: {code: 20001, message: "Duplicate Unit ID"}});
				return;
			}

			var saleValue = 0;
			var saleDetail = [];
			var seals = {r: 0, sr: 0, ssr: 0, ur: 0};
			
			data.unit_owning_user_id.forEachThen(function(unit_owning_user_id,next){
				//Check Ownership
				DB.first("user","SELECT unit_id, level FROM unit WHERE unit_owning_user_id=? AND owner_id=?",[unit_owning_user_id, user_id]).then(function(cardData){
					if (cardData){
						//Check Main Team
						DB.first("user","SELECT main FROM team_slot JOIN team ON team_slot.team_id=team.team_id AND team_slot.user_id=team.user_id WHERE team_slot.user_id=? AND unit_owning_user_id=? AND main=1",[user_id, unit_owning_user_id]).then(function(mainCheck){
							if (!mainCheck){
								DB.first("game_unit","SELECT sale_price FROM unit_m as u JOIN unit_level_up_pattern_m as l ON u.unit_level_up_pattern_id=l.unit_level_up_pattern_id WHERE unit_id=? AND unit_level=?",[cardData.unit_id,cardData.level]).then(function(salePriceData){
									if (salePriceData){
										saleValue += salePriceData.sale_price;
										saleDetail.push({
											unit_owning_user_id: unit_owning_user_id,
											unit_id: cardData.unit_id,
											price: salePriceData.sale_price
										});
										next();
									}else{
										log.error("No Price found for " + cardData.unit_id + "@LvL" + cardData.level);
										defer.reject({status: 403, result: {code: 20001, message: "No Price Found?"}});
									}
								});
							}else{
								defer.reject({status: 403, result: {code: 20001, message: "Can't Sell Unit on Main Team"}});
							}
						}).catch(function(e){
							console.log(e);
							defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.sale.1]"}});
						});
					}else{
						defer.reject({status: 403, result: {code: 20001, message: "Can't Sell Unit You don't Own"}});
					}
				});
			},function(){
		
				log.verbose("Total Sale Value: " + saleValue);
				DB.first("user","SELECT level, exp, game_coin, sns_coin, social_point, unit_max, energy_max, friend_max FROM users WHERE user_id=?",[user_id]).then(function(user_data){
					DB.run("user","DELETE FROM team_slot WHERE unit_owning_user_id IN (" + data.unit_owning_user_id.join(",") + ");",[]).then(function(){
						DB.run("user","UPDATE unit SET removed=1 WHERE owner_id=? AND unit_owning_user_id IN (" + data.unit_owning_user_id.join(",") + ");",[user_id]).then(function(){
							DB.run("user","UPDATE users SET game_coin = ? WHERE user_id = ?", [user_data.game_coin + saleValue, user_id]).then(function(){
								defer.resolve({
									status: 200,
									result: {
										total: saleValue,
										detail: saleDetail,
										before_user_info: {
											level: user_data.level,
											exp: user_data.exp,
											next_exp: (3*user_data.level) + (3*(user_data.level-1)),
											game_coin: user_data.game_coin,
											sns_coin: user_data.sns_coin,
											social_point: user_data.social_point,
											unit_max: user_data.unit_max,
											energy_max: user_data.energy_max,
											friend_max: user_data.friend_max
										},
										after_user_info: {
											level: user_data.level,
											exp: user_data.exp,
											next_exp: (3*user_data.level) + (3*(user_data.level-1)),
											game_coin: user_data.game_coin + saleValue,
											sns_coin: user_data.sns_coin,
											social_point: user_data.social_point,
											unit_max: user_data.unit_max,
											energy_max: user_data.energy_max,
											friend_max: user_data.friend_max
										},
										reward_box_flag: false,
										get_exchange_point_list: [],
										unit_removable_skill: {
											owning_info: []
										}
									}
								})
							}).catch(console.log);
						}).catch(console.log);
					}).catch(console.log);
				}).catch(console.log);

			});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
		
	}
	
	
}