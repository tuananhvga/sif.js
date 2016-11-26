{
	productlist: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			sns_product_list: [
				{product_id: "com.klab.lovelive.en.tier20160119.lovegem001", name: "1 Love Gems", price: 0, product_type: 1, item_list: [{item_id: 4, add_type: 3001, amount: 1, is_freebie: true}]}
			],
			product_list: []
		}});
		return defer.promise;
	}
	
}