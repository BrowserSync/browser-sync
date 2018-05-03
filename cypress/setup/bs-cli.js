const cypress = require('cypress');
const exec = require('child_process');
const assert = require('assert');
const {Observable} = require('rxjs/Observable');

module.exports = function(opts) {

    assert.ok(Array.isArray(opts.args), '`args` should be an array of strings');
    assert.ok(opts.args.every(arg => typeof arg === 'string'), '`args` should contain only strings');

    return Observable.create(obs => {
        const ls = exec.spawn('node', [
            'dist/bin',
            ...opts.args
        ]);

        ls.stdout.once('data', (data) => {
            try {
                const parsed = JSON.parse(String(data));
                const {urls} = parsed["service:running"].options;

                return cypress.run({
                    spec: opts.spec,
                    env: `BS_URL=${urls.local}`
                })
                    .then((results) => {
                        // stop your server when it's complete
                        if (results.failures > 0) {
                            return obs.error(new Error('failed!'));
                        }
                        obs.complete();
                    })
            } catch (e) {
                console.error('Parsing Browsersync output failed', e);
                return obs.error(new Error('failed!'));
            }
        });
        ls.stderr.on('data', (data) => {
            console.log(data);
            return obs.error(new Error('failed!'));
        });
        return () => {
            ls.kill();
        }
    });
};
