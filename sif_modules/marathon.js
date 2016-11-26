{
	marathoninfo: function(data){
		var defer = q.defer();
		log.verbose(data);
		defer.resolve({status: 200, result: [
			{
				event_id: 79,
				point_name: "event tokens",
				point_icon_asset: "assets/flash/ui/live/img/e_icon_01.png",
				event_point: 0,
				total_event_point: 0,
				event_scenario:{
					progress: 1,
					event_scenario_status: []
				}
			}
		
		]});
		return defer.promise;
	}
	
}