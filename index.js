var fs = require('fs'),
	path = require('path'),
	watch = require('node-watch'),
	util = require("util"),
	events = require('events'),
	_ = require('lodash');

var defaults = {
	directory: path.join(__dirname, 'somedir'),
	options: { recursive: false, followSymLinks: false }, 
	filter: /\.(ogg|mp3)$/,
	events: ['created', 'deleted', 'updated'],
	recursive: false,
	watch: false,
	async: false
};


var list = function(config) {
	options = _.defaults(config, defaults);

	var that = this;
	var List = (function(options) {

		var listSync = function(options) {
			var dirfiles = fs.readdirSync(options.directory),
				files = [];
			for (var i = 0; i < dirfiles.length; i++) {
				filter(options.filter, function(filename) {
					files.push({name: filename});
				})(dirfiles[i]);
			}
			return files;
		};

		var filter = function(pattern, fn) {
			if(!pattern) return function(filename) {
				fn(filename);
			};
			else return function(filename) {
				if (pattern.test(filename)) {
					fn(filename);
				}
			}
		};

		if(!options.watch && !options.async && !options.recursive) {
			return {
				db: listSync(options)
			};
		}
		else {
			var emitter = new events.EventEmitter(),
				ret = {
					db: []
				};
			util.inherits(emitter, ret);
			return emitter;
		}
	})(options);

	return List;
};

module.exports = list;