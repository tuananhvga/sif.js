{
	subscenariostatus: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			subscenario_status_list: false
		}});
		return defer.promise;
	}
	
}