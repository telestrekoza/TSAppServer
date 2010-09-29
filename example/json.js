(function() {

T = function() {
    T.superclass.constructor.apply(this, arguments);
};

Base.extend(T, Base.JsonController);

T.prototype.doBody = function() {
    var jsonBuf = [],
	sys = require('sys'),
	idx = 0;
    jsonBuf[idx++]  = '[';
    jsonBuf[idx++]  = '{"Hallo":"World!!!"}';
    jsonBuf[idx++]  = ',';
    jsonBuf[idx++]  = '{';
    jsonBuf[idx++]  = '"this":';
    jsonBuf[idx++]  = sys.inspect(this.toString());
    jsonBuf[idx++]  = '}';
    
    jsonBuf[idx++]  = ']';
    
    this.res.write( jsonBuf.join('') );
    T.superclass.doBody.call(this);
};

export = T;

})();