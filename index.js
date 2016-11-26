const q = require("q"), http = require("http"), crypto = require("crypto"), formidable = require("formidable"), fs = require("fs"),querystring = require('querystring'), extend = require("extend");
const libs = {
	log: require("./libs/log.js"),
};
const log = new libs.log.initiate(libs.log.LEVEL.VERBOSE, "NODE_SIF");

const DB = require("./libs/db.sqlite.js");

const _INFO = require("./package.json");


var AUTH_KEYS = [];

const RESPONSE_CODES = {
	SUCCESS: 200,
	BAD_REQUEST: 400
}
const ERROR_CODES = {
	INVALID_REQUEST: 1000,
	INVALID_MODULE: 1000
}

const SERVER_VERSION = "20120129";
const CLIENT_VERSION = "8.0.59";
const BUNDLE_VERSION = "3.1.3";
const APPLICATION_ID = 834030294;


const XMC_HMAC = fs.readFileSync("./HMAC_SECRET.KEY");

function generateXMC(data){
	 return crypto.createHmac('sha1', XMC_HMAC).update(JSON.stringify(data)).digest('hex');
}

setInterval(function(){
	var expire = Date.now() - (30000);
	
	for (let i=0;i<AUTH_KEYS.length;i++){
		if (AUTH_KEYS[i].time < expire){
			log.verbose("Login Key Expired: " + AUTH_KEYS[i].key);
			AUTH_KEYS.splice(i,1);
			i-=1;
		}
	}	
},10000);


var COMMON = {};
eval("COMMON = " + fs.readFileSync("./common.js",{encoding: "utf-8"}));

//Module Loading
var modules = {}

fs.readdirSync("./sif_modules").forEach(function(m){
	if (m.endsWith(".js")){
		log.verbose("Loading Module: " + m);
		m = m.replace(/\.js$/,"");
		eval("modules." + m.toLowerCase() + " = " + fs.readFileSync("./sif_modules/"+m+".js",{encoding: "utf-8"}));
		
		for (var key in modules[m.toLowerCase()]) {
			if (!modules[m.toLowerCase()].hasOwnProperty(key)) continue;
			if (key == key.toLowerCase()){
				if (typeof modules[m.toLowerCase()][key] == "function"){
					log.verbose(" - Action: " + key);
				}else{
					log.warn(" - Unusable Action [Not Function]: " + key);
				}
			}else{
				log.warn(" - Unusable Action [Not Lowercase]: " + key);
			}
		}		
	}
});

function handleRequest(data, finish, currentResponse){
	if (typeof currentResponse !== "object") { currentResponse = []; }
	if (data.length == 0){
		finish(currentResponse);
		return;
	}
	var next = data.shift();
	
	log.debug(next.module.toLowerCase() + " / " + next.action.toLowerCase());	
	if (typeof next === "object"){
		if (typeof next.module === "string" && typeof modules[next.module.toLowerCase()] == "object"){
			if (typeof next.action === "string" && typeof modules[next.module.toLowerCase()][next.action.toLowerCase()] === "function"){
				
				modules[next.module.toLowerCase()][next.action.toLowerCase()](next).then(function(result){
					result.timeStamp = Math.floor(Date.now()/1000);
					result.commandNum = false//`${next.module}/${next.action}`;
					currentResponse.push({result: result.result, status: result.status, commandNum: result.commandNum, timeStamp: result.timeStamp});
					handleRequest(data,finish,currentResponse);
				}).catch(function(e){
					e.timeStamp = Math.floor(Date.now()/1000);

					e.commandNum = false//`${next.module}/${next.action}`;
					currentResponse.push(e);
					
					handleRequest(data,finish,currentResponse);
				});
				return;
			}else{
				log.warn("Action '" + next.action + "' in Module '" + next.action +"' - Unavailable");
			}
		}else{
			log.warn("Module '" + next.module + "'  - Unavailable");
		}
	}
	
	currentResponse.push({status: 600, result: {error_code: ERROR_CODES.INVALID_MODULE},timeStamp: Math.floor(Date.now()/1000), commandNum: `${next.module}/${next.action}`});
	handleRequest(data,finish,currentResponse);
}

