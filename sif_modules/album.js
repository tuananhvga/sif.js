{
	albumall: function(data){
		// https://jsonblob.com/c3540215-b3d4-11e6-871b-35b2f1cffc7f
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			DB.get("user", "SELECT * FROM album WHERE user_id=?",[user_id]).then(function(d){
				
				var album = [];
				
				for (var i=0;i<d.length;i++){
					var a = d[i];
					album.push({
						unit_id: a.unit_id,
						rank_max_flag: a.rank_max_flag==1,
						love_max_flag: a.love_max_flag==1,
						rank_level_max_flag: a.rank_level_max_flag==1,
						all_max_flag: a.all_max_flag==1,
						highest_love_per_unit: a.highest_love_per_unit,
						total_love: a.total_love,
						favorite_point: a.favorite_point
					});
				}
				
				defer.resolve({status:200, result: album});
				
				
			}).catch(function(e){
				defer.reject(e);
			});
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	}
	
}