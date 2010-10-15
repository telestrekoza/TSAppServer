(function() {

var Y = require('./oop'),
    HtmlController = require('./htmlController').HtmlController,
    JsonController,
    J;

JsonController = function(server, request, response) {
    J.superclass.constructor.apply(this, arguments);
};

J = JsonController;

J.NAME = "JsonController";
J.CONTENT_TYPE = "json/application";
J.STATUS_OK = 200;

Y.extend(J, HtmlController);

J.prototype.doHeaders = function() {
    this.res.writeHead(J.STATUS_OK, {'Content-Type': J.CONTENT_TYPE});
};

J.prototype.toString = function() {
    var id = (this.id) ? ' ' + this.id : '';
	string = J.NAME + id;
    return string;
};

exports.JsonController = J;

})();