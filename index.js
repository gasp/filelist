var fs = require('fs'),
	path = require('path'),
	watch = require('node-watch'),
	emitter = require('events').EventEmitter
	_ = require('lodash');

var defaultConfig = {
	directory: __dirname + '/somedir',
	options: { recursive: false, followSymLinks: false }, 
	pattern: /\.(mp33|mp3)$/,
	events: ['created', 'deleted']
};


var fl = function(config){
	_.extend(config, defaultConfig);

	var populate = function() {
		var dirfiles = fs.readdirSync(config.directory),
			cleanfiles = [];
		for (var i = 0; i < dirfiles.length; i++) {
			clean(dirfiles[i], function (file) {
				cleanfiles.push(file);
			});
		}
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
		console.log("cleaning %s", rawfile);
		filter(config.pattern, function(filename) {
			var file = (function(config,filename) {
				if(filename[0] === path.sep)
					return {
						fullpath: path.normalize(filename),
						filename: path.basename(filename)
					};
				else
					return {
						fullpath: path.normalize( config.directory + path.sep + filename ),
						filename: filename
					};
			})(config,filename);
			if(fs.statSync(file.fullpath).isFile()) {
				file.stats = fs.statSync(file.fullpath);
				fn(file);
			}
		})(rawfile);
	};

	var dowatch = function() {
		var watcher = new emitter();

		watch(config.directory, config.options, filter(config.pattern, function(filename) {

			if(fs.existsSync(filename)) {
				watcher.emit("created", filename);
			
				// remove any duplicate (sometimes watch does not properly trigger)
				findOne(fl.db, path.normalize(filename), function(i) {
					fl.db.splice(fl.db, i ,1); // fixme cannot access this !
				});
			
				// add to db
				clean(filename, function(file) {
					fl.db.push(file); // fixme cannot access this !
				})
			
			}
			else {
				console.log("fl: deleted or moved ? this should be solved with a setTimeout array attached to the object");
				// remove from db
				 // fixme cannot access this fl.db !
				findOne(fl.db, path.normalize(filename), function(i) {
					var deleted = fl.db.splice(i ,1);
					console.log("fl: deleted: %d", i, deleted);
				});

			}
		}));

		findOne = function(db,filename, cb) {
			for (var i = 0; i < db.length; i++) {
				if(db[i].fullpath === filename)
					cb(i);
			}
		};

		return watcher;
	};

	return {
		db: populate(),
		emit: dowatch()
	};
};

// debug shit

var filelist = fl(defaultConfig);
setTimeout(function () {
	console.log("filelist.db is...");
	console.log(filelist.db);
},5000);

filelist.emit.on("created", function (filename) {
	console.log(filename);
})

/*
module.exports = fl;*/
