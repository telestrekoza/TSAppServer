#!/usr/bin/node

(function() {

var config = {
    VERSION	: "0.3",
    host	: "127.0.0.1",
    port	: 28080,
    INDEX	: 'index.js',
    DOCROOT	: './example',
    SESSIONPATH : '/tmp',
    gid		: 1000,
    uid		: 100,
    showError	: true,
    parseRewriteURL: true,
    debug	: false
}
exports.Config = config;

})();