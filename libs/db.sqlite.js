const sqlite3 = require("sqlite3"), q = require("q"), extend = require("extend");
const libs = {log: require("./log.js")};
const log = new libs.log.initiate(libs.log.LEVEL.VERBOSE, "DB CONTROL");







var db = {user: null, data: null};


function buildUserDb(){
	
	//Default Versions

	var userTables = [
		{"tableName": "users", "version": 0},
		{"tableName": "unit", "version": 0},
		{"tableName": "album", "version": 0},
		{"tableName": "team_slot", "version": 0},
		{"tableName": "team", "version": 0},
	];
	
	log.verbose("Preparing User Database");
	var defer = q.defer();
	
	db.user.run("CREATE TABLE IF NOT EXISTS `meta` (`tableName`	TEXT,`version`	INTEGER NOT NULL,PRIMARY KEY(tableName));", function(err){
		if (err){ defer.reject(err); return; }
		
		db.user.all("SELECT tableName,version FROM meta", function(err,rows){
			if (err){ defer.reject(err); return; }
			
			rows = extend(userTables,rows);
			var querys = [];
			for (var i=0; i<rows.length;i++){
				let table = rows[i].tableName;
				let version = rows[i].version;
				switch(table){
					case "users": {
						
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `users`;");
								querys.push("CREATE TABLE `users`( `user_id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `login_key` TEXT NOT NULL UNIQUE, `login_passwd` TEXT NOT NULL, `name` TEXT DEFAULT 'User', `token` TEXT, `level` INTEGER DEFAULT 1, `exp` INTEGER DEFAULT 0, `game_coin` INTEGER DEFAULT 0, `sns_coin` INTEGER DEFAULT 0, `free_sns_coin` INTEGER DEFAULT 0, `paid_sns_coin` INTEGER DEFAULT 0, `social_point` INTEGER DEFAULT 0, `unit_max` INTEGER DEFAULT 120, `energy_max` INTEGER DEFAULT 25, `energy_full_time` INTEGER DEFAULT 0, `over_max_energy` INTEGER DEFAULT 0, `friend_max` INTEGER DEFAULT 0, `insert_date` INTEGER DEFAULT 0, `tutorial_state` INTEGER DEFAULT 0, `partner` INTEGER DEFAULT 0, `introduction` TEXT DEFAULT 'Hello!');");
								version = 2;
								break;
							}
							case 1:{
								querys.push("ALTER TABLE `users` ADD COLUMN `introduction` TEXT DEFAULT 'Hello!';");
								version = 2;
							}

						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						break;
					}
					case "unit": {
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `unit`;");
								querys.push("CREATE TABLE `unit`( `owner_id` INTEGER NOT NULL, `unit_owning_user_id` INTEGER PRIMARY KEY AUTOINCREMENT, `unit_id` INTEGER NOT NULL, `exp` INTEGER, `next_exp` INTEGER, `level` INTEGER, `max_level` INTEGER, `rank` INTEGER, `max_rank` INTEGER, `love` INTEGER, `max_love` INTEGER, `unit_skill_level` INTEGER, `unit_skill_exp` INTEGER, `max_hp` INTEGER, `unit_removable_skill_capacity` INTEGER, `favorite_flag` INTEGER, `display_rank` INTEGER,`removed`	INTEGER DEFAULT 0);");
								version = 2;
								break;
							}
							case 1: {
								querys.push("ALTER TABLE `unit` ADD COLUMN 	`removed`	INTEGER DEFAULT 0;");
								version = 2;
							}
						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						break;
					}
					case "album":{
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `album`;");
								querys.push("CREATE TABLE `album`( `user_id` INTEGER NOT NULL, `unit_id` INTEGER NOT NULL, `rank_max_flag` INTEGER DEFAULT 0, `love_max_flag` INTEGER DEFAULT 0, `rank_level_max_flag` INTEGER DEFAULT 0, `all_max_flag` INTEGER DEFAULT 0, `highest_love_per_unit` INTEGER DEFAULT 0, `total_love` INTEGER DEFAULT 0, `favorite_point` INTEGER DEFAULT 0, PRIMARY KEY(user_id,unit_id));");
								version = 1;
								break;
							}
							
						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						break;
						
					}
					case "team_slot":{
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `team_slot`;");
								querys.push("CREATE TABLE `team_slot`( `user_id` INTEGER NOT NULL, `team_id` INTEGER NOT NULL CHECK(team_id >= 1 AND team_id <= 9), `slot_id` INTEGER NOT NULL CHECK(slot_id >= 1 AND slot_id <= 9), `unit_owning_user_id` INTEGER NOT NULL, PRIMARY KEY(user_id,team_id,slot_id), CONSTRAINT no_doubles UNIQUE (unit_owning_user_id, team_id));");
								version = 1;
								break;
							}
						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						
						break;
					}
					case "team":{
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `team`;");
								querys.push("CREATE TABLE `team`( `user_id` INTEGER NOT NULL, `team_id` INTEGER NOT NULL, `team_name` TEXT, `main` INTEGER NOT NULL DEFAULT 0);");
								version = 1;
								break;
							}
						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						
						break;
					}
					
				}
				
				
				
			}
			
			
			if (querys.length > 0){
				log.verbose("Queries to Execute: ");
				log.verbose(querys);
				db.user.exec(querys.join("\n"), function(err){
					if (err){ defer.reject(err); return; }
					log.verbose("Tables Updated");
					defer.resolve();
				});
			}else{
				log.verbose("No Changes Needed");
				defer.resolve();
			}
			
		});
		
		
		
		
		
	});
	
	return defer.promise;
}

