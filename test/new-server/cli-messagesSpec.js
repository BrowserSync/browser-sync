'use strict';

var module = require('../../lib/index');
var dConfig = require('../fixtures/si-default-config');
var setup = module.setup;
var messages = require('../../lib/messages');
var ansiTrim = require('cli-color/lib/trim');
var cliStrings = require('../../lib/cli-strings');


describe("Message Output", function () {

    var ports, host;

    beforeEach(function(){
        ports = [3000, 3001, 3002];
        host = "192.168.0.3";
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

describe("Outputting generic messages", function () {

    it("should output browser connected correctly", function () {

        var expected = "Browser Connected! (Chrome, version: 21.222)";
        var actual = ansiTrim(messages.connection({name: "Chrome", version: "21.222"}));

        expect(actual).toBe(expected);
    });
    it("should output invalid base dir message", function () {

        var expected = "Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
        var actual = ansiTrim(messages.invalidBaseDir());

        expect(actual).toBe(expected);
    });
    it("should output the location changed message", function () {

        var expected = "Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
        var actual = ansiTrim(messages.invalidBaseDir());

        expect(actual).toBe(expected);
    });
});
