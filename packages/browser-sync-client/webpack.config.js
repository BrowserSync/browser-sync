// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
const webpack = require('webpack');
const path = require('path');
const context = [__dirname];

module.exports = {
    context: path.join.apply(null, context),
    entry: [
        './lib/index'
    ],
    output: {
        path: path.join.apply(null, context.concat("dist")),
        filename: 'index.js',
    },
    plugins: [
        // new webpack.NoEmitOnErrorsPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        // alias: {
        //     "rx": path.resolve(process.cwd(), "public/assets/js/vendor/rx.lite.dom.ajax.js")
        // }
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: ['ts-loader']
            }
        ]
    }
};
