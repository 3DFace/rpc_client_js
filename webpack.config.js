var path = require('path');
var min = process.env.VERSION == "min";

module.exports = {
	entry: __dirname + '/src/index.js',
	devtool: 'source-map',
	output: {
		path: __dirname + '/lib',
		filename: min ? "rpc_client.min.js" : "rpc_client.js",
		library: 'rpc_client',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	externals: {
		"promise" : "promise",
		"request" : "request"
	},
	resolve: {
		root: path.resolve('./src'),
		extensions: ['', '.js']
	}
};
