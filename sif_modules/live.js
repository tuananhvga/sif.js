{
	livestatus: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.get("game_live_notes","SELECT DISTINCT live_difficulty_id FROM live_note", []).then(function(d){
				
				var ldid_array = [];
				for (var i=0;i<d.length;i++){
					ldid_array.push(d[i].live_difficulty_id);
				}
				
				var result = {
					normal_live_status_list: [],
					special_live_status_list: [],
					marathon_live_status_list: []
				}
				
				DB.get("game_live","SELECT * FROM (SELECT live_difficulty_id,1 as type FROM normal_live_m UNION SELECT live_difficulty_id, 2 as type FROM special_live_m) WHERE live_difficulty_id IN (" + ldid_array.join(",") + ")",[]).then(function(live_datax){
					var live_data = {};
					for (var i=0;i<live_datax.length;i++){
						live_data[live_datax[i].live_difficulty_id] = live_datax[i].type;
					}
					DB.get("user","SELECT * FROM live_status WHERE user_id=?",[user_id]).then(function(live_status_datax){
						var live_status_data = {};
						for (var i=0;i<live_status_datax.length;i++){
							live_status_data[live_status_datax[i].live_difficulty_id] = live_status_datax[i];
						}
						console.log(live_status_data);
						var n = function(list, callback){
							var next = list.shift();
							if (!next){ callback(); }
							if (live_data[next.live_difficulty_id]){
								live_status_data[next.live_difficulty_id] = live_status_data[next.live_difficulty_id] || {};
								var live = {
									live_difficulty_id: next.live_difficulty_id,
									status: live_status_data[next.live_difficulty_id].status || 1,
									hi_score: live_status_data[next.live_difficulty_id].hi_score || 0,
									hi_combo_count: live_status_data[next.live_difficulty_id].hi_combo_count || 0,
									clear_cnt: live_status_data[next.live_difficulty_id].clear_cnt || 0,
									achieved_goal_id_list: []
								}
								console.log(live);
								if (live_data[next.live_difficulty_id] == 1){
									result.normal_live_status_list.push(live);
								}else{
									result.special_live_status_list.push(live);
								}
							}
							n(list,callback);
						}
						
						n(d, function(){
							defer.resolve({status: 200, result: result});
						});
							
							
						}).catch(function(e){
							defer.reject(e);
						});
							
							
						}).catch(defer.reject);
					
			}).catch(defer.reject);			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	schedule: function(data){
		var defer = q.defer();
		log.verbose(data);
		DB.get("game_live_notes","SELECT DISTINCT live_difficulty_id FROM live_note", []).then(function(d){
				var ldid_array = [];
				for (var i=0;i<d.length;i++){
					ldid_array.push(d[i].live_difficulty_id);
				}
				
				var live_list = [];
				
				DB.get("game_live","SELECT * FROM (SELECT live_difficulty_id,1 as type FROM normal_live_m UNION SELECT live_difficulty_id, 2 as type FROM special_live_m) WHERE live_difficulty_id IN (" + ldid_array.join(",") + ")",[]).then(function(live_data){
					for (var i=0;i<live_data.length;i++){
						if (live_data[i].type == 2){
							
							live_list.push({
								live_difficulty_id: live_data[i].live_difficulty_id,
								start_date: "2015-11-27 00:00:00",
								end_date: "2030-11-27 23:59:59",
								is_random: false,
								dangerous: false,
								use_quad_point: false
							});
							defer.resolve({status: 200, result: {
								event_list: [],
								live_list: live_list,
								limited_bonus_list: [],
								random_live_list: [
									{attribute_id: 1, start_date: "2015-11-27 00:00:00", end_date: "2030-11-27 23:59:59"},
									//{attribute_id: 2, start_date: "2015-11-27 00:00:00", end_date: "2030-11-27 23:59:59"},
									//{attribute_id: 3, start_date: "2015-11-27 00:00:00", end_date: "2030-11-27 23:59:59"}
								]
							}});
						}
					}
				}).catch(defer.reject);
		}).catch(defer.reject);

		return defer.promise;
		
	},
	partylist: function(data){
		// {"module":"live","action":"partyList","timeStamp":1480223525,"mgd":1,"live_difficulty_id":"1","commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480223525.7"}
		// https://jsonblob.com/1f458b3b-b460-11e6-871b-db5103c765c1
		
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.get("game_live_notes","SELECT DISTINCT live_difficulty_id FROM live_note WHERE live_difficulty_id=?", [data.live_difficulty_id]).then(function(d){
				if (d){
					var friends = [];
				
					//Get 3 Randoms
					
					DB.get("user","SELECT \
										users.user_id, users.name, users.level, \
										unit.unit_owning_user_id,  unit_id, unit.exp as unit_exp, unit.next_exp, unit.level as unit_level, unit.max_level, \
										unit.rank, unit.max_rank, unit.love, unit.max_love, unit.unit_skill_level, unit.max_hp, unit.favorite_flag, unit.display_rank, unit.unit_skill_exp, \
										unit.unit_removable_skill_capacity, users.award_id, unit.attribute, unit.stat_smile, unit.stat_pure, unit.stat_cool, 0 as friend_status \
									FROM users \
										JOIN team ON users.user_id=team.user_id AND team.main=1 \
										JOIN team_slot ON team.team_id AND team_slot.slot_id=5  AND team_slot.user_id=users.user_id\
										JOIN unit ON team_slot.unit_owning_user_id=unit.unit_owning_user_id\
									WHERE users.user_id != ? \
									ORDER BY random()\
									LIMIT 3",[user_id]).then(function(d){
										console.log(d);
										for(var i=0;i<d.length;i++){
											friends.push(d[i]);
										}
										var party_list = [];
										var party_ids = [];
										for (var i=0;i<friends.length;i++){
											var f = friends[i];
											if (party_ids.indexOf(f.user_id)<0){
												party_ids.push(f.user_id);
												party_list.push({
													user_info: {
														user_id: f.user_id,
														name: f.name,
														level: f.level
													},
													center_unit_info: {
														unit_id: f.unit_id,
														love: f.love,
														level: f.unit_level,
														smile: f.stat_smile,
														cute: f.stat_pure,
														cool: f.stat_cool,
														rank: f.rank,
														display_rank: f.display_rank,
														is_rank_max: f.rank >= f.max_rank,
														is_love_max: f.love >= f.max_love,
														is_level_max: f.unit_level >= f.max_level,
														unit_skill_exp: f.unit_skill_exp,
														unit_removable_skill_capacity: f.unit_removable_skill_capacity,
														max_hp: f.max_hp,
														removable_skill_ids: [],
														exp: f.unit_exp
													},
													setting_award_id: f.award_id,
													available_social_point: 5 + (f.friend_status*5),
													friend_status: f.friend_status
												});
											
											}
										}
										defer.resolve({status: 200, result: {party_list: party_list}});
									}).catch(function(e){
										defer.reject({status: 403, result: {code: 20001, message: ""}});
									});

				}else{
					defer.reject({status: 403, result: {code: 20001, message: ""}});
				}
				
				
				
				
				
			}).catch(defer.reject);
			
			
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	play: function(data){
	
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.run("user","DELETE FROM live_progress WHERE user_id=?",[user_id]).then(function(){
				
				DB.get("game_live_notes", "SELECT timing_sec, notes_attribute, notes_level, effect, effect_value, position FROM live_note WHERE live_difficulty_id=?",[data.live_difficulty_id]).then(function(note_list){
					
					if (note_list.length >= 1){
						DB.get("user","SELECT slot_id,unit_id,stat_smile,stat_pure,stat_cool, max_hp,attribute, love FROM team_slot as s JOIN unit as u ON u.unit_owning_user_id=s.unit_owning_user_id WHERE user_id=? AND team_id=?;",[user_id, data.unit_deck_id]).then(function(team_data){
							
							if (team_data.length != 9){
								defer.reject({status: 403, result: {code: 20001, message: "Illegal Team"}});
								return;
							}
							
							DB.first("game_live","\
								SELECT live_difficulty_id, l.live_setting_id, l.type, s.c_rank_score,s.b_rank_score,s.a_rank_score,s.s_rank_score,s.notes_speed FROM (\
									SELECT live_difficulty_id,1 as type,live_setting_id FROM normal_live_m UNION \
									SELECT live_difficulty_id, 2 as type, live_setting_id FROM special_live_m) as l\
								INNER JOIN live_setting_m as s on s.live_setting_id = l.live_setting_id\
								WHERE live_difficulty_id = ?",[data.live_difficulty_id]).then(function(live_data){
										//Calculate Total Stats
										var hp = 0;
										var smile = 0;
										var pure = 0;
										var cool = 0;
										
										for (var i=0;i<team_data.length;i++){
											hp+=team_data[i].max_hp;
											smile+=team_data[i].stat_smile;
											pure+=team_data[i].stat_pure;
											cool+=team_data[i].stat_cool;
											if (team_data[i].attribute == 1){
												smile += team_data[i].love;
											}
											if (team_data[i].attribute == 1){
												pure += team_data[i].love;
											}
											if (team_data[i].attribute == 3){
												cool += team_data[i].love;
											}
										}
										
										//TODO: Center Bonus
										//TODO: Extra Center Bonus
										//TODO: Center Bonus from Friend
										//TODO: Extra Center Bonus from Friend
										//TODO: Extra for Removable Skills
										
										var result = {
											rank_info: [
												{rank: 5, rank_min: 0, rank_max: live_data.c_rank_score-1},
												{rank: 4, rank_min: live_data.c_rank_score, rank_max: live_data.b_rank_score-1},
												{rank: 3, rank_min: live_data.b_rank_score, rank_max: live_data.a_rank_score-1},
												{rank: 2, rank_min: live_data.a_rank_score, rank_max: live_data.s_rank_score-1},
												{rank: 1, rank_min: live_data.s_rank_score, rank_max: 0},
											],
											live_info: [
											{
												live_difficulty_id: live_data.live_difficulty_id,
												is_random: false,
												dangerous: false,
												use_quad_point: false,
												notes_speed: live_data.notes_speed,
												notes_list: note_list
											}
											],
											deck_info: {
												total_smile: smile,
												total_cute: pure,
												total_cool: cool,
												total_hp: hp,
												prepared_hp_damage: 0,
											},
											is_marathon_event: false,
											marathon_event_id: null,
											energy_full_time: "2016-01-01 00:00:01",
											over_max_energy: 0,
											live_se_id: live_data.live_setting_id
										}
										
										defer.resolve({status:200, result: result});
									
									
									
								}).catch(function(e){
									defer.reject({status: 403, result: {code: 20001, message: ""}});
								});
						
						
						
						}).catch(function(e){
							defer.reject({status: 403, result: {code: 20001, message: ""}});
						});
						
					}else{
						defer.reject({status: 403, result: {code: 20001, message: ""}});
						
					}
					
					
				}).catch(function(e){
					defer.reject({status: 403, result: {code: 20001, message: ""}});
				});
				
			}).catch(function(e){
				defer.reject({status: 403, result: {code: 20001, message: ""}});
			});
			
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		
		return defer.promise;
		
		
	},
	reward: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.reject({status: 403, result: {code: 20001, message: ""}});
		return defer.promise;
	},
	gameover: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {}});
		return defer.promise;
	}
	
	
}