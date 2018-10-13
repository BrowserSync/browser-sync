/**
 *
 * Install:
 *      npm install browser-sync express http-proxy-middleware
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server in the cwd whilst proxying requests
 * to /api to a backend
 *
 */

"use strict";

var browserSync = require("browser-sync").create();
var express = require('express');
var proxy = require('http-proxy-middleware');

var app = express();

app.use('/api', proxy({target: 'http://www.example.org', changeOrigin: true}));

browserSync.init({
    server: ".",
    watch: true,
    middleware: [app]
});
