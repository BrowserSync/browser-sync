var meow = require("meow");

var cli = meow({
    help: [
              'Usage',
              '  foo-app <input>'
          ].join('\n')
});


console.log(cli.input);
console.log(cli.flags);
