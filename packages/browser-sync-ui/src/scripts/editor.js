var Codemirror = require("codemirror");
var jsMode = require('codemirror/mode/javascript/javascript.js');

(function () {

    angular
        .module("bsEditor", [])
        .service('Editor', function () {
            return Codemirror;
        });

})(angular);

