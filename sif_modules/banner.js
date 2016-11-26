{
	bannerlist: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: {
			time_limit: "2017-01-01 00:00:01",
			member_category_list: [
				{
					member_category: 1,
					banner_list:[
						{
							banner_type: 1,
							target_id: 1,
							asset_path: "assets/image/secretbox/icon/s_ba_3_2.png",
							asset_path_se: "assets/image/secretbox/icon/s_ba_3_2se.png"
						}
					]
				},{
					member_category: 2,
					banner_list:[
						{
							banner_type: 1,
							target_id: 1,
							asset_path: "assets/image/secretbox/icon/s_ba_3_2.png",
							asset_path_se: "assets/image/secretbox/icon/s_ba_3_2se.png"
						}
					]
				}
			]
		}});
		return defer.promise;
	}
	
}