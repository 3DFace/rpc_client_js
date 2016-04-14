/* author: Ponomarev Denis <ponomarev@gmail.com> */

/**
 * @param {string} url RPC-server URL
 * @constructor
 */
function AjaxLayer(url){

	this.send = function(request_str){

		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.withCredentials = true;

			xhr.onload = function(){
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
