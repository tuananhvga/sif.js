{
	checkLogin: function(user_id, token){
		var defer = q.defer();
		DB.first("user","SELECT user_id FROM users WHERE user_id=? AND token=?",[user_id, token]).then(function(d){
			if (!d){
				defer.reject({status: 403, result: {code: 20001, message: ""}});
				return;
			}
			log.verbose("User Validated: " + d.user_id);
			defer.resolve(d.user_id);
		}).catch(function(e){
			defer.reject({status: 403, result: {code: 20001, message: ""}});
		});
		return defer.promise;
	},
	
	unixToDateString: function(unixTimestamp){
		return (new Date(unixTimestamp*1000)).toISOString().replace("T"," ").slice(0,19);				
	},
	
	addMultipleCardsToUser: function(user_id, card_list,callback,uouid_list){
		if (!uouid_list){ uouid_list = []; }
		if (typeof card_list === "object" && Array.isArray(card_list)){
			var next = card_list.shift();
			if (!next){
				callback(uouid_list);
				return;
			}
			COMMON.addUnitToUser(user_id, next).then(function(uouid){
				uouid_list.push(uouid);
				COMMON.addMultipleCardsToUser(user_id, card_list, callback, uouid_list);
				
			}).catch(function(e){
				console.log(e);
				callback(false);
			});			
		}else{
			callback(false);
		}
	},
	
	addUnitToUser: function(user_id, unit_id, options){
		
		log.verbose("Adding Card [" + unit_id + "] to User ["+ user_id +"]");
		
		if (!options){options = {};}
		
		var defer = q.defer();	
		options = extend({
			rank: 1,
			level: 1,
			present: false
		}, options);

		var plevel = Math.max(1,options.level-1);
		
var query = `
SELECT 
	unit_m.unit_id,
	clevel.next_exp,
	plevel.next_exp as exp,
	unit_m.before_level_max,
	unit_m.after_level_max,
	unit_m.before_love_max,
	unit_m.after_love_max,
	unit_m.disable_rank_up,
	skill.max_level as max_skill_level,
	unit_m.default_removable_skill_capacity,
	unit_m.hp_max-clevel.hp_diff as max_hp
FROM unit_m 
	JOIN unit_level_up_pattern_m as clevel ON clevel.unit_level_up_pattern_id = unit_m.unit_level_up_pattern_id
	JOIN unit_level_up_pattern_m as plevel ON plevel.unit_level_up_pattern_id = unit_m.unit_level_up_pattern_id
	LEFT JOIN unit_skill_m as skill ON skill.unit_skill_id = unit_m.default_unit_skill_id
WHERE unit_id = ? AND clevel.unit_level = ? AND plevel.unit_level=?
`;

		DB.first("game_unit",query,[unit_id, options.level, plevel]).then(function(d){
			
			var data = {
				$owner_id: user_id,
				$unit_id: unit_id,
				$exp: (options.level==1?0:d.exp),
				$next_exp: d.next_exp,
				$level: options.level,
				$max_level: (options.rank==1?d.before_level_max:d.after_level_max),
				$rank: (d.disable_rank_up>0?1:(Math.min(2,options.rank))),
				$max_rank: (d.disable_rank_up>0?1:2),
				$love: 0,
				$max_love: (options.rank==1?d.before_love_max:d.after_love_max),
				$unit_skill_level: d.max_skill_level==null?0:1,
				$max_hp: d.max_hp,
				$removable_skill_capacity: d.default_removable_skill_capacity
			}
			
			var insertQuery = "INSERT INTO unit (owner_id, unit_id, exp, next_exp, level, max_level, rank, max_rank, love, max_love, unit_skill_level, unit_skill_exp, max_hp, unit_removable_skill_capacity, favorite_flag, display_rank) VALUES ($owner_id, $unit_id, $exp, $next_exp, $level, $max_level, $rank, $max_rank, $love, $max_love, $unit_skill_level, 0, $max_hp, $removable_skill_capacity, 0, $rank);";
			
			DB.run("user",insertQuery, data).then(function(x){
				DB.run("user","INSERT OR REPLACE INTO `album`(`user_id`,`unit_id`) VALUES (?,?);",[user_id, unit_id]).then(function(){
					if (x.lastID){
						defer.resolve(x.lastID);
					}else{
						log.error("No ID Returned");
						defer.reject("No ID Returned");
					}
				});
			}).catch(function(err){
				log.error(err);
				defer.reject(err);
			});
			
			
		});
		
		
		return defer.promise;
	},	
	
	copy: function(o) {
	   var output, v, key;
	   output = Array.isArray(o) ? [] : {};
	   for (key in o) {
		   v = o[key];
		   output[key] = (typeof v === "object") ? copy(v) : v;
	   }
	   return output;
	}
	
}