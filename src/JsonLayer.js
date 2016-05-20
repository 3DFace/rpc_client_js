/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @param {object} text_transport_layer
 * @constructor
 */
function JsonLayer(text_transport_layer){

	this.send = function(request){

		return new Promise(function(resolve, reject){
			try{
				var json = JSON.stringify(request);

				text_transport_layer.send(json).then(function(json_response){
					try{
						var response = JSON.parse(json_response);
					}catch(e){
						reject({
							name: "JsonLayerError",
							message: e.name + ": " + e.message + "\n" + json_response,
							code: 1
						});
					}
					resolve(response);
				}, reject);
			}catch(e){
				reject({
					name: "JsonLayerError",
					message: e.name + ": " + e.message,
					code: 1
				});
			}
		});
	}
}

export default JsonLayer;
