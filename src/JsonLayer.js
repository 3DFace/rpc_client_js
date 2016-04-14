/* author: Ponomarev Denis <ponomarev@gmail.com> */

define(function(require){

	var Promise = require('promise');

	/**
	 *
	 * @param {object} under_layer
	 * @constructor
	 */
	function JsonLayer(under_layer){

		this.send = function(request){

			return new Promise(function(resolve, reject){
				try{
					var json = JSON.stringify(request);

					under_layer.send(json).then(function(json_response){
						try{
							var response = JSON.parse(json_response);
						}catch(e){
							reject({
								name: "JsonLayerError",
								message: e.name + ": " + e.message + "\n" + json_response
							});
						}
						resolve(response);
					}, reject);
				}catch(e){
					reject({
						name: "JsonLayerError",
						message: e.name + ": " + e.message
					});
				}
			});
		}
	}

	return JsonLayer;

});
