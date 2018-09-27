const path = require('path');

module.exports = {
	mode: 'development',
    entry: {
        'client': './client/client.js',
        'console': './client/console.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'client/dist')
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
};