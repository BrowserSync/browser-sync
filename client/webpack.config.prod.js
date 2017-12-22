// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
const webpack = require('webpack');
const path = require('path');
const context = [__dirname];

module.exports = {
    devtool: 'source-map',
    context: path.join.apply(null, context),
    entry: [
        './src/index'
    ],
    output: {
        path: path.join.apply(null, context.concat("dist")),
        filename: 'bundle.min.js',
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        // alias: {
        //     "rx": path.resolve(process.cwd(), "public/assets/js/vendor/rx.lite.dom.ajax.js")
        // }
    },
    module: {
        loaders: [
            {
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader']
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    }
};
