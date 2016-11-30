{
	owningpoint: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			exchange_point_list: [
				{rarity: 2, exchange_point: 100},
				{rarity: 1, exchange_point: 200},
				{rarity: 3, exchange_point: 300},
				{rarity: 4, exchange_point: 400}
			]
		}});
		return defer.promise;
	}
	
}