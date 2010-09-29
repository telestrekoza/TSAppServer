(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController);

T.prototype.doBody = function() {
    var sys = require('sys'),
	buf = [],
	idx = 0;
    buf[idx++] = "<html><head><title>Index</title></head><body>";
    buf[idx++] = 'Dump of the responsex object @'+ new Date();
    buf[idx++] = "<pre>";
    //aaa;
    throw "error throw";
    buf[idx++] = "</pre></body></html>\n";
    this.res.write( buf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();