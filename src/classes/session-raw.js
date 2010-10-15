(function() {

/*
 * Session management class
 * @version 1.0
 * TODO: better cookie path handling. Have to serialize it in to the session file.
 */
var Session,
    S;

Session = function() {
    this.sessionID = null;
    this.data = null;
    this._cookiePath = null;
};

S = Session;

S.COOKIE_NAME = "JSSESSID";
S.MAX_TRY_COUNT = 5;
S.__sessionPath = ".";
S.__getCookie = null;
S.__setCookie = null;
S.__clearCookie = null;

S.__init = function( getCookie, setCookie, clearCookie, tmp ) {
    S.__getCookie = getCookie;
    S.__setCookie = setCookie;
    S.__clearCookie = clearCookie;
    S.__sessionPath = tmp;
};

S.prototype.getSession = function() {
    var sId = S.__getCookie( S.COOKIE_NAME ),
	fs = require('fs'),
	fileName,
	sData, data;
    if( sId ) {
	this.sessionID = sId;
	fileName = this._getSessionFileName();
	try {
	    sData = fs.readFileSync( fileName );
	    data = sData ? JSON.parse( sData ) : null;
	    this._cookiePath = data.cookiePath;
	    this.data = data.data;
	}catch( e ) {}
    }
};

S.prototype.start = function(expires, path) {
    this.destroy(true);
    var sId,
		fs = require('fs'),
		fileName,
		sData, 
		data = {cookiePath: this._cookiePath, data: this.data},
		now = new Date(),
		options = {},
		sessionFileExist = true,
		count = 0;
    
    while(sessionFileExist) {
    	sId = S._generateId();
    	this.sessionID = sId;
    	fileName = this._getSessionFileName();
    	try {
    		sData = fs.statSync(fileName);
    		count++;
    		if(count > S.MAX_TRY_COUNT) {
    			require('sys').log("to much tryies to create session");
    			sessionFileExist = false;
    			return false;
    		}
    	} catch (e) {
    		sessionFileExist = false;
    		break;
    	}
	}
	//create session file
	fs.writeFile( fileName, JSON.stringify( data ), function(err) {} );
    if(!expires) {
    	options.expires = new Date( now.getFullYear() + 1, now.getMonth(), now.getDay());
    }
    if(path) {
    	options.path = path;
    	this._cookiePath = path;
    }
    S.__setCookie( S.COOKIE_NAME , sId, options );
    return true;
};

S.prototype.destroy = function(refresh) {
    if(!this.sessionID) {
	return;
    }
    var fs = require('fs'),
	fileName =  this._getSessionFileName();
    try {
    	fs.unlink(fileName);
    }catch(e) {}
    this.sessionID = null;
    this.data = null;
    if(!refresh) {
        S.__clearCookie( S.COOKIE_NAME, {path: this._cookiePath} );
    }
};

S.prototype.set = function( key, value ) {
    var sId = this.sessionID,
		fs = require('fs'),
		fileName =  this._getSessionFileName(),
		data = { cookiePath: this._cookiePath, data: this.data};
    if( !sId ) {
    	return;
    }
    if( !data.data ) {
    	data.data = {};
    }
    data.data[key] = value;
    this.data = data.data;
    fs.writeFile( fileName, JSON.stringify( data ), function(err) {} );
};

S.prototype.get = function(key) {
    var data = this.data;
    if(!data){
    	return null;
    }
    if(!key) {
		return data;
    }
    return data[key];
};

S.prototype.getID = function() {
    return this.sessionID;
};

S.prototype._getSessionFileName = function() {
    return S.__sessionPath + "/" + this.sessionID;
};

S._generateId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
};

exports.Session = S;

})();