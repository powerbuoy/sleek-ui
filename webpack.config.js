const path = require('path');

module.exports = {
	entry: {
		'sleek-ui': './src/js/sleek-ui.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		library: 'sleek-ui',
		libraryTarget: 'umd'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										'targets': {
											'esmodules': true
										}
									}
								]
							]
						}
					}
				]
			}
		]
	}
};
