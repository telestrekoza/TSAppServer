(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController);

T.prototype.doHeaders = function() {
    //delete session
    Session.destroy();
    T.superclass.doHeaders.call(this);
}

T.prototype.doBody = function() {
    var sys = require('util'),
	res = this.res,
	//req = this.req,
	buf = [],
	values = [],
	idx = 0;

    buf[idx++] = "<html><head><title>Destroy Session</title></head><body>";
    buf[idx++] = '<h1>Destroy sessionId</h1><small>';
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