function buildDataDb(){
	
	//Default Versions

	var userTables = [
		{"tableName": "unit_initial_sets", "version": 0},
	];
	
	log.verbose("Preparing Data Database");
	var defer = q.defer();
	
	db.data.run("CREATE TABLE IF NOT EXISTS `meta` (`tableName`	TEXT,`version`	INTEGER NOT NULL,PRIMARY KEY(tableName));", function(err){
		if (err){ defer.reject(err); return; }
		
		db.data.all("SELECT tableName,version FROM meta", function(err,rows){
			if (err){ defer.reject(err); return; }
			
			rows = extend(userTables,rows);
			var querys = [];
			for (var i=0; i<rows.length;i++){
				let table = rows[i].tableName;
				let version = rows[i].version;
				switch(table){
					case "unit_initial_sets": {
						
						switch(version){
							case 0: {
								querys.push("DROP TABLE IF EXISTS `unit_initial_sets`;");
								querys.push("CREATE TABLE `unit_initial_sets`( `unit_initial_set_id` INTEGER CHECK(unit_initial_set_id >= 1 AND unit_initial_set_id <= 19), `member_category` INTEGER CHECK(member_category IN ( 1 , 2)), `unit_1` INTEGER, `unit_2` INTEGER, `unit_3` INTEGER, `unit_4` INTEGER, `unit_5` INTEGER, `unit_6` INTEGER, `unit_7` INTEGER, `unit_8` INTEGER, `unit_9` INTEGER, PRIMARY KEY(unit_initial_set_id) );");
								querys.push("INSERT INTO unit_initial_sets VALUES(1,1,13,9,8,23,49,24,21,20,19), (2,1,13,9,8,23,50,24,21,20,19), (3,1,13,9,8,23,51,24,21,20,19), (4,1,13,9,8,23,52,24,21,20,19), (5,1,13,9,8,23,53,24,21,20,19), (6,1,13,9,8,23,54,24,21,20,19), (7,1,13,9,8,23,55,24,21,20,19), (8,1,13,9,8,23,56,24,21,20,19), (9,1,13,9,8,23,57,24,21,20,19), (11,2,13,9,8,23,788,24,21,20,19), (12,2,13,9,8,23,789,24,21,20,19), (13,2,13,9,8,23,790,24,21,20,19), (14,2,13,9,8,23,791,24,21,20,19), (15,2,13,9,8,23,792,24,21,20,19), (16,2,13,9,8,23,793,24,21,20,19), (17,2,13,9,8,23,794,24,21,20,19), (18,2,13,9,8,23,795,24,21,20,19), (19,2,13,9,8,23,796,24,21,20,19);");
								version = 1;
								break;
							}

						}
						if (rows[i].version != version)
						querys.push("INSERT OR REPLACE INTO meta (tableName, version) VALUES ('"+table+"',"+version+");");
						break;
					}
				}
			}
			
			
			if (querys.length > 0){
				log.verbose("Queries to Execute: ");
				log.verbose(querys);
				db.data.exec(querys.join("\n"), function(err){
					if (err){ defer.reject(err); return; }
					log.verbose("Tables Updated");
					defer.resolve();
				});
			}else{
				log.verbose("No Changes Needed");
				defer.resolve();
			}
			
		});
		
		
		
		
		
	});
	
	return defer.promise;
}




