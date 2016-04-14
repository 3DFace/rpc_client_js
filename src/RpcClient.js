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
		return batchLayer.flush(protocol_layer);
	};

}

export default RpcClient;
