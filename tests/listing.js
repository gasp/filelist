var filelist = require("../index.js"), 
	fs = require("fs"),
	path = require("path");


describe("simply listing files in directory", function() {

	var options = {
		directory: path.join(__dirname, 'data'),
		recursive: false,
		filter: null,
		async: false,
		watch: false
	};

	it("lists synchronously the folder" +  options.directory, function() {
		var fl = filelist(options);

		expect(fl.db.length).toBeGreaterThan(2);
		expect(fl.db[0]).toBeDefined();
		expect(fl.db[0].name).toBeDefined();
		expect(fl.db[0].name).toBe('file-0.txt');
	});

});
