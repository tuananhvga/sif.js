{
	status: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			event_scenario_list: []
		}});
		return defer.promise;
	}
	
}