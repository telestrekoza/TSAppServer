#!/usr/bin/node

(function() {

var config	= require('./config').Config,
    sys		= require('sys'),
    http	= require('http'),
    CustomEvent	= require('events').EventEmitter,
    LIBPATH	= config.DOCROOT+'/node/lib',
    s;

require.paths.push( './modules');
require.paths.push( LIBPATH );

WebServer = function(config) {
    var server = this,
    	url = require('url'),
    	querystring = require('querystring');

    server.extensions = require('./classes');
    server.config = config;
    server.POST = null;
    server.GET = null;
    
    http.createServer( function(req, res ) {
		if(config.debug) sys.log("start request");
		server.init.call(server, req, res);
		
		req.on('data', function(data) {
		    server.POST = querystring.parse(data);
		    //sys.puts(sys.inspect(server.POST));
		});
		req.on('end', function() {
		    //sys.log("end");
			if(req.method = "GET") {
				var link = url.parse(req.url, true);
				server.GET = link.query;
			}
		    server.run.call(server);
		});
    }).listen( config.port, config.host );

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

    ServerEvents.addListener( 'finish', function() {
	res.end('\n');
    });

    function uncaughtException( err ) {
	process.removeListener('uncaughtException', uncaughtException);
	if(cfg.showError) {
    	    res.write("Exception: " + err );
	}
	sys.puts(new Date() + " " + path +" Exception: " + err);
	res.end('\n');
    }
    process.addListener('uncaughtException', uncaughtException);
    
    if(cfg.debug) sys.log("check request url:"+ sys.inspect(url));
    if( path.charAt( path.length-1 ) == '/' ) {
	path = path + INDEX;
    }
    //disallow parent directory access, convert spaces
    path = path.replace(/\.\.\//g,'').replace(/\%20/g,' ');
    this.DOCROOT_PATH = require('path').dirname(cfg.DOCROOT+path);
    this.path = path;
    if(cfg.debug) sys.log("docroot_path:"+this.DOCROOT_PATH);
    
    //obfuscate rights:
    if(cfg.debug) sys.log("obfuscate rights to:"+cfg.uid);
    process.setgid( cfg.gid );
    process.setuid( cfg.uid );
    if(cfg.debug) sys.log("change process path");
    process.chdir( this.DOCROOT_PATH );
    if(cfg.debug) sys.log("proccess rights are obfuscated");		
    this.serverEvents = ServerEvents;
};

WebServer.prototype.run = function() {
    var fs 	= require('fs'),
	cfg 	= this.config,
	params  = this.params,
	path	= this.path,
	fileName= cfg.DOCROOT + path,
	cookie	= require('cookie-node'),
        extensions = this.extensions,
        session = extensions.Session,
        Session = new session(),
        DOCROOT_PATH = this.DOCROOT_PATH,
        serverEvents = this.serverEvents,
        post 	= this.POST,
        get		= this.GET,
        req	= this.req,
        res	= this.res;
	
    if(cfg.debug) sys.log("read file to execute:" + fileName);
    fs.readFile( fileName, function( err, data ) {
	//sys.log("done read file");
	if( err ) {
	    var msg = 'Not Found';
	    res.writeHead( 404, {'Content-Type': 'text/plain', 'Content-Length': msg.length} );
	    res.end( msg );
	    sys.log( 'File not found '+ path +' '+ err);
	    return;
	}
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
        
	var Script = process.binding('evals').Script,
            result,
            dirname = DOCROOT_PATH,
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
	Script.runInNewContext( data, sandbox, path );
	if(cfg.debug) sys.log("Script sandboxed.\n"+sys.inspect(process.memoryUsage()));
	if(cfg.debug) sys.log("Result:"+sys.inspect(sandbox.export));
	if(typeof(sandbox.export) != "function") {
	    sys.log(path+" : no export found in the file");
	    res.writeHead(500, {});
	    if(cfg.showError) {
		res.write("No export found !");
	    }
	    res.end();
	    return;
	}
	
	if(cfg.debug) sys.log("execute");
	//sys.log("server:"+sys.inspect( serverEvents ));
	//insert POST values to request
	if(post)
		req.POST = post;
	if(get)
		req.GET = get;
	result = new sandbox.export( serverEvents, req, res, params);
	//sys.log("result:"+sys.inspect(result));
	if( result && result.doHeaders )
	    result.doHeaders();
	else
	    res.writeHead(200, {'Content-Type': 'text/plain'});
	if( result && result.doBody )
	    result.doBody();
	if(cfg.debug) sys.log("done");
    });
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

/*
 * Initialize
 */
s = new WebServer( config );
process.addListener('exit', s.onExit );
process.addListener('SIGHUP', s.onExit );

})();