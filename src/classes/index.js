[
    "oop", "htmlController", "jsonController", "session"
].forEach( function(path) {
    var module = require('./'+ path);
    for( var i in module)
    	exports[i] = module[i];
});
