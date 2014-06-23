var fs = require('fs'),
	path = require('path'),
	watch = require('node-watch'),
	emitter = require('events').EventEmitter
	_ = require('lodash');

var config = {
	directory: __dirname + '/somedir',
	options: { recursive: false, followSymLinks: false }, 
	pattern: /\.(json|mp3|js)$/,
	events: ['created', 'deleted']
};


var fl = {};

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
	console.log("cleaing %s", rawfile);
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
	console.log("watching with db of %d elements", fl.db.length);
	watch(config.directory, config.options, filter(config.pattern, function(filename) {

		console.log('watch: %s changed, %d in db.',filename, fl.db.length);

		if(fs.existsSync(filename)) {
			console.log("is file %b",fs.statSync(filename).isFile());
			watcher.emit("created", filename);
			
			// remove any duplicate (sometimes watch does not properly trigger)
			findOne(fl.db, path.normalize(filename), function(i) {
				fl.db.splice(fl.db, i ,1);
			});
			
			// add to db
			clean(filename, function(file) {
				fl.db.push(file);
			})
			
		}
		else {
			console.log("fl: deleted or moved ? this should be solved with a setTimeout array attached to the object");
			watcher.emit("deleted", filename);
			// remove from db
			findOne(fl.db, path.normalize(filename), function(i) {
				var deleted = fl.db.splice(fl.db, i ,1);
				console.log("deleted: %o", deleted);
			});

		}
	}));

	findOne = function(db,filename, cb) {
		console.log("finding filename %s from %d elements", filename, db.length);
		for (var i = 0; i < db.length; i++) {
			console.log("findOne:",db[i].fullpath,filename);
			if(db[i].fullpath === filename)
				cb(i);
		}
	};

	return watcher;
};


fl.db= populate();
fl.watch= dowatch();



// module.exports = fl;

console.log("global fl.db contains %d elements",fl.db.length);

fl.watch.on('created', function(f){ console.log("created, %s db contains %d", f, fl.db.length);});
fl.watch.on('deleted', function(f){ console.log("deleted, %s db contains %d", f, fl.db.length);})
