var through2 = require("through2");
var vinyl    = require("vinyl");
var combiner = require('stream-combiner2');
var es       = require('event-stream');
var inspect  = require('util').inspect;
var Duplex = require("stream").Duplex;
var stream = new Duplex();

stream._read = function (out) {};

stream._write = function (out) {
    this.push(out);
};

var fn1 = function (data, cb) {
    cb(null, data + "shane");
};

var fn2 = function (data, cb) {
    cb(null, data + " Osbourne");
};

//var stream = through2.obj(function (data, enc, next) {
//    this.push(data);
//    next();
//});

//var stream = new vinyl("hi");

stream
    .pipe(es.map(fn1))
    .pipe(es.map(fn2))
    .pipe(through2.obj(function (out, enc, next) {
        console.log(out);
    }));

stream.write("Hi there: ");


//var fn = through2.obj(function (file, type, next) {
//    console.log("Stream 1");
//    this.push(file.concat([12, 23]));
//    this.emit("error", new Error("Some error thing"));
//    next();
//});
//
//var fn2 = through2.obj(function (file, type, next) {
//    console.log("Stream 2");
//    this.push(file.concat([5, 7]));
//});

//stream
//    .pipe(fn)
//    .pipe(fn2)
//    .pipe(through2.obj(function (out) {
//        console.log("Stream 3, out");
//        console.log(out);
//    }));

//var combinedStream = combiner.obj([
//    stream,
//    fn,
//    fn2,
//    through2.obj(function (out) {
//        console.log("Stream 3, out");
//        console.log(out);
//    })
//]);
//
//stream.write([]);
//
//combinedStream.on("error", console.error.bind(console));

//if (!module.parent) {
//    var es = require('event-stream');
//    var inspect = require('util').inspect;
//
//    process.stdin                        //connect streams together with `pipe`
//        .pipe(es.split())                  //split stream to break on newlines
//        .pipe(es.map(function (data, cb) { //turn this async function into a stream
//            cb(null, inspect(JSON.parse(data)));  //render it nicely
//        }))
//        .pipe(process.stdout)              // pipe it to stdout !
//}