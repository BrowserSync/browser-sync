var angular     = require('../angular');
var store      = require('store');
var objectPath = require('object-path');

angular
    .module("bsStore", [])
    .service("Store", ["$q", "$rootScope", StoreModule]);

function Store (ns) {
    var bs = store.get('bs', {});
    if (!Object.keys(bs).length) {
        store.set('bs', {});
    }
    this.ns = ns;
    this.get = function (path) {
        var bs = store.get('bs', {});
        if (!Object.keys(bs).length) {
            store.set('bs', {});
        }
        return objectPath.get(bs, [ns].concat(path).join('.'));
    };
    this.set = function (path, value) {
        var bs = store.get('bs', {});
        if (!Object.keys(bs).length) {
            store.set('bs', {});
        }
        if (!bs[ns]) {
            bs[ns] = {};
        }
        bs[ns][path] = value;
        store.set('bs', bs);
    },
    this.remove = function (path) {
        var bs = store.get('bs', {});
        if (!Object.keys(bs).length) {
            store.set('bs', {});
        }
        if (!bs[ns]) {
            bs[ns] = {};
        }
        if (bs[ns][path]) {
            delete bs[ns][path];
        }
        store.set('bs', bs);
    }
}

function StoreModule () {

    return {
        create: function (ns) {
            var store = new Store(ns);
            return store;
        }
    }
};

