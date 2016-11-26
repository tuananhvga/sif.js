{
	scenariostatus: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			scenario_status_list: [
				{scenario_id: 1, status: 2},
				{scenario_id: 2, status: 2},
				{scenario_id: 3, status: 2},
				{scenario_id: 184, status: 2},
				{scenario_id: 185, status: 2},
				{scenario_id: 186, status: 2},
				{scenario_id: 187, status: 2},
				{scenario_id: 188, status: 2}
			]
		}});
		return defer.promise;
	}
	
}