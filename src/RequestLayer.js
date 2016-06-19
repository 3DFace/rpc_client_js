/* author: Ponomarev Denis <ponomarev@gmail.com> */

import request from 'request';

/**
* @param {string} url RPC-server URL
* @param {?object} options for 'request' lib
* @param {?function} pre_request_fn hook fn(requestOptions)
* @param {?function} post_request_fn hook fn(response, successful)
* @constructor
*/
function RequestLayer(url, pre_request_fn, post_request_fn){

	this.send = function(request_str){

		return new Promise(function(resolve, reject){

			var requestOptions = {
				method: 'POST',
				uri: url,
				body: request_str,
				jar: true
			};

			pre_request_fn && pre_request_fn(requestOptions);

			request(requestOptions, function(error, response, body){
					var status = response.statusCode;
					if(!error && status >= 200 && status < 300){
						post_request_fn && post_request_fn(response, true);
						resolve(body);
					}else{
						post_request_fn && post_request_fn(response, false);
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
