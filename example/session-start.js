(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController);

T.prototype.doHeaders = function() {
    //delete session
    Session.start(null, "/");
    T.superclass.doHeaders.call(this);
}

T.prototype.doBody = function() {
    var sys = require('sys'),
	res = this.res,
	//req = this.req,
	buf = [],
	values = [],
	idx = 0;

    Session.set("version", "2");
    buf[idx++] = "<html><head><title>Session</title></head><body>";
    buf[idx++] = '<h1>sessionId</h1><small>';
    buf[idx++] = new Date();
    buf[idx++] = '</small><br/>';
    buf[idx++] = '<pre>Session Id:';
    buf[idx++] = sys.inspect( Session );
    buf[idx++] = "</pre></body></html>\n";
    res.write( buf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();