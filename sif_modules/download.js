{
	geturl: function(data){
		var defer = q.defer();
		log.verbose(data);
		var url_list = [];
		var toDownload = [];
		for (var i=0;i<data.path_list.length;i++){
			var f = data.path_list[i];
			if (f.indexOf("..") >=0){
				defer.resolve({status: 600, result: false});
				return defer.promise;
			}
			url_list.push("http://llsif.info/sifps/download/" + f); 
		}
		defer.resolve({status: 200, result: {url_list: url_list}});
		return defer.promise;
	},
	batch: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: []});	
		return defer.promise;
	}
}