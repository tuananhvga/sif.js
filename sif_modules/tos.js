{
	toscheck: function(data){
		//{"module":"tos","action":"tosCheck","timeStamp":1480033894,"mgd":2,"commandNum":"dd4b225a-373b-46da-a5e9-140db9e5b736.1480033894.3"}
		//{"response_data":{"tos_id":1,"is_agreed":false},"release_info":[],"status_code":200}
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {tos_id: 1, is_agreed: true}});
		return defer.promise;
	},
	tosagree: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {}});
		return defer.promise;
	}
	
}