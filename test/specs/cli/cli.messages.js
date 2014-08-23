"use strict";

var index    = require("../../../index");
var messages = require("../../../lib/messages");
var config   = require("../../../lib/config");

var ansiTrim = require("cli-color/trim");
var assert   = require("chai").assert;


describe("CLI: Messages", function () {

    it("can be loaded", function () {
        assert.isDefined(messages);
    });

    describe("No server or Proxy output", function () {
        it("should output the", function () {
            var expected = "[BS] Copy the following snippet into your website, just before the closing </body> tag";
            expected    += "\n\n<script type='text/javascript'>//<![CDATA[\n";
            expected    += "document.write(\"";
            expected    += "<script async src='//HOST:PORT/browser-sync-client.1.2.3.js'><\\/script>\".replace(/HOST/g, location.hostname).replace(/PORT/g, location.port));";
            expected    += "\n//]]></script>\n";

            var actual   = ansiTrim(messages.initSnippet(3000, {version: "1.2.3"}));
            assert.equal(actual, expected);
        });
    });

    describe("Server Output", function () {


        it("Can confirm the server is running", function () {

            var expected = "[BS] Local: >>> http://localhost:8000\n";

            var options = {
                urls: {
                    local: "http://localhost:8000"
                }
            };

            var call = messages.initServer(options);
            var actual = ansiTrim(call);
            assert.equal(actual, expected);
        });

        it("Can confirm the server is running with files watching", function () {

            var expected = "[BS] Local: >>> http://localhost:8000\n";
            expected    += "[BS] Serving files from: test/dir\n";

            var options = {
                urls: {
                    local: "http://localhost:8000"
                },
                server: {
                    baseDir: "test/dir"
                }
            };

            var call = messages.initServer(options);
            var actual = ansiTrim(call);
            assert.equal(actual, expected);
        });

        it("Can confirm the server is running with tunnel", function () {

            var expected = "[BS] Local: >>> http://localhost:8000\n";
            expected    += "[BS] External: >>> http://192.168.0.4:8000\n";
            expected    += "[BS] Tunnel: >>> https://abc.localtunnel.com\n";
            expected    += "[BS] Serving files from: test/dir\n";
            expected    += "[BS] Serving files from: test/dir/2\n";

            var options = {
                urls: {
                    local: "http://localhost:8000",
                    external: "http://192.168.0.4:8000",
                    tunnel: "https://abc.localtunnel.com"
                },
                server: {
                    baseDir: ["test/dir", "test/dir/2"]
                }
            };

            var call = messages.initServer(options);
            var actual = ansiTrim(call);
            assert.equal(actual, expected);
        });

        it("Can confirm the server is running with files in multiple dirs", function () {

            var expected = "[BS] Local: >>> http://localhost:8000\n";
            expected    += "[BS] Serving files from: test/dir\n";
            expected    += "[BS] Serving files from: test/dir/2\n";

            var options = {
                urls: {
                    local: "http://localhost:8000"
                },
                server: {
                    baseDir: ["test/dir", "test/dir/2"]
                }
            };

            var call = messages.initServer(options);
            var actual = ansiTrim(call);
            assert.equal(actual, expected);
        });

        it("can fail when both server & proxy supplied", function () {
            var expected = "[BS] Invalid config. You cannot specify both a server & proxy option.";
            var actual   = ansiTrim(messages.server.withProxy());
            assert.equal(actual, expected);
        });

    });

    describe("Proxy Output", function () {

        it("can output a message about proxy (1)", function () {
            var expected = "[BS] Proxying: http://develop.dev\n";
            expected    += "[BS] Now you can access your site through the following addresses:\n";
            expected    += "[BS] Local: >>> http://localhost:8000\n";

            var options = {
                urls: {
                    local: "http://localhost:8000"
                },
                proxy: {
                    target: "http://develop.dev"
                }
            };

            var actual = ansiTrim(messages.initProxy(options));
            assert.equal(actual, expected);
        });

        it("can output a message about proxy (2)", function () {
            var expected = "[BS] Proxying: http://develop.dev\n";
            expected    += "[BS] Now you can access your site through the following addresses:\n";
            expected    += "[BS] Local: >>> http://localhost:8000\n";
            expected    += "[BS] External: >>> http://192.168.0.4:8000\n";

            var options = {
                urls: {
                    local: "http://localhost:8000",
                    external: "http://192.168.0.4:8000"
                },
                proxy: {
                    target: "http://develop.dev"
                }
            };

            var actual = ansiTrim(messages.initProxy(options));
            assert.equal(actual, expected);
        });

        it("can output a message about proxy (3)", function () {
            var expected = "[BS] Proxying: http://develop.dev\n";
            expected    += "[BS] Now you can access your site through the following addresses:\n";
            expected    += "[BS] Local: >>> http://localhost:8000\n";
            expected    += "[BS] External: >>> http://192.168.0.4:8000\n";
            expected    += "[BS] Tunnel: >>> http://123.localtunnel.me\n";

            var options = {
                urls: {
                    local: "http://localhost:8000",
                    external: "http://192.168.0.4:8000",
                    tunnel: "http://123.localtunnel.me"
                },
                proxy: {
                    target: "http://develop.dev"
                }
            };

            var actual = ansiTrim(messages.initProxy(options));
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
            var expected = "[BS] Invalid port range! - At least 3 required!";
            var actual   = ansiTrim(messages.ports.invalid(3));
            assert.equal(actual, expected);
        });
    });

    describe("Outputting script tags", function () {
        var ports;
        before(function () {
            ports = {
                socket: 3000,
                controlPanel: 3001
            };
        });
        it("can output the new snippet", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n";
            expected    += "document.write(\"";
            expected    += "<script async src='//HOST:3000/browser-sync-client.2.3.4.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(3000, {version:"2.3.4"});
            assert.equal(actual, expected);
        });
        it("can output the new snippet for the tunnel", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n";
            expected    += "document.write(\"";
            expected    += "<script async src='/browser-sync-client.2.3.4.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(3000, {version:"2.3.4", tunnel: true});
            assert.equal(actual, expected);
        });
        it("can retrieve the injector", function () {
            var expected = "\n<script type='text/javascript'>//<![CDATA[\n";
            expected    += "document.write(\"";
            expected    += "<script async src='//HOST:3000/browser-sync-client.2.3.5.js'><\\/script>\".replace(/HOST/g, location.hostname));";
            expected    += "\n//]]></script>\n";

            var actual = messages.scriptTags(3000, {version:"2.3.5"});
            assert.equal(actual, expected);
        });
    });

    describe("outputting the client Script file", function () {
        it("should return the client script with a version (1)", function () {
            var options = {
                version: "0.5.5"
            };
            var expected = "/browser-sync-client.0.5.5.js";
            var actual   = messages.clientScript(options);
            assert.equal(actual, expected);
        });
        it("should return the client script with a version (2)", function () {
            var options = {
                version: "1.2.3"
            };
            var expected = "/browser-sync-client.1.2.3.js";
            var actual   = messages.clientScript(options);
            assert.equal(actual, expected);
        });
    });

    describe("Outputting App JS", function () {
        it("should return the app js file", function () {
            var expected = "/js/app.js";
            var actual   = config.controlPanel.jsFile;
            assert.equal(actual, expected);
        });
    });

    describe("Outputting the config created message", function () {
        it("should accept the params and print the correct message", function () {
            var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync start --config bs-config.js";
            var actual    = ansiTrim(messages.config.confirm("/users/shakyshane/app/bs-config.js"));
            assert.equal(actual, expected);
        });
        it("should accept the params and print the correct message (2)", function () {
            var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync start --config bs-config.js";
            var actual    = ansiTrim(messages.config.confirm("/app/bs-config.js"));
            assert.equal(actual, expected);
        });
    });

    describe("Outputting generic messages", function () {
        it("should output browser connected correctly", function () {
            var expected = "[BS] Browser Connected! (Chrome, version: 21.222)";
            var actual = ansiTrim(messages.browser.connection({name: "Chrome", version: "21.222"}, true));
            assert.equal(actual, expected);
        });
        it("should output invalid base dir message", function () {
            var expected = "[BS] Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
            var actual = ansiTrim(messages.invalidBaseDir());
            assert.equal(actual, expected);
        });
    });

    describe("Outputting file watching messages", function () {
        it("should output warning if no files watched", function () {
            var expected = "[BS] Not watching any files...";
            var actual = ansiTrim(messages.files.watching([]));
            assert.equal(actual, expected);
        });
        it("should output a file-watching message", function () {
            var expected = "[BS] Watching files...";
            var actual = ansiTrim(messages.files.watching(["**/*.css"]));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed (1)", function () {
            var expected = "[BS] File Changed: file.js";
            var actual   = ansiTrim(messages.files.changed("/users/shane/file.js"));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed (2)", function () {
            var expected = "[BS] File Changed: file.js";
            var actual   = ansiTrim(messages.files.changed("/file.js"));
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed & should be reloaded", function () {
            var expected = "[BS] Reloading all connected browsers...";
            var actual   = ansiTrim(messages.browser.reload());
            assert.equal(actual, expected);
        });
        it("should notify when a file is changed & should be injected", function () {
            var expected = "[BS] Injecting file into all connected browsers...";
            var actual   = ansiTrim(messages.browser.inject());
            assert.equal(actual, expected);
        });
        it("should notify when changing location", function () {
            var expected = "[BS] Link clicked! Redirecting all browsers to http://local.dev/forms.html";
            var actual   = ansiTrim(messages.location("http://local.dev/forms.html"));
            assert.equal(actual, expected);
        });
        it("should output the socket connector", function () {
            var expected = "var ___socket___ = io.connect(location.hostname + ':3001');";
            var actual   = messages.socketConnector(3001, {});
            assert.equal(actual, expected);
        });
    });

    describe("Outputting the message about multiple IPs", function () {
        it("should warn when multiple IPs found", function () {
            var expected = "[BS] Warning: Multiple External IP addresses found\n";
            expected    += "[BS] If you have problems, you may need to manually set the 'host' option";
            var actual   = ansiTrim(messages.host.multiple());
            assert.equal(actual, expected);
        });
    });

    describe("Outputting stream messages", function () {
        it("should output about single files", function () {
            var expected = "[BS] Reloading Browsers";
            var actual   = ansiTrim(messages.stream.once());
            assert.equal(actual, expected);
        });
        it("should output about multiple files", function () {
            var expected = "[BS] Reloading 2 files (style1.css, style2.css)";
            var actual   = ansiTrim(messages.stream.multi(["style1.css", "style2.css"]));
            assert.equal(actual, expected);
        });
        it("should output about multiple files", function () {
            var expected = "[BS] Reloading 1 file (style1.css)";
            var actual   = ansiTrim(messages.stream.multi(["style1.css"]));
            assert.equal(actual, expected);
        });
    });
});
