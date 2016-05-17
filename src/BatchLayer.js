/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @constructor
 */
function BatchLayer(){

	var layer = this;
	var i, calls_acc = [], callbacks_acc = [];

	layer.send = function(calls){
		var promises = new Array(calls.length);
		calls_acc = calls_acc.concat(calls);
		for(i = 0; i < calls.length; i++){
			promises[i] = new Promise(function(resolve, reject){
				callbacks_acc.push([resolve, reject]);
			});
		}
		return promises;
	};

	layer.flush = function(protocol_layer){
		var promises = protocol_layer.send(calls_acc);
		for(var i = 0; i < callbacks_acc.length; i++){
			promises[i].then(callbacks_acc[i][0], callbacks_acc[i][1]);
		}
		return promises;
	};

}

export default BatchLayer;
