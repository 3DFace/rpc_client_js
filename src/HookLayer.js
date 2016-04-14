/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @param protocol_layer
 * @param {function} pre_fn
 * @param {function} post_fn
 * @constructor
 */
function HookLayer(protocol_layer, pre_fn, post_fn){
	this.send = function(calls){
		calls = pre_fn ? pre_fn(calls) : calls;
		var promises = protocol_layer.send(calls);
		return post_fn ? post_fn(promises) : promises;
	}
}

export default HookLayer;
