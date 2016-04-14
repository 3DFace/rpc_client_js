/* author: Ponomarev Denis <ponomarev@gmail.com> */

define(function(require){

	/**
	 * @param {object} under_layer
	 * @param {function} log_request_fn
	 * @param {function} log_response_fn
	 * @param {function} log_error_fn
	 * @constructor
	 */
	function LogLayer(under_layer, log_request_fn, log_response_fn, log_error_fn){

		this.send = function(calls){

			var i, call;
			if(log_request_fn){
				for(i = 0; i < calls.length; i++){
					call = calls[i];
					log_request_fn("call[" + i + "]", call[0] + '->' + call[1] + '(' + (call[2] && call[2].join(', ') || '') + ')');
				}
			}

			var promises = under_layer.send(calls);

			if(log_response_fn || log_error_fn){
				var new_promises = new Array(promises.length);
				for(i = 0; i < promises.length; i++){
					(function(i){
						new_promises[i] = promises[i].then(function(response){
							log_response_fn && log_response_fn("result[" + i + "]", response);
							return response;
						}, function(error){
							var logger = log_error_fn || log_response_fn;
							logger && logger("error[" + i + "]", error);
							throw error;
						})
					})(i);
				}
				return new_promises;
			}else{
				return promises;
			}
		}
	}

	return LogLayer;

});
