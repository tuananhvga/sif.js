{
	productlist: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			sns_product_list: [
				{product_id: "None", name: "Nothing", price: "Free", product_type: 2, item_list: []}
			],
			product_list: []
		}});
		return defer.promise;
	}
	
}