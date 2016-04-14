/* author: Ponomarev Denis <ponomarev@gmail.com> */

define(function(require){

	var Promise = require('promise');

	/**
	 * @param {string} url RPC-server URL
	 * @constructor
	 */
	function AjaxLayer(url){

		this.send = function(request){

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

				xhr.send(request);
			});

		}
	}

	return AjaxLayer;
});
