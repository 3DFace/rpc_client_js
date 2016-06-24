/* author: Ponomarev Denis <ponomarev@gmail.com> */

import BatchLayer from "./BatchLayer";

/**
 * @param {object} protocol_layer
 * @constructor
 */
function RpcClient(protocol_layer){

	var client = this;

	client.call = function(service, method, params){
		return protocol_layer.send([[service, method, params]])[0];
	};

	client.batch = function(callback){
		var batchLayer = new BatchLayer();
		var batchClient = new RpcClient(batchLayer);
		callback(batchClient);
		var promises = batchLayer.flush(protocol_layer);
		return new Promise(function(resolve){
			var wait = promises.length;
			function done(){
				--wait || resolve();
			}
			promises.forEach(function(p){
				p.then(done, done);
			});
		});
	};

}

export default RpcClient;
