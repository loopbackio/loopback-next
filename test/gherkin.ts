global['AsA'] = function(description : string, cb) {
	describe(description, cb);
};
global['Scenario'] = function(description : string, cb) {
	context(description, cb);
};
global['Given'] = function(description : string, cb) {
	before(description, cb || function() {});
};
global['And'] = function(description : string, cb) {
	before(description, cb || function() {});
};
global['When'] = function(description : string, cb) {
	before(description, cb || function() {});
};
global['Then'] = function(description : string, cb) {
	it(description, cb);
};