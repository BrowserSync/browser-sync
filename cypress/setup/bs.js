module.exports = function(setup, specs) {

    const cypress = require('cypress');
    const bs      = require('../../').create();

    bs.init(setup, function(err, bs) {
        return cypress.run({
            spec: specs,
            env: `BS_URL=${bs.options.getIn(['urls', 'local'])}`
        })
            .then((results) => {
                // stop your server when it's complete
                bs.cleanup();
                if (results.failures > 0) {
                    return process.exit(1);
                }
                process.exit(0);
            })
    });
};
