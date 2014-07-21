var fs = require('fs'),
	path = require('path'),
	watch = require('node-watch'),
	util = require("util"),
	events = require('events'),
	_ = require('lodash');

var defaultConfig = {
	directory: path.join(__dirname, 'somedir'),
	options: { recursive: false, followSymLinks: false }, 
	pattern: /\.(ogg|mp3)$/,
	events: ['created', 'deleted', 'updated'],
	watch: true
};


var emitter = new events.EventEmitter();
var list = function(config) {
	_.extend(config, defaultConfig);

	var populate = function() {
		var dirfiles = fs.readdirSync(config.directory),
			cleanfiles = [];

		var push = function(dirfile) {
			clean(dirfile, function (file) {
				cleanfiles.push(file);
			});
		};

		for (var i = 0; i < dirfiles.length; i++) {
			push(dirfiles[i]);
		}
		return cleanfiles;
	};

	var filter = function(pattern, fn) {
		return function(filename) {
			if (pattern.test(filename)) {
				fn(filename);
			}
		};
	};

	var clean = function (rawfile, fn) {
		console.log("cleaning %s", rawfile);
		filter(config.pattern, function(filename) {
			var file = (function(config,filename) {
				if(filename[0] === path.sep)
					return {
						fullpath: path.normalize(filename),
						name: path.basename(filename)
					};
				else
					return {
						fullpath: path.normalize(path.join(config.directory, filename)),
						name: filename
					};
			})(config,filename);
			if(fs.statSync(file.fullpath).isFile()) {
				file.stats = fs.statSync(file.fullpath);
				fn(file);
			}
		})(rawfile);
	};

	var findOne = function(db, filename, cb) {
		for (var i = 0; i < db.length; i++) {
			if(db[i].fullpath === filename)
				cb(i);
		}
	};

	var dowatch = function() {

		watch(config.directory, config.options, filter(config.pattern, function(filename) {

			if(fs.existsSync(filename)) {
				emitter.emit("created", filename);
			
				// remove any duplicate (sometimes watch does not properly trigger)
				findOne(list.db, path.normalize(filename), function(i) {
					list.db.splice(fl.db, i ,1); // fixme cannot access this !
				});
			
				// add to db
				clean(filename, function(file) {
					list.db.push(file); // fixme cannot access this !
				});
			
			}
			else {
				console.log("fl: deleted or moved ? this should be solved with a setTimeout array attached to the object");
				// remove from db
				 // fixme cannot access this fl.db !
				findOne(list.db, path.normalize(filename), function(i) {
					var deleted = list.db.splice(i ,1);
					console.log("fl: deleted: %d", i, deleted);
				});
			}
		}));
	};

	if(config.watch) {
		dowatch();
	}

	return {
		db: populate()
	};
};

util.inherits(emitter, list);


// debug shit

var filelist = list(defaultConfig);
console.log(filelist);

setTimeout(function () {
	console.log("filelist.db is...");
	for (var i = 0; i < filelist.db.length; i++) {
		console.log(filelist.db[i].name);
	}
},5000);

emitter.on("created", function (filename) {
	console.log("created", filename);
});

/*
module.exports = fl;*/
