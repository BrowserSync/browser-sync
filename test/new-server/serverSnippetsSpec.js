var si = require("../../lib/browser-sync");
var browserSync = new si();
var messages = require("../../lib/messages");
var http = require("http");

var ports = [3001, 3002];

var expectedMatch1 = "<script src='http://0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='http://0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a server with snippets", function () {

    var server;

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };

        server = browserSync.launchServer("0.0.0.0", ports, options);
    });

    afterEach(function () {
        server.close();
    });

    /**
     *
     *
     * SMALL HTML PAGE
     *
     *
     */
    it("can append the script tags before the closing body tag of html files", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[1] + "/index.html", function (res) {
            res.setEncoding('utf8');
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
            });
        });

        waitsFor(function () {
            return data;
        }, "Took too long", 1000);

        runs(function () {
            var closingBodyPosition = data.indexOf("</body>");
            var firstSnippetPosition = data.indexOf(expectedMatch1);
            var sceondSnippetPosition = data.indexOf(expectedMatch2);

            expect(firstSnippetPosition >= 0).toBe(true);
            expect(firstSnippetPosition < closingBodyPosition).toBe(true);
            expect(sceondSnippetPosition >= 0).toBe(true);
            expect(sceondSnippetPosition < closingBodyPosition).toBe(true);
        });
    });

    /**
     *
     *
     * LARGE HTML PAGE
     *
     *
     */
    it("can append the script tags to the body of a LARGE html FILE", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[1] + "/index-large.html", function (res) {
            res.setEncoding('utf8');
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
            });
        });

        waitsFor(function () {
            return data;
        }, "Took too long", 1000);

        runs(function () {
            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
        });
    });

    /**
     *
     *
     * HTML PAGE WITH AT LEAST ONE SCRIPT-TAG
     *
     *
     */
     it("can prepend the script tags before any present script tags inside the body", function () {

        var data;
        
        http.get("http://0.0.0.0:" + ports[1] + "/index-with-scripts.html", function (res) {
            res.setEncoding("utf8");
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
            });
        });

        waitsFor(function () {
            return data;
        }, "Took too long", 1000);

        runs(function () {
            var scriptPosition = data.indexOf("<script>// dummy</script>");

            expect(data.indexOf(expectedMatch1)).toBeLessThan(scriptPosition);
            expect(data.indexOf(expectedMatch2)).toBeLessThan(scriptPosition);
        });
     });
});
