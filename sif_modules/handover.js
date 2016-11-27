{
	start: function(data){
		var defer = q.defer();
		log.verbose(data);
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){
			DB.first("user","SELECT transfer_code FROM users WHERE user_id=?",[user_id]).then(function(d){
				console.log(d);
				if (d.transfer_code == null){
					var newCode = [];
					while(newCode.length < 14){
						newCode.push(Math.floor(Math.random()*24).toString(24).toLowerCase());
					}
					newCode[4] = "-";
					newCode[9] = "-";
					DB.run("user","UPDATE users SET transfer_code=? WHERE user_id=?",[newCode.join(""), user_id]).then(function(){
						defer.resolve({status: 200, result: {code: newCode.join(""), expire_date: "Never Expires"}});
					}).catch(function(e){
						console.log(e);
						defer.reject({status: 403, result: {code: 20001, message: ""}});
					});
				}else{
					defer.resolve({status: 200, result: {code: d.transfer_code, expire_date: "Test"}});
					
				}
			}).catch(console.log);
		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
		// {"response_data":{"code":" <<CODE>> ","expire_date":"2017-11-27 18:35:56"},"release_info":[],"status_code":200}
		
	},
	renew: function(data){
		var defer = q.defer();
		log.verbose(data);
		//{"response_data":{"code":" <<NEW CODE>>","expire_date":"2017-11-27 19:11:28"},"release_info":[],"status_code":200}
		COMMON.checkLogin(data._headers["user-id"], data._headers.authorize.token).then(function(user_id){

			var newCode = [];
			while(newCode.length < 14){
				newCode.push(Math.floor(Math.random()*24).toString(24).toLowerCase());
			}
			newCode[4] = "-";
			newCode[9] = "-";
			DB.run("user","UPDATE users SET transfer_code=? WHERE user_id=?",[newCode.join(""), user_id]).then(function(){
				defer.resolve({status: 200, result: {code: newCode.join(""), expire_date: "Never Expires"}});
			}).catch(function(e){
				console.log(e);
				defer.reject({status: 403, result: {code: 20001, message: ""}});
			});

		}).catch(function(e){
			defer.reject(e);
		});
		return defer.promise;
	},
	exec: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.reject({status: 403, result: {code: 20001, message: "Transfer Code Not Working Yet"}});
		return defer.promise;
	}
}