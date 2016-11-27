{
	lot: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.reject({status:403, result: {message: "", code: 20001}});
		return defer.promise;

	}
	
}