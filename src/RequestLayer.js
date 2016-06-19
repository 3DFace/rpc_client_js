/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
* @param {string} url RPC-server URL
* @param {function} request_fn 'request' library fn(requestOptions, callback)
* @constructor
*/
function RequestLayer(url, request_fn){

	this.send = function(request_str){

		return new Promise(function(resolve, reject){

			var requestOptions = {
				method: 'POST',
				uri: url,
				body: request_str,
				jar: true
			};

			request_fn(requestOptions, function(error, response, body){
					var status = response && response.statusCode;
					if(!error && status >= 200 && status < 300){
						resolve(body);
					}else{
						reject({
							status: status,
							error: error
						});
					}
				});
		});

	}
}

export default RequestLayer;
