/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @param protocol_layer
 * @param {function} layer_fn
 * @constructor
 */
function HookLayer(protocol_layer, layer_fn){
	this.send = function(calls){
		return layer_fn(calls, protocol_layer);
	}
}

export default HookLayer;
