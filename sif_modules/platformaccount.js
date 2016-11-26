{
	isconnectedllaccount: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: []});	
		return defer.promise;
	}
}