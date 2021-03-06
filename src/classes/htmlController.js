(function() {

/*
 *
 */
 
var HtmlController,
    H;

HtmlController = function(server, request, response, params) {
    this.req = request;
    this.res = response;
    this.server = server;
    this.query = params;
    this.POST = request.POST ? request.POST : null;
    this.GET = request.GET ? request.GET : null;
    delete request.GET;
    delete request.POST;
};

H = HtmlController;

H.NAME = "HtmlController",
H.CONTENT_TYPE = "text/html";
H.STATUS_OK = 200;
H.STATUS_ERROR = 500;
H.STATUS_NOTFOUND = 404;
H.FINISH = 'finish';
H.HEADERS = 'headers';
H.BODY = 'body';

H.prototype.doHeaders = function() {
    this.res.writeHead(H.STATUS_OK, {'Content-Type': H.CONTENT_TYPE});
    this.server.emit(H.BODY);
};

H.prototype.doErrorHeaders = function() {
    this.res.writeHead(H.STATUS_ERROR, {'Content-Type': H.CONTENT_TYPE});
    this.server.emit(H.BODY);
};

H.prototype.do404Headers = function() {
    this.res.writeHead(H.STATUS_NOTFOUND, {'Content-Type': H.CONTENT_TYPE});
    this.server.emit(H.BODY);
};

H.prototype.doBody = function() {
    this.finalize();
};

H.prototype.finalize = function() {
    if(this.server) {
	   this.server.emit(H.FINISH);
    } else {
	   require('util').log("no this.server");
    }
};

H.prototype.toString = function() {
    var id = (this.id) ? ' ' + this.id : '';
	string = H.NAME + id;
    return string;
};

exports.HtmlController = H;

})();