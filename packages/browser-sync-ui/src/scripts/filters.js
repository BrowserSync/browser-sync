var module = require("./module"); //jshint ignore:line
var utils  = require("./utils"); //jshint ignore:line

module
    .filter("ucfirst",       function () { return utils.ucfirst;       })
    .filter("localRootUrl",  function () { return utils.localRootUrl;  })
    .filter("localUrl",      function () { return utils.localRootUrl;  })
    .filter("orderObjectBy", function () { return utils.orderObjectBy; });