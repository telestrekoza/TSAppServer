/* copyright infos
 *
 *
 */
(function() {

var config  = require('./config').Config,
    sys     = require('util'),
    http	= require('http'),
    CustomEvent	= require('events').EventEmitter,
    LIBPATH = config.DOCROOT+'/node/lib',
    s;

require.paths.push( './modules');
require.paths.push( LIBPATH );

var WebServer = function(config) {
    var url = require('url'),
        querystring = require('querystring');

    this.extensions = require('./classes');
    this.config = config;
    
    http.createServer( function(req, res ) {
        if(config.debug) sys.log("start request");
		this.init(req, res);
		
		req.on('data', function(data) {
		    this.POST = querystring.parse(data.toString());
		}.bind(this));
		req.on('end', function() {
		    if(req.method == "GET") {
				var link = url.parse(req.url, true);
				this.GET = link.query;
			}
			this.run();
		}.bind(this));
    }.bind(this)).listen( config.port, config.host );
    
    //obfuscate rights:
    if(config.debug && config.uid) sys.log("obfuscate rights to:"+config.uid);
    if(config.gid) process.setgid( config.gid );
    if(config.uid) process.setuid( config.uid );
    
    sys.log('Web server listening '+ config.host+':'+config.port );
};

WebServer.prototype.init = function( req, res ) {
    var ServerEvents = new CustomEvent(),
        cfg 	= this.config,
        reqUrl  = (cfg.parseRewriteURL) ? this.UrlRewrite(req.url) : req.url,
        params  = this.params,
        url	= require('url').parse(reqUrl),
        path 	= url.pathname ? url.pathname : '/';
    
    this.req = req;
    this.res = res;
    this.GET = null;
    this.POST = null;
    
    ServerEvents.addListener( 'finish', function() {
        res.end('\n');
    });
    
    ServerEvents.addListener( 'headers', this.doHeaders.bind(this));
    
    ServerEvents.addListener( 'body', this.doBody.bind(this));

        
    if(cfg.debug) sys.log("check request url:"+ sys.inspect(url));
    if( path.charAt( path.length-1 ) == '/' ) {
	   path = path + INDEX;
    }
    //disallow parent directory access, convert spaces
    path = path.replace(/\.\.\//g,'').replace(/\%20/g,' ');
    this.DOCROOT_PATH = require('path').dirname(cfg.DOCROOT+path);
    this.path = path;
    
    if(config.debug) sys.log("change process path : " + this.DOCROOT_PATH);
    process.chdir( this.DOCROOT_PATH );
    
    if(cfg.debug) sys.log("proccess rights are obfuscated");		
    this.serverEvents = ServerEvents;
};

WebServer.prototype.run = function() {
    var fs 	= require('fs'),
        cfg 	= this.config,
        fileName= cfg.DOCROOT + this.path;
    
    if(cfg.debug) sys.log("read file to execute:" + fileName);
    fs.readFile( fileName, function( err, data ) {
        if(err) {
            var msg = 'Not Found';
            res.writeHead( 404, {'Content-Type': 'text/plain', 'Content-Length': msg.length} );
            res.end( msg );
            sys.log( 'File not found '+ path +' '+ err);
            return;
        } else {
            if(cfg.debug) sys.log("start control handler");
            process.nextTick( function() {
                this.handleController(data);
            }.bind(this));
        }
    }.bind(this));
};
        
WebServer.prototype.handleController = function(data) {
    var cfg 	= this.config,
        params  = this.params,
        path	= this.path,
        fileName= cfg.DOCROOT + path,
        cookie	= require('cookie-node'),
        extensions = this.extensions,
        session = extensions.Session,
        Session = new session(),
        DOCROOT_PATH = this.DOCROOT_PATH,
        serverEvents = this.serverEvents,
        post    = this.POST,
        get     = this.GET,
        req     = this.req,
        res     = this.res,
        result;
    //sys.log("D:"+sys.inspect(extensions));
    //get session
    session.__init(function() {
    	  return req.getCookie.apply(req, arguments);
        }, function() {
    	  return res.setCookie.apply(res, arguments);
        }, function() {
    	  return res.clearCookie.apply(res, arguments);
        }, cfg.SESSIONPATH );
        
    Session.getSession();
    if(cfg.debug) sys.log("got session data");
    
    var dirname = DOCROOT_PATH,
        sandbox = {
            process: process,
            module: module,
            require: require,
            Base: extensions,
            Session: Session,
            export: null,
            __filename: cfg.DOCROOT+path,
            __dirname: dirname
       };
    
    if(cfg.debug) sys.log("run in new context");
    process.nextTick(function() {
        try{
            this.runController( data, sandbox );
        } catch(e) {
            throw new Error(e);
        }
    }.bind(this));
};

WebServer.prototype.runController = function(data, sandbox) {
    var Script = process.binding('evals').Script,
        cfg     = this.config,
        post    = this.POST,
        get     = this.GET,
        req     = this.req,
        res     = this.res,
        result;
    
    try {
        Script.runInNewContext( data, sandbox, this.path );
    } catch (e) {
        var msg = 'Exception: ' + this.path + " : " + sys.inspect(e);
        this.uncaughtException(msg);
        return;
    }
    result = sandbox.export;
    
    if(cfg.debug) sys.log("Script sandboxed.\n"+sys.inspect(process.memoryUsage()));
    if(cfg.debug) sys.log("Result:"+sys.inspect(result));
    if(typeof(result) != "function") {
        this.uncaughtException(this.path+" : no export found in the file");
        return;
    }
    
    if(cfg.debug) sys.log("execute");
    if(post)
        req.POST = post;
    if(get)
        req.GET = get;
    
    process.nextTick(function() {
        var serverEvents = this.serverEvents,
            cfg = this.config;
        try {
            this.result = new result( serverEvents, this.req, this.res, this.params);
        } catch (e) {
            var msg = 'Exception: ' + this.path + " : " + sys.inspect(e);
            this.uncaughtException(msg);
            return;
        }
        serverEvents.emit('headers');
        if(cfg.debug) sys.log("done");
    }.bind(this));
};

WebServer.prototype.doHeaders = function() {
    var result = this.result,
        res = this.res;
    if( result && result.doHeaders ) {
        result.doHeaders();
	} else {
	    res.writeHead(200, {'Content-Type': 'text/plain'});
        this.serverEvents.emit('body');
	}
};

WebServer.prototype.doBody = function() {
    var result = this.result;
    if( result && result.doBody ) {
        result.doBody();
    }
};

WebServer.prototype.onExit = function() {
    sys.log('Terminate by user');
    process.exit( 0 );    
};

WebServer.prototype.UrlRewrite = function( url ) {
    var pattern = /.*\.js\/(.*)/gi,
	base = url.match(pattern) ? url.replace(/\.js\/(.+)/gi, '')+".js" : url;
	
    this.params = url.match(pattern) ? url.replace(pattern, '$1') : null;
    //sys.log('rewrite url:'+ url + ' to:' + base + ' and params:' + this.params);
    return base;
};

WebServer.prototype.uncaughtException = function( err ) {
    var msg1 = "Exception in " + this.path + ": ";
        msg2 = err.message ? err.message : sys.inspect(err),
        msg3 = err.stack ? err.stack : "",
        res = this.res,
        cfg = this.config;
    sys.debug(msg1);
    sys.debug(msg2);
    sys.debug(msg3);
    if(res) {
        res.writeHead(500, {});
    }
    if(res && cfg && cfg.showError) {
		res.write(msg1);
        res.write(msg2);
        res.write(msg3);
	}
	if(res) {
	    res.end('\n');
    }
};

/*
 * Initialize
 */
s = new WebServer( config );
process.on('exit', s.onExit );
process.on('SIGHUP', s.onExit );

process.addListener('uncaughtException', s.uncaughtException.bind(s));


})();