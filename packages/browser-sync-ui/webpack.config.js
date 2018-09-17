var webpack = require('webpack');
var config = {
    devtool: 'sourcemaps',
    context: __dirname + '/src/scripts',
    entry: [
        "./app.js"
    ],
    output: {
        path: __dirname + "/public",
        filename: "js/app.js"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true
        })
    ],
    watchOptions: {
        poll: true
    }
};

module.exports = config;
