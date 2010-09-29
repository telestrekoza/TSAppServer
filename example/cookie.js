(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};                  

Base.extend( T, Base.HtmlController);

T.prototype.doHeaders = function() {
    var res = this.res,
	i = this.req.getCookie("counter");

    i = (i && i !== null) ? ~~(1 * i): 0;
    i++;
    this._cookie = i; 
    res.setCookie("counter", ""+i );
    T.superclass.doHeaders.call(this);
};


T.prototype.doBody = function() {
    var sys = require('sys'),
	res = this.res,
	//req = this.req,
	buf = [],
	values = [],
	idx = 0;

    buf[idx++] = "<html><head><title>Cookie test</title></head><body>";
    buf[idx++] = '<h1>Cookie</h1><small>';
    buf[idx++] = new Date();
    buf[idx++] = '</small><br/>';
    buf[idx++] = 'Send cookie:<pre>';
    buf[idx++] = 'count=';
    buf[idx++] = this._cookie;
    buf[idx++] = "</pre>\n";
    buf[idx++] = "All request cookies:\n<pre>";
    buf[idx++] = sys.inspect(this.req.cookies);
    
    buf[idx++] = "</pre></body></html>\n";
    res.write( buf.join('') );
    T.superclass.doBody.call(this);    
};

export = T;

})();