function buildDatabases(){
	log.verbose("Preparing Databases");
	var defer = q.defer();
	
	buildUserDb()
	.then(buildDataDb)
	.then(function(){
		defer.resolve();
	}).catch(function(e){
		defer.reject(e);
	});
	
	return defer.promise;
}


function openGameDB(name){
	var defer = q.defer();
	db["game_" + name] = new sqlite3.Database("./db/game/" + name + ".db_", sqlite3.OPEN_READONLY, function(err){
		if (err){ log.error("Failed to Open Game Database '" + name + ".db_"); defer.reject(err); return; }
		log.verbose("Opened Game Database: " + name);
		defer.resolve();
	});
	
	return defer.promise;
	
}



module.exports = {
	init: function(){
		var defer = q.defer();
		
		openGameDB("unit")
		//.then(function(){return openGameDB("live");})
		.then(function(){
		
				
				db.user = new sqlite3.Database("./db/user.db", sqlite3.OPEN_READWRITE |  sqlite3.OPEN_CREATE, function(err){
					if (err){ log.error("Failed to Open Database 'user.db'"); log.error(err); return; }
					log.verbose("Database 'user.db' Opened");
					
					db.data = new sqlite3.Database("./db/data.db", sqlite3.OPEN_READWRITE |  sqlite3.OPEN_CREATE, function(err){
						if (err){ log.error("Failed to Open Database 'data.db'"); log.error(err); return; }
						log.verbose("Database 'data.db' Opened");
						buildDatabases().then(function(){
							
							
							
							defer.resolve();
						}).catch(function(e){
							log.fatal("Database Preperation Failed.");
							defer.reject(e);
						});
						
					});
					
					
				});
				
			});
		
		return defer.promise;
	},

	get: function(database, query, params){
		var defer = q.defer();
		database = database.toLowerCase();
		if (typeof db[database] === "undefined"){
			defer.reject("Invalid Database");
		}else{
			try {
				db[database].all(query, params, function(err,data){
					if (err){ defer.reject(err); return; }
					defer.resolve(data);
				});
			} catch (e) {
				defer.reject(e);
			}
		}
		return defer.promise;
	},
	first: function(database,query,params){
		var defer = q.defer();
		database = database.toLowerCase();
		if (typeof db[database] === "undefined"){
			defer.reject("Invalid Database");
		}else{
			try {
				db[database].get(query, params, function(err,data){
					if (err){ defer.reject(err); return; }
					defer.resolve(data);
				});
			} catch (e) {
				defer.reject(e);
			}
		}
		return defer.promise;
	},
	run: function(database, query, params){
		var defer = q.defer();
		database = database.toLowerCase();
		if (typeof db[database] === "undefined"){
			defer.reject("Invalid Database");
		}else{
			try {
				db[database].run(query, params, function(err){
					if (err){ defer.reject(err); return; }
					defer.resolve(this);
				});
			} catch (e) {
				defer.reject(e);
			}
		}
		
		
		
		return defer.promise;
	},
	runAll: function(database, query){
		var defer = q.defer();
		
		database = database.toLowerCase();
		if (typeof db[database] === "undefined"){
			defer.reject("Invalid Database");
		}else{
			try {
				db[database].exec(query,function(err){
					if (err){ defer.reject(err); return; }
					defer.resolve();
				});
			} catch (e) {
				defer.reject(e);
			}
		}
		
		
		
		return defer.promise;
	}
	
	
	
	
	
	
}