(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController );

T.prototype.doBody = function() {
    var sys = require('util'),
	buf = [],
	idx = 0;
    buf[idx++] = "<html><head><title>Index</title></head><body>";
    buf[idx++] = 'Dump of the responsex object @';
    buf[idx++] = new Date();
    buf[idx++] = "<pre>";
    buf[idx++] = sys.inspect(this.res);
    buf[idx++] = "</pre>";
    buf[idx++] = "<pre>";
    buf[idx++] = sys.inspect(this.req);
    buf[idx++] = "</pre></body></html>\n";
    this.res.write( buf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();