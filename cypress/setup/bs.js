const cypress = require('cypress');
const exec = require('child_process');
const assert = require('assert');
const {join} = require('path');
const {Observable} = require('rxjs');

module.exports = function(opts, ctx) {

    assert.ok(typeof opts.config === 'string', '`opts.config` should be a string');
    assert.ok(typeof opts.spec === 'string', '`opts.spec` should be a string');
    assert.ok((opts.action === 'run' || opts.action === 'open'), '`action` should be either run or open');

    const json = require(join(ctx.config.cwd, opts.config));

    return Observable.create(obs => {
        const bs = require('../../packages/browser-sync').create();
        const instance = bs.init(json, function(err, bs) {
            if (err) {
                return obs.error(err);
            }
            return cypress[opts.action]({
                spec: opts.spec,
                env: `BS_URL=${bs.options.getIn(['urls', 'local'])},BS_UI_URL=${bs.options.getIn(['urls', 'ui'])}`
            })
                .then((results) => {
                    // stop your server when it's complete
                    if (results.failures > 0) {
                        return obs.error(new Error('Errors occurred'));
                    }
                    instance.cleanup();
                    obs.complete();
                })
        });
    });
};
