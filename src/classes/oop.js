/*
 * cut from YUI 3.1.1 
 * http://developer.yahoo.com/yui/3/api/oop.js.html
 */
(function(){

var Y = {},
    OP = Object.prototype,
    FUNCTION  = 'function',
    OBJECT    = 'object';
    
Y.Object = function(o) {
    var F = function() {};
    F.prototype = o;
    return new F();
};

Y.isFunction = function(o) {
    return typeof(o) === FUNCTION;
};

Y.isObject = function(o, failfn) {
    var t = typeof o;
    return (o && (t === OBJECT || (!failfn && (t === FUNCTION || Y.isFunction(o))))) || false;
};

Y.mix = function(r, s, ov, wl, mode, merge) {
    if (!s||!r) {
        return r || Y;
    }

    if (mode) {
        switch (mode) {
            case 1: // proto to proto
                return Y.mix(r.prototype, s.prototype, ov, wl, 0, merge);
            case 2: // object to object and proto to proto
                Y.mix(r.prototype, s.prototype, ov, wl, 0, merge);
                break; // pass through 
            case 3: // proto to static
                return Y.mix(r, s.prototype, ov, wl, 0, merge);
            case 4: // static to proto
                return Y.mix(r.prototype, s, ov, wl, 0, merge);
            default:  // object to object is what happens below
        }
    }

    // Maybe don't even need this wl && wl.length check anymore??
    var i, l, p, type;

    if (wl && wl.length) {
        for (i = 0, l = wl.length; i < l; ++i) {
            p = wl[i];
            type = L.type(r[p]);
            if (s.hasOwnProperty(p)) {
                if (merge && type == "object") {
                    Y.mix(r[p], s[p]);
                } else if (ov || !(p in r)) {
                    r[p] = s[p];
                }            
            }
        }
    } else {
        for (i in s) { 
            // if (s.hasOwnProperty(i) && !(i in FROZEN)) {
            if (s.hasOwnProperty(i)) {
                // check white list if it was supplied
                // if the receiver has this property, it is an object,
                // and merge is specified, merge the two objects.
                if (merge && Y.isObject(r[i], true)) {
                    Y.mix(r[i], s[i], ov, wl, 0, true); // recursive
                // otherwise apply the property only if overwrite
                // is specified or the receiver doesn't have one.
                } else if (ov || !(i in r)) {
                    r[i] = s[i];
                }
                // if merge is specified and the receiver is an array,
                // append the array item
                // } else if (arr) {
                    // r.push(s[i]);
                // }
            }
        }
    }

    return r;

};

Y.extend = function(r, s, px, sx) {
    if (!s||!r) {
	   throw "extend failed, verify dependencies";
    }
    var sp = s.prototype, rp=Y.Object(sp);
    r.prototype=rp;

    rp.constructor=r;
    r.superclass=sp;

    // assign constructor property
    if (s != Object && sp.constructor == OP.constructor) {
	   sp.constructor=s;
    }
    
    // add prototype overrides
    if (px) {
	   Y.mix(rp, px, true);
    }
    
    // add object overrides
    if (sx) {
	   Y.mix(r, sx, true);
    }

    return r;
};

Y.Array = function(o, startIdx, arraylike) {
    var t = (arraylike) ? 2 : YArray.test(o), 
        l, a, start = startIdx || 0;

    if (t) {
        // IE errors when trying to slice HTMLElement collections
        try {
            return Native.slice.call(o, start);
        } catch(e) {
            a = [];
            l = o.length;
            for (; start<l; start++) {
                a.push(o[start]);
            }
            return a;
        }
    } else {
        return [o];
    }
};

Y.bind = function(f, c) {
    var xargs = arguments.length > 2 ? Y.Array(arguments, 2, true) : null;
    return function () {
        var fn =  (typeof f === 'string') ? c[f] : f, 
            args = (xargs) ? xargs.concat(Y.Array(arguments, 0, true)) : arguments;
        return fn.apply(c || fn, args);
    };
};

Y.loadFile =function(fileName, extensions) {
	var fs = require('fs'),
		path = require('path'),
		workingDir = process.cwd();
		content = fs.readFileSync( fileName).toString(),
		Script = process.binding('evals').Script,
		sandbox = {
			require: require,
			process: process,
			exports: exports,
			module: module,
			Base: extensions ? Y.mix( this, extensions, true) : this,
			'__filename': __filename,
			'__dirname': __dirname
		};
	process.chdir(path.dirname(path.normalize(fileName)));
	try{
		Script.runInNewContext( content, sandbox, fileName);
	} catch(e) {
	//	require('util').log("Y.loadFile::runInNewContext "+fileName+" Exception:\n"+require('util').inspect(e));
	    throw new Error(e);
    }
	if(!sandbox.exports) {
		require('util').log("no export in "+fileName);
		return null;
	}
	process.chdir(workingDir);
	return sandbox.module ? sandbox.module.exports : sandbox.exports;
};


exports.mix = Y.mix;
exports.bind = Y.bind;
exports.extend = Y.extend;
exports.loadFile = Y.loadFile;

})();