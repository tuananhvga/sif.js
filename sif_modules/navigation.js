{
	specialcutin: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			special_cutin_list: []
		}});
		return defer.promise;
	}
	
}