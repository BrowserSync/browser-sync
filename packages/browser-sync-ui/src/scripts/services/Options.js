var app = require("../module");

app.factory("Options", ["Socket", OptionsService]);

/**
 * @param Socket
 * @returns {{all: Function}}
 * @constructor
 */
function OptionsService(Socket) {

    return {
        all: function () {
            return Socket.getData("options");
        }
    };
}