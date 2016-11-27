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
		
	}
	
	
}