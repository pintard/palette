const path = require('path')

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        publicPath: 'dist',
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'umd',
            name: 'ColorPicker',
        }
    },
    target: 'node'
}