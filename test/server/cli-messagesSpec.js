"use strict";

var index = require("../../lib/index");
var messages = require("../../lib/messages");
var ansiTrim = require("cli-color/lib/trim");

var assert = require("chai").assert;


describe("Messages module", function () {
    it("can be loaded", function () {
        assert.isDefined(messages);
    });
});

describe("Server Output", function () {
    var expected = "\nOK, Server running at http://0.0.0.0:8000";
    expected    += "\nServing files from: /users/shakyshane/app/files";
    expected    += "\n\nLoad a browser & check back here. If you set up everything correctly, you'll see a 'Browser Connected' message\n";
    var actual = ansiTrim(messages.initServer("0.0.0.0", 8000, "/users/shakyshane/app/files"));

    assert.equal(actual, expected);
});

describe("Proxy Output", function () {

    var ports, host;

    beforeEach(function () {
        ports = [3000, 3001, 3002];
        host = "192.168.0.3";
    });

    it("can output a message about proxy (1)", function () {
        var expected = "Proxy running. Use this URL: http://192.168.0.3:3002";
        var actual   = ansiTrim(messages.initProxy(host, ports[2]));
        assert.equal(actual, expected);
    });
    it("can output a message about proxy (2)", function () {
        var expected = "Proxy running. Use this URL: http://192.168.0.3:3001";
        var actual   = ansiTrim(messages.initProxy(host, ports[1]));
        assert.equal(actual, expected);
    });
});

describe("Creating URLS", function () {
    it("can return a full URL with ports", function () {
        var expected = "http://192.168.0.4:3001";
        var actual   = messages._makeUrl("192.168.0.4", 3001, "http:");
        assert.equal(actual, expected);
    });
});


describe("Port Errors", function () {
    it("can print a error msg before killing process", function () {
        var expected = "Invalid port range! - At least 3 required!";
        var actual   = ansiTrim(messages.ports.invalid(3));
        assert.equal(actual, expected);
    });
});

describe("Outputting script tags", function () {
    it("can output correctly", function () {
        var expected = "<script src='//192.168.0.4:3000/socket.io/socket.io.js'></script>" +
                "\n<script src='//192.168.0.4:3001/client/browser-sync-client.min.js'></script>\n\n";
        var actual = messages.scriptTags("192.168.0.4", "3000", "3001");
        assert.equal(actual, expected);
    });
});

describe("outputting the client Script", function () {
    it("should default to the uglified file", function () {
        var expected = "/client/browser-sync-client.min.js";
        var actual   = messages.clientScript();
        assert.equal(actual, expected);
    });
    it("should output the dev file if devmode activated in options", function () {
        var expected = "/client/browser-sync-client.js";
        var actual   = messages.clientScript({ devMode:true });
        assert.equal(actual, expected);
    });
});

describe("Outputting shims JS", function () {
    it("should return the client-shim js file", function () {
        var expected = "/client/client-shims.js";
        var actual   = messages.client.shims;
        assert.equal(actual, expected);
    });
});

describe("Outputting the config created message", function () {
    it("should accept the params and print the correct message", function () {
        var expected  = "Config file created at /users/shakyshane/app/bs-config.js\n";
            expected += "To use it, in the same directory run: browser-sync --config bs-config.js";
        var actual    = ansiTrim(messages.config.confirm("/users/shakyshane/app/bs-config.js"));
        assert.equal(actual, expected);
    });
    it("should accept the params and print the correct message (2)", function () {
        var expected  = "Config file created at /app/bs-config.js\n";
            expected += "To use it, in the same directory run: browser-sync --config bs-config.js";
        var actual    = ansiTrim(messages.config.confirm("/app/bs-config.js"));
        assert.equal(actual, expected);
    });
});

describe("Outputting generic messages", function () {
    it("should output browser connected correctly", function () {
        var expected = "Browser Connected! (Chrome, version: 21.222)";
        var actual = ansiTrim(messages.browser.connection({name: "Chrome", version: "21.222"}));
        assert.equal(actual, expected);
    });
    it("should output invalid base dir message", function () {
        var expected = "Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
        var actual = ansiTrim(messages.invalidBaseDir());
        assert.equal(actual, expected);
    });
});

describe("Outputting file watching messages", function () {
    it("should output warning if no files watched", function () {
        var expected = "Not watching any files...";
        var actual = ansiTrim(messages.files.watching([]));
        assert.equal(actual, expected);
    });
    it("should output a single pattern", function () {
        var expected = "Watching the following:\n";
        expected += "**/*.css\n";

        var actual = ansiTrim(messages.files.watching(["**/*.css"]));
        assert.equal(actual, expected);
    });
    it("should output multiple patterns", function () {

        var patterns = [
            "**/*.css",
            "**/*.js",
            "**/*.html",
            "**/*.erb"
        ];

        var expected = "Watching the following:\n";
        expected += "**/*.css\n";
        expected += "**/*.js\n";
        expected += "**/*.html\n";
        expected += "**/*.erb\n";

        var actual = ansiTrim(messages.files.watching(patterns));
        assert.equal(actual, expected);
    });
    it("should output multiple patterns with a limit", function () {

        var patterns = [
            "**/*.css",
            "**/*.js",
            "**/*.html",
            "**/*.erb"
        ];

        var expected = "Watching the following:\n";
        expected += "**/*.css\n";
        expected += "**/*.js\n";
        expected += "Plus more...\n";

        var actual = ansiTrim(messages.files.watching(patterns, 2));
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed", function () {
        var expected = "File Changed: /users/shane/file.js";
        var actual   = ansiTrim(messages.files.changed("/users/shane/file.js"));
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed & should be reloaded", function () {
        var expected = "Reloading all connected browsers...";
        var actual   = ansiTrim(messages.browser.reload());
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed & should be injected", function () {
        var expected = "Injecting file into all connected browsers...";
        var actual   = ansiTrim(messages.browser.inject());
        assert.equal(actual, expected);
    });
    it("should notify when changing location", function () {
        var expected = "Link clicked! Redirecting all browsers to http://local.dev/forms.html";
        var actual   = ansiTrim(messages.location("http://local.dev/forms.html"));
        assert.equal(actual, expected);
    });
    it("should output the socket connector", function () {
        var expected = ";var ___socket___ = io.connect('http://0.0.0.0:3001');";
        var actual   = messages.socketConnector("0.0.0.0", 3001);
        assert.equal(actual, expected);
    });
});
