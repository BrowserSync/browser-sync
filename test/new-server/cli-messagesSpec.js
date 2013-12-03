'use strict';

var module = require('../../lib/index');
var dConfig = require('../fixtures/si-default-config');
var _ = require('lodash');
var setup = module.setup;
var messages = require('../../lib/messages');
var ansiTrim = require('cli-color/lib/trim');

var defaultConfig;

describe("Message Output", function () {

    var ports, host;

    beforeEach(function(){
        ports = [3000, 3001, 3002];
        host = "192.168.0.3";
//        defaultConfig = _.cloneDeep(dConfig);
    });

    it("can load", function () {
        expect(messages).toBeDefined();
    });

    it("can output a message about proxy (1)", function () {
        var expected = "Proxy running. Use this URL: http://192.168.0.3:3002";
        expect(ansiTrim(messages.initProxy(host, ports[2]))).toBe(expected);
    });
    it("can output a message about proxy (2)", function () {
        var expected = "Proxy running. Use this URL: http://192.168.0.3:3001";
        expect(ansiTrim(messages.initProxy(host, ports[1]))).toBe(expected);
    });
});

describe("using color templates", function () {

    it("can do a single replace", function () {

        var string = "#c:green#this string is green#c";
        var expected = "clc.green('this string is green');";

        var actual = messages.compileColors(string);
        expect(actual).toBe(expected);
    });
    it("can do multiple replaces", function () {

        var string = "#c:green#this string is green #c#c:blue#HERE#c";
        var expected = "clc.green('this string is green ') + clc.blue('HERE');";

        var actual = messages.compileColors(string);
        expect(actual).toBe(expected);
    });
    it("can compile underscore templates", function () {

        var string = "#c:green#<%= name %> ##c:blue#<%= color %>#c";
        var params = {
            name: "Shane Osbourne",
            color: "green"
        };
        var expected = "clc.green('Shane Osbourne ') + clc.blue('green');";

        var actual = messages.compile(string, params);

        expect(actual).toBe(expected);
    });
});

describe("Creating URLS", function () {
    it("can return a full URL with ports", function () {
        expect(messages._makeUrl("192.168.0.4", 3001)).toBe("http://192.168.0.4:3001");
    });
});

describe("Outputting script tags", function () {
    it("can output correctly", function () {

        var expected = "<script src='http://192.168.0.4:3000/socket.io/socket.io.js'></script>" +
                "\n<script src='http://192.168.0.4:3001/browser-sync-client.min.js'></script>\n\n";

        var actual = messages.scriptTags("192.168.0.4", "3000", "3001");

        expect(actual).toBe(expected);
    });
});