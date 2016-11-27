{
	authkey: function(data){
		var defer = q.defer();
		log.verbose(data);
		var t = "";
		var validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		while(t.length<80)
			t+=validCharacters.charAt(Math.floor(Math.random() * validCharacters.length));
		log.verbose("Created Login AUTH Token - " + t);
		AUTH_KEYS.push({key: t, time: Date.now()});
		defer.resolve({status: 200, result: {authorize_token: t}});
		return defer.promise;			
	},
	login: function(data){
		var defer = q.defer();
		log.verbose(data);
		DB.first("user", "SELECT user_id FROM users WHERE login_key = ? AND login_passwd = ?", [data.login_key, data.login_passwd]).then(function(userData){
			if (!userData){
				defer.resolve({status: 600, result: {error_code: 407}});
				return;
			}
			var token = "";
			var validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			while(token.length<80)
				token+=validCharacters.charAt(Math.floor(Math.random() * validCharacters.length));
			DB.run("user", "UPDATE users SET token = ? WHERE login_key = ? AND login_passwd = ?", [token, data.login_key, data.login_passwd]).then(function(){
				defer.resolve({status: 200, result: {
					authorize_token: token, 
					user_id: userData.user_id,
					review_version: "",
					server_timestamp: Math.floor(Date.now()/1000)
				}});
			});
		});		
		return defer.promise;	
	},
	startup: function(data){
		var defer = q.defer();
		log.verbose(data);
		for(var i=0; i<AUTH_KEYS.length;i++){
			if (AUTH_KEYS[i].key == data._headers.authorize.token){
				log.verbose("Token Valid");
								
				DB.get("user","SELECT user_id FROM users WHERE login_key=?",data.login_key).then(function(d){
					if (d.length == 0){
						DB.run("user", "INSERT INTO users (login_key, login_passwd) VALUES (?, ?)", [data.login_key, data.login_passwd]).then(function(){
							DB.get("user", "SELECT user_id FROM users WHERE login_key = ? AND login_passwd = ?", [ data.login_key, data.login_passwd ]).then(function(newUser){
								if (newUser.length == 1){
										defer.resolve({status: 200, result: {
											login_key: data.login_key,
											login_passwd: data.login_passwd,
											user_id: newUser[0].user_id
										}});
								}else{
									defer.reject("Account Creation Failed");
								}
							});
						}).catch(function(e){
							defer.reject(e);
						});
						
						
					}else{
						defer.reject("Duplicate Key");
					}
				}).catch(function(e){
					defer.reject(e);
					
				});
				return defer.promise;
				break;
			}
		}
		log.verbose("Token Invalid");
		defer.resolve({status: 400, result: {error_code: 1400}});
		return defer.promise;
	},
	startwithoutinvite: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {}});
		
		return defer.promise;
	},
	
	topinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			defer.resolve({status: 200, result: {
				friend_action_cnt: 0,
				friend_greet_cnt: 0,
				friend_variety_cnt: 0,
				present_cnt: 0,
				free_muse_gacha_flag: true,
				free_aqours_gacha_flag: true,
				server_datetime: COMMON.unixToDateString(Math.floor(Date.now()/1000)),
				server_timestamp: Math.floor(Date.now()/1000),
				next_free_muse_gacha_timestamp: 1480118400,
				next_free_aqours_gacha_timestamp: 1480118400,
				notice_friend_datetime: "2013-04-15 11:47:00",
				notice_mail_datetime: "2000-01-01 12:00:00",
				friends_approval_wait_cnt: 0
			}});
		}).catch(function(e){
			defer.resolve(e);
		});
		return defer.promise;
	},
	topinfoonce: function(data){		
		var defer = q.defer();
		log.verbose(data);
		
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			defer.resolve({status: 200, result: {
				new_achievement_cnt: 0,
				unaccomplished_achievement_cnt: 0,
				handover_expire_status: 0,
				live_daily_reward_exist: true
			}});
		}).catch(function(e){
			defer.resolve(e);
		});
		return defer.promise;
	},
	unitlist: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			var sets = [[],[],[]];
			DB.get("data","SELECT * FROM unit_initial_sets",[]).then(function(d){
					for(var i=0;i<d.length;i++){
						sets[d[i].member_category].push({
							unit_initial_set_id: d[i].unit_initial_set_id,
							unit_list: [
								d[i].unit_1,
								d[i].unit_2,
								d[i].unit_3,
								d[i].unit_4,
								d[i].unit_5,
								d[i].unit_6,
								d[i].unit_7,
								d[i].unit_8,
								d[i].unit_9
							],
							center_unit_id: d[i].unit_5
						});
					}
					defer.resolve({status: 200, result: {
					member_category_list: [
						{
							member_category: 1,
							unit_initial_set: sets[1]
						},{
							member_category: 2,
							unit_initial_set: sets[2]
						}	
					]
				}});
			}).catch(function(err){
				log.error(err); defer.resolve({status: 600, result: false});
			});
		}).catch(function(e){
			defer.resolve(e);
		});
		return defer.promise;
	},
	
	unitselect: function(data){
		// {"module":"login","action":"unitSelect","timeStamp":1480142659,"mgd":2,"unit_initial_set_id":18,"commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480142659.4"}
		// {"response_data":{"unit_id":[13,9,8,23,795,24,21,20,19]},"release_info":[],"status_code":200}
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.first("user","SELECT tutorial_state FROM users WHERE user_id=?",[user_id]).then(function(d){
				if (d.tutorial_state == 1){
					DB.first("data","SELECT * FROM unit_initial_sets WHERE unit_initial_set_id=?",[data.unit_initial_set_id]).then(function(d){
						if (d){
							DB.runAll("user",`
DELETE FROM unit WHERE owner_id=${user_id};
DELETE FROM team_slot WHERE user_id=${user_id};
DELETE FROM team WHERE user_id=${user_id};
DELETE FROM album WHERE user_id=${user_id};
`).then(function(){
								var cards = [d.unit_1, d.unit_2, d.unit_3,d.unit_4,d.unit_5,d.unit_6,d.unit_7,d.unit_8,d.unit_9];
								var addCards = COMMON.copy(cards);
								addCards.push(d.unit_1);
								addCards.push(d.unit_2);
								COMMON.addMultipleCardsToUser(user_id, addCards, function(list){
									
									//Create Team
									var teamQuery = `
UPDATE users SET partner = ${list[4]} WHERE user_id=${user_id};
INSERT INTO team VALUES (${user_id}, 1, "Team A", 1);
INSERT INTO team_slot VALUES
	(${user_id}, 1, 1, ${list[0]}),
	(${user_id}, 1, 2, ${list[1]}),
	(${user_id}, 1, 3, ${list[2]}),
	(${user_id}, 1, 4, ${list[3]}),
	(${user_id}, 1, 5, ${list[4]}),
	(${user_id}, 1, 6, ${list[5]}),
	(${user_id}, 1, 7, ${list[6]}),
	(${user_id}, 1, 8, ${list[7]}),
	(${user_id}, 1, 9, ${list[8]});
UPDATE users SET tutorial_state=-1 WHERE user_id=${user_id};
									`;
									DB.runAll("user",teamQuery,[]).then(function(){
										console.log(cards);
										defer.resolve({status:200, result: {unit_id: cards}});
									}).catch(function(e){
										log.error(e);
										defer.resolve({status:600, result: {}});
									});
								});
							}).catch(function(err){
								log.error(err);
								defer.resolve({status: 600, result: false});
							})
						}else{
							defer.resolve({status: 600, result: false});
						}
					}).catch(function(err){
						log.error(err); defer.resolve({status: 600, result: false});
					});
				}else{
					defer.resolve({status: 600, result: false});
				}
			}).catch(function(err){
				log.error(err); defer.resolve({status: 600, result: false});
			});

		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	}

}