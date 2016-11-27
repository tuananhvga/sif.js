{
	awardinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.first("user","SELECT award_id FROM users WHERE user_id=?",[user_id]).then(function(user_aw){
				DB.get("game_item","SELECT award_id FROM award_m",[]).then(function(d){
					var awinfo = [];
					var set = false;
					for(var i=0;i<d.length;i++){
						awinfo.push({
							award_id: d[i].award_id,
							is_set: user_aw.award_id==d[i].award_id,
							insert_date: "2013-04-15 00:00:00"
						});
						if (user_aw.award_id==d[i].award_id){
							set = true;
						}
					}
					if (!set){ awinfo[0].is_set = true; log.debug("Force Set AW"); }
					defer.resolve({status: 200, result: {award_info: awinfo}});
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
			DB.first("game_item","SELECT award_id FROM award_m WHERE award_id=?",[data.award_id]).then(function(d){
				if (d){
					DB.run("user","UPDATE users SET award_id=? WHERE user_id=?",[data.award_id, user_id]).then(function(d){
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