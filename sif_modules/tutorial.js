{
	progress: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			
			//{"module":"tutorial","action":"progress","timeStamp":1480035040,"tutorial_state":1,"mgd":2,"commandNum":"dd4b225a-373b-46da-a5e9-140db9e5b736.1480035040.6"}
			//{"response_data":[],"release_info":[],"status_code":200}
			
			DB.first("user","SELECT tutorial_state FROM users WHERE user_id = ?", [user_id]).then(function(d){
				var currentState = d.tutorial_state;
				
				if (currentState == 0 && data.tutorial_state == 1){
					log.verbose("Step 0 to 1","Tutorial");
					
					DB.run("user","UPDATE users SET tutorial_state=1 WHERE user_id=?",[user_id]).then(function(){
						defer.resolve({status:200, result: []});
					}).catch(function(e){
						defer.reject({status:403, result: {code: 20001, message: "Restart Client"}});
					});
					
				}else{
					defer.reject({status:403, result: {code: 20001, message: "Restart Client"}});
				}
				
				
				
				
				
			});
			
			
			
			
			
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		
	},
	
	skip: function(data){
		var defer = q.defer();
		log.verbose(data);
		
		//{"module":"tutorial","action":"skip","timeStamp":1480142663,"mgd":2,"commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480142663.7"}
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			defer.reject({status:403, result: {code: 20001, message: "Restart Client"}});
		});
		return defer.promise;
	}
	
	
	
	
}