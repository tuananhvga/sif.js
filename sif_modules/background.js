{
	backgroundinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.first("user","SELECT background_id FROM users WHERE user_id=?",[user_id]).then(function(user_bg){
				log.debug(user_bg);
				DB.get("game_item","SELECT background_id FROM background_m",[]).then(function(d){
					var bginfo = [];
					var set = false;
					for(var i=0;i<d.length;i++){
						bginfo.push({
							background_id: d[i].background_id,
							is_set: user_bg.background_id==d[i].background_id,
							insert_date: "2013-04-15 00:00:00"
						});
						if (user_bg.background_id==d[i].background_id){
							set = true;
						}
					}
					if (!set){ bginfo[0].is_set = true; log.debug("Force Set BG"); }
					defer.resolve({status: 200, result: {background_info: bginfo}});
				}).catch(function(e){
					defer.reject(e);
				});
			}).catch(function(e){
				defer.reject(e);
			});
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	set: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.first("game_item","SELECT background_id FROM background_m WHERE background_id=?",[data.background_id]).then(function(d){
				if (d){
					DB.run("user","UPDATE users SET background_id=? WHERE user_id=?",[data.background_id, user_id]).then(function(d){
						defer.resolve({status:200, result: []});
					}).catch(defer.reject);
				}else{
					defer.reject();
				}
			}).catch(defer.reject);
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	}
}
