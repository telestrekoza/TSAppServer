(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController);

T.prototype.doBody = function() {
    var sys = require('util'),
	res = this.res,
	//req = this.req,
	buf = [],
	values = [],
	idx = 0,
	count =  Session.get("count");
    if(!count) {
	count = 0;
    }
    count++;
    Session.set("count", count);
    buf[idx++] = "<html><head><title>Session</title></head><body>";
    buf[idx++] = '<h1>sessionId</h1><small>';
    buf[idx++] = new Date();
    buf[idx++] = '</small><br/>';
    buf[idx++] = '<pre>Session Id:';
    //buf[idx++] = sys.inspect( SessionManagement );
    buf[idx++] = sys.inspect( count );
    buf[idx++] = "</pre></body></html>\n";
    res.write( buf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();