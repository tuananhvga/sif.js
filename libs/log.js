const chalk = require("chalk");
const extend = require("extend");

const LEVEL = {
	NONE: 1,
	FATAL: 2,
	ERROR: 3,
	WARN: 4,
	INFO: 5,
	DEBUG: 6,
	VERBOSE: 7
}

const DEFAULT_COLORS = {
	fatal: {bg: "red", fg: "yellow"},
	error: {bg: "magenta", fg: "black"},
	warn: {bg: "yellow", fg: "black"},
	info: {bg: "white", fg: "black"},
	debug: {bg: "blue", fg: "white"},
	verbose: {bg: "black", fg: "gray"}
}

const LABEL_SIZE = 16;

const output = function(locations, label, message){
	if (typeof showTime !== "boolean") showTime = true;
	if (typeof label === "string")label = {text: label, color: "white", bgColor: "black"};
	if (typeof label !== "object")label = {text: "?", color: "white", bgColor: "black"};
	if (typeof label.text !== "string")label.text = "?";
	if (typeof chalk[label.color.toLowerCase()] !== "function") label.color = "white";
	if (typeof chalk["bg"+label.bgColor.toTitleCase()] !== "function") label.bgColor = "black";
	var labelText = label.text;
	while(labelText.length < LABEL_SIZE+2) labelText = " " + labelText;
	
	if (typeof message === "object"){
		message = JSON.stringify(message, null, 4);
		message.split(/\r\n|\r|\n/).forEach(function(line){
			output(locations, label, line);
		});
		return;
	}
	
	if (message.indexOf("\n")>=0){
		message.split("\n").forEach(function(line){
			output(locations,label,line);
		});
		return;
	}
	
	
	
	locations.forEach(function(out){
		out.write(chalk["bg"+label.bgColor.toTitleCase()](" " + chalk[label.color.toLowerCase()](labelText) + " " ) + " " + message + "\n") ;
	});
}	

function initiate(level, label, options){
	var outputLocations = [process.stdout];	
	this.colors = DEFAULT_COLORS;
	
	if (typeof options === "object"){
		if (typeof options.output === "object" && Array.isArray(options.output)){
			outputLocations = options.output;
		}
		if (typeof options.colors === "object"){
			colors = extend(true, DEFAULT_COLORS, options.colors);
		}
	}
	
	this.LOG_LEVEL = level || LEVEL.INFO;
	
	if (typeof label !== "string"){
		label = null;
	}
	
	this.verbose = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.VERBOSE)
		output(outputLocations, {text: _label || label, bgColor: this.colors.verbose.bg, color: this.colors.verbose.fg}, message);
	}
	
	this.debug = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.DEBUG)
		output(outputLocations, {text: _label || label, bgColor: this.colors.debug.bg, color: this.colors.debug.fg}, message);
	}
	
	this.info = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.INFO)
		output(outputLocations, {text: _label || label, bgColor: this.colors.info.bg, color: this.colors.info.fg}, message);
	}
	
	this.warn = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.WARN)
		output(outputLocations, {text: _label || label, bgColor: this.colors.warn.bg, color: this.colors.warn.fg}, message);
	}
	
	this.error = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.ERROR)
		output(outputLocations, {text: _label || label, bgColor: this.colors.error.bg, color: this.colors.error.fg}, message);
	}
	
	this.fatal = function(message, _label){
		if (this.LOG_LEVEL >= LEVEL.FATAL)
		output(outputLocations, {text: _label || label, bgColor: this.colors.fatal.bg, color: this.colors.fatal.fg}, message);
	}
	
}

module.exports = {
	initiate: initiate,
	LEVEL: LEVEL
};

String.prototype.toTitleCase = function(){return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}