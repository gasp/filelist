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
	async: false,
	stats: true
};


var list = function(config) {
	options = _.defaults(config, defaults);

	var that = this;
	var List = (function(options) {

		var listSync = function(options) {
			var dirfiles = fs.readdirSync(options.directory),
				files = [];

			if (!options.filter) {
				for (var i = 0; i < dirfiles.length; i++) {
					var file = {
						name: dirfiles[i],
						fullpath: path.join(options.directory, dirfiles[i])
					}
					files.push(file);
				}
			}
			else {
				for (var i = 0; i < dirfiles.length; i++) {
					filter(options.filter, function(filename) {
						var file = {
							name: filename,
							fullpath: path.join(options.directory, filename)
						};
						files.push(file);
					})(dirfiles[i]);
				}
			}

			if(options.stats) {
				for (var i = 0; i < files.length; i++) {
					files[i] = stats(files[i]);
				}
			}

			return files;
		};

		// this function has a callback, does it need it ?
		// should we really test de pattern here ?
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

		var stats = function(file) {
			if(fs.statSync(file.fullpath).isFile()) {
				file.stats = fs.statSync(file.fullpath);
			}
			return file
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