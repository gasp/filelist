var fs = require('fs'),
	watch = require('node-watch');


var config = {
	directory: './somedir',
	options: { recursive: false, followSymLinks: false }, 
	pattern: /\.json$/,
	events: ['created', 'deleted']
};


var fl = (function(watch, config){
	return {};
})(watch);
