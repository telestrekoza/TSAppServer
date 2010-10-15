#!/usr/bin/node

(function() {

var config = {
    VERSION	: "0.2",
    host	: "127.0.0.1",
    port	: 28080,
    INDEX	: 'index.js',
    DOCROOT	: '/home/httpd/htdocs-node',
    SESSIONPATH : '/home/httpd/tmp',
    gid		: 1005,
    uid		: 104,
    showError	: true,
    parseRewriteURL: true,
    debug	: false
}
exports.Config = config;

})();