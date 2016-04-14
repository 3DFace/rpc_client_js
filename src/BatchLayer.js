/* author: Ponomarev Denis <ponomarev@gmail.com> */

define(function(require){

	var Promise = require('promise');

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
			var new_promises = new Array(promises.length);
			for(var i = 0; i < callbacks_acc.length; i++){
				new_promises[i] = promises[i].then(callbacks_acc[i][0], callbacks_acc[1]);
			}
			return new_promises;
		};

	}

	return BatchLayer;

});
