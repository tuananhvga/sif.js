{
	owningpoint: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			exchange_point_list: []
		}});
		return defer.promise;
	}
	
}