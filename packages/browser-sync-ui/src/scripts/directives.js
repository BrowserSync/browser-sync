var module = require("./module"); //jshint ignore:line

module.directive("icon", require("./directives/icon"));
module.directive("linkTo", require("./directives/link-to"));
module.directive("switch", require("./directives/switch"));
module.directive("newTab", require("./directives/new-tab"));