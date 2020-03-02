// Utils
const path = require('path');
const glob = require('glob');

// Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Base config
var config = {
	// In
	entry: {
		'sleek-ui': ['./src/js/sleek-ui.js', './src/sass/sleek-ui.scss']
	},

	// n out
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},

	// Plug-ins
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],

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
			},

			// SASS
			{
				test: /\.(s)?css$/,
				exclude: /node_modules/,
				use: [
					// Extract CSS(???)
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							sourceMap: true
						}
					},

					// Enable importing CSS(???)
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
							url: false // Don't parse url()
						}
					},

					// PostCSS (autoprefixer etc)
					{
						loader: 'postcss-loader',
						options: {
							plugins: [
								require('autoprefixer'),
								require('postcss-custom-media'),
								require('postcss-custom-selectors')
							],
							sourceMap: true
						}
					},

					// SASS
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
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
	else {
		config.plugins.push(new OptimizeCssAssetsPlugin());
	}

	return config;
};
