{
	get: function(data){
		//{"module":"personalnotice","action":"get","timeStamp":1480155023,"mgd":2,"commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480155023.3"}
		//{"response_data":{"has_notice":false,"notice_id":0,"type":0,"title":"","contents":""},"release_info":[],"status_code":200}
		
		var defer = q.defer();
		log.verbose(data);
		
		defer.resolve({status: 200, result: {
			has_notice: true,
			notice_id: 1,
			type: 1,
			title: "Cara's Private Server",
			contents: "This is a private server.\nAccess to this server may be revoked at any time.\nPlease do not complain if suddenly everything is gone.\n\nPress OK! to start."
		}});
		
		
		return defer.promise;
		
		
		
	},
	agree: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: []});	
		return defer.promise;
	}
	
}