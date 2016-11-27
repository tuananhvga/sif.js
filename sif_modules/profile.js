{
	livecnt: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: [
			{difficulty: 1, clear_cnt: 0},
			{difficulty: 2, clear_cnt: 0},
			{difficulty: 3, clear_cnt: 0},
			{difficulty: 4, clear_cnt: 0},
			{difficulty: 6, clear_cnt: 0}
		]});
		return defer.promise;
	},
	cardranking: function(data){
		var defer = q.defer();
		log.verbose(data);
		DB.get("user","SELECT unit_id, (total_love + favorite_point) as total_love FROM album WHERE user_id=? ORDER BY total_love DESC;",[data.user_id]).then(function(d){
				if (d.length > 0){
					var result = [];
						for(var i=0;i<d.length;i++){
							result.push({
								unit_id: d[i].unit_id.toString(),
								total_love: d[i].total_love.toString(),
								rank: i+1
							});
						}
					defer.resolve({status:200,result: result});
				}else{
					defer.reject({status: 403, result: {code: 20001, message: ""}});
				}
		}).catch(function(e){
			defer.reject({status: 403, result: {code: 20001, message: ""}});
		});		
		return defer.promise;
	},
	profileinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		DB.first("user"," \
		SELECT \
			users.user_id, users.name, users.level, unit_max, energy_max, friend_max, introduction, \
			(SELECT count(*) FROM unit WHERE owner_id=users.user_id AND removed=0) as unit_cnt, \
			unit.unit_owning_user_id,  unit_id, unit.exp as unit_exp, unit.next_exp, unit.level as unit_level, unit.max_level, \
			unit.rank, unit.max_rank, unit.love, unit.max_love, unit.unit_skill_level, unit.max_hp, unit.favorite_flag, unit.display_rank, unit.unit_skill_exp, \
			unit.unit_removable_skill_capacity, users.background_id, users.award_id \
		FROM users \
			JOIN team ON users.user_id=team.user_id AND team.main=1 \
			JOIN team_slot ON team.team_id AND team_slot.slot_id=5 \
			JOIN unit ON team_slot.unit_owning_user_id=unit.unit_owning_user_id \
		WHERE team.user_id=?",[data.user_id]).then(function(d){
			if (d){
				var result =  {
					user_info: {
						user_id: d.user_id,
						name: d.name,
						level: d.level,
						cost_max: 100, //Unsure what this is.
						unit_max: d.unit_max,
						energy_max: d.energy_max,
						friend_max: d.friend_max,
						unit_cnt: d.unit_cnt,
						invite_code: d.user_id.toString(),
						elapsed_timne_from_login: "Unknown",
						introduction: d.introduction
					},
					center_unit_info: {
						unit_owning_user_id: d.unit_owning_user_id,
						unit_id: d.unit_id,
						exp: d.unit_exp,
						next_exp: d.next_exp,
						level: d.unit_level,
						max_level: d.max_level,
						rank: d.rank,
						max_rank: d.max_rank,
						love: d.love,
						max_love: d.max_love,
						unit_skill_level: d.unit_skill_level,
						max_hp: d.max_hp,
						favorite_flag: d.favorite_flag==1,
						display_rank: d.display_rank,
						unit_skill_exp: d.unit_skill_exp,
						unit_removable_skill_capacity: d.unit_removable_skill_capacity,
						attribute: 2,
						smile: 0,
						cute: 0,
						cool: 0,
						is_love_max: d.love>=d.max_love,
						is_level_max: d.level>=d.max_level,
						is_rank_max: d.rank>=d.max_rank,
						is_skill_level_max: (d.skill_level==0||d.skill_level>=8),
						setting_award_id: d.award_id,
						removable_skill_ids: []
					},
					is_alliance: false,
					friend_status: 0,
					setting_award_id: d.award_id,
					setting_background_id: d.background_id
				}
				
				defer.resolve({status: 200, result: result});
			}else{
				defer.reject({status: 403, result: {code: 20001, message: ""}});
			}
	
		}).catch(function(e){
			defer.reject({status: 403, result: {code: 20001, message: ""}});
		});
		
		
		return defer.promise;
	},
	profileregister: function(data){
		var defer = q.defer();
		log.verbose(data);
	
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			if (data.introduction.length <= 200){
			DB.run("user","UPDATE users SET introduction=? WHERE user_id=?", [data.introduction, user_id]).then(function(){
				defer.resolve({status: 200, result: []});
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
		
	}
	
}