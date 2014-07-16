var filelist = require("../index.js"), 
	fs = require("fs"),
	path = require("path");

var directory = path.join(__dirname, 'data'),
	shortdirectory = (function(maxlength){
		if(directory.length < maxlength)
			return directory;
		else {
			var begining = directory.substring(
				0, Math.floor(maxlength / 2) - 1);
			var end = directory.substring(
				Math.max(directory.length - (Math.floor(maxlength / 2) - 2), 0),
				directory.length);

			return begining + '...' + end;
		}
	})(40)

describe("simply listing files in directory", function() {

	var options = {
		directory: directory,
		recursive: false,
		filter: null,
		async: false,
		watch: false,
		stats: false
	};

	it("lists synchronously the folder" + shortdirectory, function() {
		var fl = filelist(options);

		expect(fl.db.length).toBeGreaterThan(2);
		expect(fl.db.length).toBe(7);
		expect(fl.db[0]).toBeDefined();
		expect(fl.db[0].name).toBeDefined();
		expect(fl.db[0].name).toBe('file-0.txt');
	});

});

describe("listing files in directory with filter", function() {

	var options = {
		directory: path.join(__dirname, 'data'),
		recursive: false,
		filter: /\.txt$/,
		async: false,
		watch: false,
		stats: false
	};

	it("lists only .txt files in" +  options.directory, function() {
		var fl = filelist(options);
		expect(fl.db.length).toBe(6);
		for (var i = 0; i < fl.db.length; i++) {
			expect(fl.db[i].name).toBeDefined();
			expect(fl.db[i].name.substring(fl.db[i].name.length-4)).toBe('.txt');
		}
	});

	it("lists all the .txt and .text files in" +  options.directory, function() {
		options.filter = /\.t(e*)xt$/;
		var fl = filelist(options);
		expect(fl.db.length).toBe(7);
	});
});

describe("get file stats", function() {
	var options = {
		directory: path.join(__dirname, 'data'),
		recursive: false,
		filter: /\.txt$/,
		async: false,
		watch: false,
		stats: true
	};
	
	it("get stats info of files", function() {
		var fl = filelist(options);
		expect(fl.db[0]).toBeDefined();
		expect(fl.db[0].stats).toBeDefined();
		expect(fl.db[0].stats.size).toBeDefined();
		expect(fl.db[0].stats.blocks).toBeDefined();
	});
});


/*

	filelist.on('refresh', function() {
		console.log(fileilst.db);
	});

	filelist.refresh();

	// watch has been updated
	filelist.on('update', function(file) {
		console.log("file %s, has been %s", file.name, file.action);
	});


	
/*
describe("listing files in directory", function() {
	var r = Math.floor(Math.random()*10000);
	var tmpfile = './tmp_nopi'+r+'.txt';
	fs.writeFileSync(tmpfile, 'I am no pi\ntoo bad');

	it("checks a non-rpi archi", function() {
		isrpi(false, function(is){
			expect(is).toBeFalsy();
		});
	});

	fs.unlink(tmpfile, function(){
		console.log("temp file %s cleaned",tmpfile);
	});
});

describe("isrpi is a pi", function() {
	var r = Math.floor(Math.random()*10000);
	var tmpfile = './tmp_nopi'+r+'.txt';
	fs.writeFileSync(tmpfile, 'I am a pi\nsjhkdksBCM2708bs\nsee the line above');

	it("checks a fake rpi archi", function() {
		isrpi(false, function(is){
			expect(is).toBeTruthy();
		});
	});

	fs.unlink(tmpfile, function(){
		console.log("temp file %s cleaned",tmpfile);
	});
});
*/