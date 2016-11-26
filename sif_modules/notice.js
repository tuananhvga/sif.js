{
	noticemarquee: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			item_count: 0,
			marquee_list: []
		}});
		return defer.promise;
	}
	
}