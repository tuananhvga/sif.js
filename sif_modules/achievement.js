{
	initialaccomplishedlist: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: [
			{achievement_category_id: 1, count: 0, achievement_list: []},
			{achievement_category_id: 2, count: 0, achievement_list: []},
			{achievement_category_id: 3, count: 0, achievement_list: []},
			{achievement_category_id: 4, count: 0, achievement_list: []},
			{achievement_category_id: 5, count: 0, achievement_list: []},
			{achievement_category_id: 7, count: 0, achievement_list: []},
			{achievement_category_id: 10000, count: 0, achievement_list: []}
		]});
		return defer.promise;
	}
	
}