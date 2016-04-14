/* author: Ponomarev Denis <ponomarev@gmail.com> */

define(function(require){

	var Promise = require('promise');

	function extractResult(response){
		if(typeof response !== "object"){
			throw {name: "RpcProtocolError", message: "Bad response format: object expected, got " + (typeof response)};
		}
		if(response["status"] === undefined){
			throw {name: "RpcProtocolError", message: "no status"};
		}
		if(response["result"] === undefined){
			throw {name: "RpcProtocolError", message: "no result"};
		}
		if(!response["status"]){
			throw {name: response["result"]["type"] || "UnknownError", message: response["result"]["message"] || ""};
		}
		return response["result"];
	}

	/**
	 * @param {object} under_layer
	 * @constructor
	 */
	function ProtocolLayer(under_layer){

		var id = 1;

		this.send = function(calls){

			var i, call;
			var promises = new Array(calls.length);
			var callbacks = [];
			if(calls.length > 0){

				var formed_calls = new Array(calls.length);

				for(i = 0; i < calls.length; i++){
					call = calls[i];
					formed_calls[i] = {
						service: call[0],
						method: call[1]
					};
					if(call[2] && call[2].length > 0){
						formed_calls[i].parameters = call[2];
					}
					promises[i] = new Promise(function(resolve, reject){
						callbacks.push([resolve, reject]);
					});
				}

				var request = {
					id: id++,
					calls: formed_calls
				};

				under_layer.send(request).then(function(response){
					try{
						var result = extractResult(response);
						for(i = 0; i < callbacks.length; i++){
							try{
								var r = extractResult(result[i]);
								callbacks[i][0](r);
							}catch(e){
								callbacks[i][1](e);
							}
						}
					}catch(e){
						for(i = 0; i < callbacks.length; i++){
							callbacks[i][1](e);
						}
					}
				}, function(e){
					for(i = 0; i < callbacks.length; i++){
						callbacks[i][1](e);
					}
				});
			}
			return promises;
		}

	}

	return ProtocolLayer;

});
