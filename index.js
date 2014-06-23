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


var fl = (function(dependencies, config){
	var fs = dependencies[0],
		path = dependencies[1],
		watch = dependencies[2],
		emitter = dependencies[3],
		_ = dependencies[4];

	var db = [];

	var populate = function(db, config, filter) {
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
				fullpath: path.normalize( config.directory + '/' + filename ),
				filename: filename
			};
			if(fs.statSync(file.fullpath).isFile()) {
				file.stats = fs.statSync(file.fullpath);
				fn(file);
			}
		})(rawfile);
	};

	var dowatch = function(config,filter) {
		var watcher = new emitter();
		console.log("watching with db of %d elements", db.length);
		watch(config.directory, config.options, filter(config.pattern, function(filename) {

			console.log('%s changed, %d in db.',filename,db.length);

			if(fs.existsSync(filename)) {
				console.log("is file %b",fs.statSync(filename).isFile());
				watcher.emit("created", filename);
				// add to db
				db.push(filename);
			}
			else {
				console.log("fl: deleted or moved ? this should be solved with a setTimeout array attached to the object");
				watcher.emit("deleted", filename);
				// remove from db
				db.splice(db, findOne(db, path.normalize(filename)),1);
			}
		}));

		findOne = function(db,filename) {
			console.log("finding filename %s from %d elements", filename, db.length);
			for (var i = db.length - 1; i >= 0; i--) {
				console.log(db[i].fullpath,filename);
				if(db[i].fullpath === filename)
					return i;
			}
		};

		return watcher;
	};


	return {
		db: populate(db, config, filter),
		watch: dowatch(config, filter)
	};
})([fs,path,watch,emitter,_], config);


// module.exports = fl;

console.log("global fl.db contains %d elements",fll.db.length);

fl.watch.on('created', function(f){ console.log("created, %s db contains %d", f, fl.db.length);});
fl.watch.on('deleted', function(f){ console.log("deleted, %s db contains %d", f, fl.db.length);})
