(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend( T, Base.HtmlController);

T.prototype.doBody = function() {
    var sys = require('util'),
	buf = [],
	values = [],
	idx = 0;
    buf[idx++] = "<html><head><title>Promise</title></head><body>";
    buf[idx++] = '<h1>Promise</h1><small>';
    buf[idx++] = new Date();
    buf[idx++] = '</small><pre>';
    for(i = 0; i <= 10000; i++ ) {
	values.push(i);
    }
    
    values.forEach(function(node) {
	buf[idx++] = node;
	buf[idx++] = '\n';
    });
    
    buf[idx++] = "</pre></body></html>\n";
    this.res.write( buf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();