"use strict";

var portScanner = require("portscanner");

module.exports = {
    /**
     * Get port range with default fallbacks
     * @param {Number} minCount
     * @param {Number} [min]
     * @param {Number} [max]
     * @returns {{min: (Number), max: (Number)}
     */
    getPortRange: function (minCount, min, max) {

        if (min && max) {
            if ((max - min + 1) < minCount) {
                return false;
            }
            return {
                min: min,
                max: max
            };
        }

        if (min) {
            max = min + 500;
            return {
                min: min,
                max: max < 10000 ? max : 9999
            };
        }

        return {
            min: 3000,
            max: 4000
        };
    },
    /**
     * @param {Number} count
     * @param {Function} callback
     * @param {Number} [min]
     * @param {Number} [max]
     */
    getPorts: function (count, callback, min, max) {

        var ports = [];
        var lastFound = min - 1 || 2999;

        // get a port (async)
        var getPort = function () {
            portScanner.findAPortNotInUse(lastFound + 1, max || 4000, "localhost", function (error, port) {
                ports.push(port);
                lastFound = port;
                runAgain();
            });
        };

        // run again if number of ports not reached
        var runAgain = function () {
            if (ports.length < count) {
                getPort();
            } else {
                return callback(ports);
            }
            return false;
        };

        // Get the first port
        getPort();
    }
};