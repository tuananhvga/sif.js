{
	execute: function(data){
		//{"module":"lbonus","action":"execute","timeStamp":1480155156,"mgd":2,"commandNum":"bf87964d-a49a-4801-bbf7-7153efbe0808.1480155156.6"}
		// Response: https://jsonblob.com/431b79b4-b3c2-11e6-871b-67824f336d8b
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			login_count: 1,
			days_from_first_login: 0,
			before_lbonus_point: 1,
			after_lbonus_point: 1,
			last_login_date: COMMON.unixToDateString(Math.floor(Date.now()/1000)),
			show_next_item: false,
			items: [],
			card_info: {}
		}});	
		return defer.promise;
	}
}