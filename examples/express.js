/**
 *
 * Install:
 *      npm install browser-sync express
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server & use the `app` directory as the root
 *  + use any custom routes you have registered with Express
 *
 */

"use strict";

var bs = require("browser-sync").create();
var express = require("express");
var router = express.Router();
var app = express();

/**
 * Catch a route like /user/2324
 * and send a JSON response
 */
router.get("/user/:id", function(req, res) {
    res.send({
        name: "shane",
        pets: ["cat", "hippo"],
        id: req.params.id
    });
});

/**
 * Register the route with Express
 */
app.use(router);

/**
 * Start the Browsersync server and
 * load the express app as middleware
 */
bs.init({
    server: "./app",
    middleware: [app]
});
