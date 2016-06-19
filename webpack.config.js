var path = require('path');

module.exports = {
	entry: __dirname + '/src/index.js',
	devtool: 'source-map',
	output: {
		path: __dirname + '/lib',
		filename: 'rpc_client.js',
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
