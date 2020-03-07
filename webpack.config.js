// Utils
const path = require('path');

// Base config
var config = {
	// In
	entry: {
		'sleek-ui': './src/js/sleek-ui.js'
	},

	// n out
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		library: 'sleek-ui',
		libraryTarget: 'umd'
	},

	// Config
	module: {
		rules: [
			// JS
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					// Babel
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				]
			}
		]
	}
};

// Finish config
module.exports = (env, argv) => {
	// Dev only
	if (argv.mode === 'development') {
		// Watch
		config.watch = true;
		config.watchOptions = {
			ignored: /node_modules/,
			aggregateTimeout: 300
		};

		// Sourcemaps
		config.devtool = 'source-map';
	}

	return config;
};
