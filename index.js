var fs = require('fs'),
	watch = require('node-watch'),
	emitter = require('events').EventEmitter
	_ = require('lodash');

var config = {
	directory: './somedir',
	options: { recursive: false, followSymLinks: false }, 
	pattern: /\.(json|mp3|js)$/,
	events: ['created', 'deleted']
};


var fl = (function(depedencies, config){
	var fs = depedencies[0],
		watch = depedencies[1],
		emitter = depedencies[2],
		_ = depedencies[3];

	var db = [];

	var populate = function(config, filter) {
		var dirfiles = fs.readdirSync(config.directory),
			cleanfiles = [];
		for (var i = 0; i < dirfiles.length; i++) {
			clean(dirfiles[i], function (file) {
				cleanfiles.push(file);
			});
		}
//		db = cleanfiles;
		return cleanfiles;
	};

	var filter = function(pattern, fn) {
		return function(filename) {
			if (pattern.test(filename)) {
				fn(filename);
			}
		}
	};

	var clean = function (rawfile, fn) {
		filter(config.pattern, function(filename) {
			var file = {
				fullpath: config.directory + '/' + filename,
				filename: filename
			};
			if(fs.statSync(file.fullpath).isFile()) {
				file.stats = fs.statSync(file.fullpath);
				fn(file);
			}
		})(rawfile);
	};

	return {
		db: populate(config, filter),
//		watch: dowatch(config,filter)
	};
})([fs,watch,emitter,_], config);


// module.exports = fl;


console.log(fl);

// fl.watch.on('created', function(f){ console.log("created, %s", f, db);});
// fl.watch.on('deleted', function(f){ console.log("deleted, %s", f, db);})
