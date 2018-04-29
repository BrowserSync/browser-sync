const run = require('./bs');
const args = process.argv.slice(2);
const config = require(args[0]);
const specs = args.slice(1);
run(config, specs);