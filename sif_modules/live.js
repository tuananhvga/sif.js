{
	livestatus: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {
			normal_live_status_list: [
				{live_difficulty_id: 1,		status: 1,	hi_score: 0,hi_combo_count: 0,clear_cnt: 0,achieved_goal_id_list: []}
			],
			special_live_status_list: [
			],
			marathon_live_status_list: [
			]
		}});
		
		return defer.promise;
	},
	schedule: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {
			event_list: [],
			live_list: [	
			],
			limited_bonus_list: [],
			random_live_list: [
				{attribute_id: 1, start_date: "2015-11-27 00:00:00", end_date: "2030-11-27 23:59:59"}
			]
		}});
		
		return defer.promise;
		
	}
	
}