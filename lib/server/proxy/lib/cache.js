var cached = {};

function clearAll() {
    cached = {};
}

function get(key) {
    if (cached[key] && cached[key].body) {
        return cached[key];
    }
    return false;
}

function set(key, internalKey, value) {
    if (cached[key]) {
        cached[key][internalKey] = value;
    } else {
        cached[key] = {};
        cached[key][internalKey] = value;
    }
}

function deleteHeader(key, headerKey) {
    if (cached[key].headers[headerKey]) {
        delete cached[key].headers[headerKey];
    }
}

function cacheMiddleware(req, res, next) {
    var _write = res.write;
    var _end = res.end;
    var _writeHead = res.writeHead;
    var buffers = [];

    res.write = function (data, encoding) {
        buffers.push(data);
        _write.call(res, data, encoding);
    };

    res.end = function (data, encoding) {
        if (data) {
            res.write(data, encoding);
        }
        var buffer = Buffer.concat(buffers);
        if (buffer.length > 0 || (data && data.length > 0)) {
            cached[req.url].body = buffer || data;
        }
        _end.call(res, encoding);
    };

    res.writeHead = function () {
        if (cached[req.url]) {
            cached[req.url].code = arguments[0];
        } else {
            cached[req.url] = {
                code: arguments[0]
            };
        }
        _writeHead.apply(res, arguments);
    };
    next();
}

module.exports = {
    cacheMiddleware: cacheMiddleware,
    get: get,
    set: set,
    deleteHeader: deleteHeader,
    clearAll: clearAll
};
