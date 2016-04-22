/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @param {string} url RPC-server URL
 * @param {function} pre_request_fn hook fn(xhr)
 * @param {function} post_request_fn hook fn(xhr)
 * @constructor
 */

function AjaxLayer(url, pre_request_fn, post_request_fn){

	this.send = function(request_str){

		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.withCredentials = true;
			pre_request_fn && pre_request_fn(xhr);

			xhr.onload = function(){
				post_request_fn && post_request_fn(xhr, true);
				if(this.status >= 200 && this.status < 300){
					resolve(xhr.response);
				}else{
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};

			xhr.onerror = function(){
				post_request_fn && post_request_fn(xhr, false);
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};

			xhr.send(request_str);
		});

	}
}

export default AjaxLayer;
