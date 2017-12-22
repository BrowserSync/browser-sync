var socket = require("socket.io-client");

/**
 * @type {{emit: emit, on: on}}
 */
var socketConfig = window.___browserSync___.socketConfig;
var socketUrl = window.___browserSync___.socketUrl;
var io = socket(socketUrl, socketConfig);

/**
 * *****BACK-COMPAT*******
 * Scripts that come after Browsersync may rely on the previous window.___browserSync___.socket
 */
window.___browserSync___.socket = io;

/**
 * @returns {string}
 */
exports.getPath = function() {
    return window.location.pathname;
};
/**
 * Alias for socket.emit
 * @param name
 * @param data
 */
exports.emit = function(name, data) {
    if (io && io.emit) {
        // send relative path of where the event is sent
        data.url = exports.getPath();
        io.emit(name, data);
    }
};

/**
 * Alias for socket.on
 * @param name
 * @param func
 */
exports.on = function(name, func) {
    io.on(name, func);
};
