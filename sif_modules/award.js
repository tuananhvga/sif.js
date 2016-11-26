{
	awardinfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			award_info: [{
				award_id: 1,
				is_set: true,
				insert_date: "2013-04-15 00:00:00"
			}]
		}});
		return defer.promise;
	}
	
}