var server = http.createServer(function(request,response){
	log.verbose("Request Recieved: " + request.url);
	
	
	
	
	if (request.url.startsWith("/main.php/")){
		response.setHeader("server-version", CLIENT_VERSION);
		response.setHeader("server_version", SERVER_VERSION);
		response.setHeader("X-Powered-By", _INFO.name + " v" + _INFO.version + " by " + _INFO.author);
		response.setHeader("Content-Type","application/json; charset=utf-8");
		//Required Headers
		if (!(
			request.method === "POST" && 
			request.headers["bundle-version"] &&
			request.headers["client-version"] &&
			request.headers["application-id"] &&
			request.headers["authorize"]
		)){
			response.end(JSON.stringify({status: RESPONSE_CODES.BAD_REQUEST}));
			return;
		}
				
		
		var form = new formidable.IncomingForm();
		
		form.parse(request, function(err,fields, files){
			
			var requestData = {};
			
			if (fields.request_data && fields.request_data.length>=1){
				try {
					requestData = JSON.parse(fields.request_data);
				} catch (e){
					log.debug(e);
					response.end(JSON.stringify(e));
					
					return;
				}
				
			}
			var _headers = request.headers;
			_headers.authorize = querystring.parse(_headers.authorize);	
			delete _headers.host;
			delete _headers.accept;
			delete _headers.debug;
			delete _headers.os;
			delete _headers.region;
			delete _headers["os-version"];
			delete _headers["platform-type"];
			delete _headers["time-zone"];
			delete _headers["api-model"];
			delete _headers["x-message-code"];
			delete _headers["content-length"];
			delete _headers["content-type"];
			
			
			var reqPath = request.url.replace("/main.php/","").split("?")[0].toLowerCase().split("/");
			
			switch(reqPath[0]){
				case "api": {
					log.verbose("API Request");
					
					console.log(requestData.length);
					
					
					if (requestData.length <= 30){
						
						
						for (var i=0;i<requestData.length;i++){
							requestData[i]._headers = _headers;
						}
						
						
						handleRequest(requestData, function(result){
							var responseData = {
								response_data: result,
								release_info: [],
								status_code: 200,
							}
							log.verbose(responseData);
							response.setHeader('X-Message-Code', generateXMC(responseData));
							response.end(JSON.stringify(responseData));
						});
		
					}
					return;
				}
				default:{
					
					if (reqPath.length == 2){
						var next = {
							module: reqPath[0],
							action: reqPath[1],
							_headers: _headers
						}
						
						log.debug(next.module + " / " + next.action);
						
						for (var key in requestData) {
							if (!requestData.hasOwnProperty(key)) continue;
							if (!next[key]){
								next[key] = requestData[key];
							}
						}
					
						if (typeof next.module === "string" && typeof modules[next.module] == "object"){
							if (typeof next.action === "string" && typeof modules[next.module][next.action] === "function"){
								console.log(next.module, next.action);
								modules[next.module][next.action](next).then(function(result){

								
							
									var responseData = {
										response_data: result.result,
										status_code: result.status
									};
									
									log.verbose(responseData);
									response.setHeader('X-Message-Code', generateXMC(responseData));
									response.end(JSON.stringify(responseData));
									
									
									
									
								}).catch(function(e){
									
									log.verbose(e);
									if (e.status && e.result){
										response.statusCode = e.status;
										response.end(JSON.stringify(e.result));
									}else{
										response.end("");
									}
									
									
								});
								return;
							}
						}
						
						
					}
				}
			}
			
		
			
		});
	}else if (request.url.startsWith("/download/")){
		
		var file = "." + request.url;
		
		console.log(file);
		
	}
});

DB.init().then(function(){
	server.listen(8081, function(){
		log.info("Started Server on Port 8081");
	});
}).catch(function(e){
	log.fatal(e);
	process.exit(1);
});