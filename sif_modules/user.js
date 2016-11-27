{
	userinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.first("user","SELECT user_id, name, level, exp, game_coin, sns_coin, free_sns_coin, paid_sns_coin, social_point, unit_max, energy_max, energy_full_time, over_max_energy, friend_max,tutorial_state FROM users WHERE user_id=?",[user_id]).then(function(userData){
				
				userData.invite_code = user_id.toString();
				userData.previous_exp = 0;
				userData.next_exp = (3*userData.level) + (3*(userData.level-1));
				userData.energy_full_time = "2016-11-25 00:00:00";
				userData.insert_date = "2016-11-25 00:00:00";
				userData.update_date = "2016-11-25 00:00:00";
				userData.energy_full_need_time = 0;
				userData.unlock_random_live_muse = 0;
				userData.unlock_random_live_aqours = 0;
			
				
				
				defer.resolve({status:200, result: {
					user: userData
				}});
				
			}).catch(function(e){
				log.error(e);
			});
			
		
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
	},
	changename: function(data){
		//{"module":"user","action":"changeName","timeStamp":0,"mgd":2,"name":"NEW_NAME","commandNum":""}
		//{"response_data":{"before_name":"OLD_NAME","after_name":"NEW_NAME"},"release_info":[],"status_code":200}
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			if (data.name.length == 0 ||
				data.name.length > 10 ){
					//Name Invalid
					defer.resolve({status: 600, result: {error_code: 1101}});
					return;
				}
			DB.first("user","SELECT name FROM users WHERE user_id=?",[user_id]).then(function(d){
				DB.run("user","UPDATE users SET name = ? WHERE user_id = ?",[data.name, user_id]).then(function(){
					defer.resolve({status: 200, result: {before_name: d.name, after_name: data.name}});
				})
			
			});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	showallitem: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			items: []
		}});
		return defer.promise;
	},
	getnavi: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.first("user","SELECT partner FROM users WHERE user_id=?",[user_id]).then(function(d){
				defer.resolve({status: 200, result: {
					user: {
						user_id: user_id,
						unit_owning_user_id: d.partner
					}
				}});
			}).catch(function(e){
				defer.reject({status: 403, result: {code: 20001, message: ""}});
			});
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;	
	},
	changenavi: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
				DB.run("user","UPDATE users SET partner=? WHERE user_id=?",[data.unit_owning_user_id, user_id]).then(function(d){
					defer.resolve({status: 200, result: []});
				}).catch(function(e){
					defer.reject({status: 403, result: {code: 20001, message: ""}});
				});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	}
	
}