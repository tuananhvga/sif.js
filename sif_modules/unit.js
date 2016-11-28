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
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.get("user", "SELECT sis_id, amount, (SELECT COUNT(*) FROM sis_equip as e JOIN unit as u ON u.unit_owning_user_id = e.unit_owning_user_id WHERE u.owner_id=sis_owning.user_id AND e.sis_id = sis_owning.sis_id) as equip FROM sis_owning WHERE user_id=?",[user_id]).then(function(d){
				var owning = [];
				for (var i=0;i<d.length;i++){
					owning.push({
						unit_removable_skill_id: d[i].sis_id,
						total_amount: d[i].amount,
						equipped_amount: d[i].equip
					});
				}
				DB.get("user","SELECT sis_equip.unit_owning_user_id, sis_equip.sis_id FROM sis_equip JOIN unit ON unit.unit_owning_user_id=sis_equip.unit_owning_user_id WHERE unit.owner_id=?",[user_id]).then(function(equipInfo){
					var equip_info = {};
					equipInfo.forEachThen(function(equip, next){
						
						if (!equip_info[equip.unit_owning_user_id]){
							equip_info[equip.unit_owning_user_id] = {
								unit_owning_user_id: equip.unit_owning_user_id,
								detail: []
							};
						}
						equip_info[equip.unit_owning_user_id].detail.push({
							unit_removable_skill_id: equip.sis_id
						});

						next();
					},function(){
						defer.resolve({status: 200, result: {owning_info:owning,equipment_info:equip_info}});
					});
				});
			}).catch(console.log);
		}).catch(function(e){
			defer.reject(e);
		});
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
					DB.run("user","DELETE FROM sis_equip WHERE unit_owning_user_id IN (" + data.unit_owning_user_id.join(",") + ");",[]).then(function(){
						DB.run("user","DELETE FROM team_slot WHERE unit_owning_user_id IN (" + data.unit_owning_user_id.join(",") + ");",[]).then(function(){
							DB.run("user","UPDATE unit SET removed=1 WHERE owner_id=? AND unit_owning_user_id IN (" + data.unit_owning_user_id.join(",") + ");",[user_id]).then(function(){
								DB.run("user","UPDATE users SET game_coin = ? WHERE user_id = ?", [user_data.game_coin + saleValue, user_id]).then(function(){
									
									
									modules.unit.removableskillinfo(data).then(function(sis_info){
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
													owning_info: sis_info.result.owning_info
												}
											}
										});
									});
									
									
								}).catch(console.log);
							}).catch(console.log);
						}).catch(console.log);
					}).catch(console.log);
				}).catch(console.log);

			});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
		
	},
	merge: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			//{"module":"unit","unit_owning_user_ids":[182820128,182820127],"action":"merge","timeStamp":1480304749,"base_owning_unit_user_id":183636001,"mgd":2,"unit_support_list":[],"commandNum":"fd914565-36a6-42bc-b771-b8cf3fab7ff8.1480304749.7"}
			//https://jsonblob.com/5431d60e-b51d-11e6-871b-e74150dd9cfc
			defer.reject({status: 403, result: {code: 20001, message: "Not Ready"}});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	removableskillequipment: function(data){
		//{"module":"unit","remove":[],"action":"removableSkillEquipment","timeStamp":1480305009,"equip":[{"unit_removable_skill_id":2,"unit_owning_user_id":183636001}],"mgd":2,"commandNum":"fd914565-36a6-42bc-b771-b8cf3fab7ff8.1480305009.7"}
		//{"module":"unit","remove":[{"unit_removable_skill_id":2,"unit_owning_user_id":183636001}],"action":"removableSkillEquipment","timeStamp":1480307483,"equip":[],"mgd":2,"commandNum":"fd914565-36a6-42bc-b771-b8cf3fab7ff8.1480307483.7"}
		//Return Blank
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			try {
				log.verbose("Remove");
				data.remove.forEachThen(function(removeSIS, next){
					log.verbose("Remove: " + JSON.stringify(removeSIS));
					if (typeof removeSIS.unit_owning_user_id === "number" && parseInt(removeSIS.unit_owning_user_id) === removeSIS.unit_owning_user_id){
						DB.first("user","SELECT owner_id, unit_owning_user_id FROM unit WHERE owner_id=? AND unit_owning_user_id=? AND removed=0",[user_id, removeSIS.unit_owning_user_id]).then(function(ownerCheck){
							if (ownerCheck){
								DB.run("user","DELETE FROM sis_equip WHERE unit_owning_user_id=? AND sis_id=?;",[removeSIS.unit_owning_user_id, removeSIS.unit_removable_skill_id]).then(function(){
									next();
								}).catch(console.log);
							}else{
								defer.reject({status: 403, result: {code: 20001, message: "You don't own that card."}});
							}
						}).catch(console.log);;
					}else{
						defer.reject({status: 403, result: {code: 20001, message: "Invalid Unit ID"}});
					}
				},function(){

					modules.unit.removableskillinfo(data).then(function(removableSkillInfo){
						var availableSkills = {};
						for(var i=0;i<removableSkillInfo.result.owning_info.length;i++){
							availableSkills[removableSkillInfo.result.owning_info[i].unit_removable_skill_id] = removableSkillInfo.result.owning_info[i].total_amount - removableSkillInfo.result.owning_info[i].equipped_amount;
						}
						
						console.log(availableSkills);
						log.verbose("Equip");
						DB.get("game_unit","SELECT unit_removable_skill_id, size FROM unit_removable_skill_m",[]).then(function(costData){
							var skillCosts = {};
							for (var i=0;i<costData.length;i++){
								skillCosts[costData.unit_removable_skill_id] = costData.size;
							}
							
							
							data.equip.forEachThen(function(equipSIS, next){
								log.verbose("Equip: " + JSON.stringify(equipSIS));
								if (!costData[equipSIS.unit_removable_skill_id]){
									defer.reject({status: 403, result: {code: 20001, message: "Invalid Skill ID"}});
									return;
								}
								DB.first("user","SELECT owner_id, unit_owning_user_id, unit_removable_skill_capacity FROM unit WHERE owner_id=? AND unit_owning_user_id=? AND removed=0",[user_id, equipSIS.unit_owning_user_id]).then(function(cardCheck){
									if (cardCheck){
										var spaceAvailable = cardCheck.unit_removable_skill_capacity+0;
										DB.get("user","SELECT sis_id FROM sis_equip WHERE unit_owning_user_id=?",[equipSIS.unit_owning_user_id]).then(function(currentEquips){
											for(var i=0;i<currentEquips.length;i++){
												if (costData[currentEquips[i].sis_id]){
													spaceAvailable -= costData[currentEquips[i].sis_id];
												}
											}
											
											if (spaceAvailable < costData[equipSIS.unit_removable_skill_id]){
												defer.reject({status: 403, result: {code: 20001, message: "Not Enough Space"}});
												return;
											}
											
											DB.run("user","INSERT OR REPLACE INTO sis_equip VALUES (?, ?)",[equipSIS.unit_owning_user_id, equipSIS.unit_removable_skill_id]).then(function(){
												next();
											}).catch(console.log);
										});
										
										
									}else{
										defer.reject({status: 403, result: {code: 20001, message: "Invalid Card"}});
									}
								});
							},function(){
								defer.resolve({status: 200, result: []});
								log.debug("Done");
							})
							
							
						});
						
					});
					
					
				});
			} catch (e){
				console.log(e);
				log.error(e.message);
				defer.resolve({status: 200, result: []});
			}
			
			
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
	},
	exchangepointrankup: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.reject({status: 403, result: {code: 20001, message: "Not Ready"}});
		return defer.promise;
	},
	rankup: function(data){
		//{"module":"unit","unit_owning_user_ids":[184004594],"action":"rankUp","timeStamp":1480333449,"base_owning_unit_user_id":184004597,"mgd":1,"commandNum":"fd914565-36a6-42bc-b771-b8cf3fab7ff8.1480333449.21"}
		// https://jsonblob.com/3e85c2b8-b560-11e6-871b-f31b6dcdf883
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
		  
		  if (typeof data.base_owning_unit_user_id === "number" && parseInt(data.base_owning_unit_user_id) == data.base_owning_unit_user_id){
			var unit_main = data.base_owning_unit_user_id;
			if (typeof data.unit_owning_user_ids === "object" && Array.isArray(data.unit_owning_user_ids) && data.unit_owning_user_ids.length == 1){
			  var unit_sacrifice = data.unit_owning_user_ids[0];
			  if (typeof unit_sacrifice === "number" && parseInt(unit_sacrifice) === unit_sacrifice){
				
				//Check Cards
				
				DB.get("user","SELECT unit_owning_user_id, unit_id,exp,next_exp,level,max_level,love,max_love,unit_skill_exp,unit_skill_level,max_hp,display_rank,unit_removable_skill_capacity, rank, favorite_flag, max_rank FROM unit WHERE owner_id=? AND removed=0 AND unit_owning_user_id IN (?,?)",[user_id,unit_main, unit_sacrifice]).then(function(unitData){
				  
				  var mainData = null;
				  var sacrificeData = null;
				  
				  console.log(unit_main, unit_sacrifice);
				  console.log(unitData);
				  
				  if (unitData.length == 2){
					if (unitData[0].unit_owning_user_id == unit_main && unitData[1].unit_owning_user_id == unit_sacrifice){
					  mainData = unitData[0];
					  sacrificeData = unitData[1];
					}else if (unitData[1].unit_owning_user_id == unit_main && unitData[0].unit_owning_user_id == unit_sacrifice){
					  mainData = unitData[1];
					  sacrificeData = unitData[0];
					}else{
					  defer.reject({status: 403, result: {code: 20001, message: "You don't own those cards [2]"}});
					  return;
					}
					
					//Check Same unit id
					if (mainData.unit_id == sacrificeData.unit_id){
					  //Check Sacrifice can be sacrificed.
					  if (sacrificeData.favorite_flag == 0){
						
						//Check Main Team
						DB.get("user","SELECT main FROM team_slot JOIN team ON team.team_id=team_slot.team_id AND team.user_id=team_slot.user_id WHERE unit_owning_user_id=? AND main=1",[unit_sacrifice]).then(function(mainTeamCheck){
						  if (mainTeamCheck.length == 0){
							DB.first("game_unit","SELECT max_removable_skill_capacity,rank_up_cost,after_love_max,after_level_max,disable_rank_up FROM unit_m WHERE unit_id=?",mainData.unit_id).then(function(unitData){
							  if (unitData){
								if (unitData.disable_rank_up == 0){
								  if (mainData.unit_removable_skill_capacity < unitData.max_removable_skill_capacity || mainData.rank < mainData.max_rank){
									//Afford Cost
									DB.first("user","SELECT level,exp,game_coin,sns_coin,social_point,unit_max,energy_max,friend_max,tutorial_state,energy_full_time,over_max_energy FROM users WHERE user_id=?",[user_id]).then(function(userData){
									  if (userData.game_coin >= unitData.rank_up_cost){
										var newSkillCapacity = Math.min(mainData.unit_removable_skill_capacity+(mainData.rank>=mainData.max_rank?2:1),unitData.max_removable_skill_capacity); 
										DB.run("user","UPDATE unit SET rank=?,display_rank=?,unit_removable_skill_capacity=?,max_love=?,max_level=? WHERE unit_owning_user_id=?",[mainData.max_rank, mainData.max_rank, newSkillCapacity, unitData.after_love_max, unitData.after_level_max,unit_main]).then(function(){
										  
										  //Remove Sacrifice from all teams
										  DB.run("user","DELETE FROM team_slot WHERE unit_owning_user_id=?",[unit_sacrifice]).then(function(){
											//Remove all Removable skills from sacrifice
											return DB.run("user","DELETE FROM sis_equip WHERE unit_owning_user_id=?",[unit_sacrifice]);
										  }).then(function(){
											//Remove Unit
											return DB.run("user","UPDATE unit SET removed=1 WHERE unit_owning_user_id=?",[unit_sacrifice]);
										  }).then(function(){
											return DB.run("user","UPDATE users SET game_coin=? WHERE user_id=?",[(userData.game_coin-unitData.rank_up_cost),user_id]);
										  }).then(function(){
											return DB.run("user","UPDATE album SET rank_max_flag=1 WHERE unit_id=? AND user_id=?",[mainData.unit_id,user_id]);
										  }).then(function(){
											  
											var result = {
											  before: {
												unit_owning_user_id: unit_main,
												unit_id: mainData.unit_id,
												exp: mainData.exp,
												next_exp: mainData.next_exp,
												level: mainData.level,
												max_level: mainData.max_level,
												rank: mainData.rank,
												max_rank: mainData.max_rank,
												love: mainData.love,
												max_love: mainData.max_love,
												unit_skill_exp: mainData.unit_skill_exp,
												unit_skill_level: mainData.unit_skill_level,
												max_hp: mainData.max_hp,
												unit_removable_skill_capacity: mainData.unit_removable_skill_capacity,
												favorite_flag: mainData.favorite_flag==1,
												display_rank: mainData.display_rank,
												is_rank_max: mainData.rank>=mainData.max_rank,
												is_love_max: mainData.love>=mainData.max_love,
												is_level_max: mainData.level>=mainData.max_level
											  },
											  after: {
												unit_owning_user_id: unit_main,
												unit_id: mainData.unit_id,
												exp: mainData.exp,
												next_exp: mainData.next_exp,
												level: mainData.level,
												max_level: unitData.after_level_max,
												rank: mainData.max_rank,
												max_rank: mainData.max_rank,
												love: mainData.love,
												max_love: unitData.after_love_max,
												unit_skill_exp: mainData.unit_skill_exp,
												unit_skill_level: mainData.unit_skill_level,
												max_hp: mainData.max_hp,
												unit_removable_skill_capacity: newSkillCapacity,
												favorite_flag: mainData.favorite_flag==1,
												display_rank: mainData.max_rank,
												is_rank_max: true,
												is_love_max: mainData.love>=unitData.after_love_max,
												is_level_max: mainData.level>=unitData.after_level_max
											  },
											  before_user_info: {
												level: userData.level,
												exp: userData.exp,
												previous_exp: 0,
												next_exp: (3*userData.level) + (3*(userData.level-1)),
												game_coin: userData.game_coin,
												sns_coin: userData.sns_coin,
												social_point: userData.social_point,
												unit_max: userData.unit_max,
												energy_max: userData.energy_max,
												friend_max: userData.friend_max,
												tutorial_state: userData.tutorial_state,
												energy_full_time: COMMON.unixToDateString(userData.energy_full_time),
												over_max_energy: userData.over_max_energy,
												unlock_random_live_muse: 1,
												unlock_random_live_aqours: 1
											  },
											  after_user_info: {
												level: userData.level,
												exp: userData.exp,
												previous_exp: 0,
												next_exp: (3*userData.level) + (3*(userData.level-1)),
												game_coin: (userData.game_coin - unitData.rank_up_cost),
												sns_coin: userData.sns_coin,
												social_point: userData.social_point,
												unit_max: userData.unit_max,
												energy_max: userData.energy_max,
												friend_max: userData.friend_max,
												tutorial_state: userData.tutorial_state,
												energy_full_time: COMMON.unixToDateString(userData.energy_full_time),
												over_max_energy: userData.over_max_energy,
												unlock_random_live_muse: 1,
												unlock_random_live_aqours: 1
											  },
											  use_game_coin: unitData.rank_up_cost,
											  open_subscenario_id: null,
											  get_exchange_point_list: [],
											  unit_removable_skill: {}
											}
											modules.unit.removableskillinfo(data).then(function(removableSkillInfo){
												result.unit_removable_skill.owning_info = removableSkillInfo.result.owning_info;
												
												defer.resolve({status: 200, result: result});
												
											});

											
										  }).catch(function(e){
											console.log(e);
											defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.6]"}});
										  });

										}).catch(function(e){
										  defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.5]"}});
										});
									  
									  }else{
										defer.reject({status: 403, result: {code: 20001, message: "Can't Affort RankUp"}});
									  }
									}).catch(function(e){
									  defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.4]"}});
									});
								  }else{
									defer.reject({status: 403, result: {code: 20001, message: "Card Already Max"}});
								  }
								}else{
								  defer.reject({status: 403, result: {code: 20001, message: "Card cannot rankup."}});
								}
							  }else{
								defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.3]"}});
							  }
							}).catch(function(e){
							  defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.2]"}});
							});
						  }else{
							defer.reject({status: 403, result: {code: 20001, message: "Can't sacrifice card from main team."}});
						  }
						});
					  }else{
						defer.reject({status: 403, result: {code: 20001, message: "Can't sacrifice a favorite Card"}});
					  }
					}else{
					  defer.reject({status: 403, result: {code: 20001, message: "Cards must be same."}});
					}
				  }else{
					defer.reject({status: 403, result: {code: 20001, message: "You don't own those cards [1]"}});
				  }
				}).catch(function(e){
				  defer.reject({status: 403, result: {code: 20001, message: "Server Error [unit.rankup.1]"}});
				});            
			  }else{
				defer.reject({status: 403, result: {code: 20001, message: "Invalid Sacrifice Unit ID"}});
			  }
			}else{
			  defer.reject({status: 403, result: {code: 20001, message: "Invalid Sacrifice Array"}});
			}        
		  }else{
			defer.reject({status: 403, result: {code: 20001, message: "Invalid Base Unit ID"}});
		  }
		}).catch(function(e){
		  defer.reject(e);
		});
		return defer.promise;
	}
	
	
}