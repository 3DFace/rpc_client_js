(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("request"));
	else if(typeof define === 'function' && define.amd)
		define("rpc_client", ["request"], factory);
	else if(typeof exports === 'object')
		exports["rpc_client"] = factory(require("request"));
	else
		root["rpc_client"] = factory(root["request"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_9__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	
	/* harmony default export */ exports["a"] = AjaxLayer;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	
	/* harmony default export */ exports["a"] = HookLayer;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	
	/* harmony default export */ exports["a"] = JsonLayer;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	/**
	 * @param {object} protocol_layer
	 * @param {function} log_request_fn
	 * @param {function} log_response_fn
	 * @param {function} log_error_fn
	 * @constructor
	 */
	function LogLayer(protocol_layer, log_request_fn, log_response_fn, log_error_fn){
	
		this.send = function(calls){
	
			var i, call;
			if(log_request_fn){
				for(i = 0; i < calls.length; i++){
					call = calls[i];
					log_request_fn("call[" + i + "]", call[0] + '->' + call[1] + '(' + (call[2] && call[2].join(', ') || '') + ')');
				}
			}
	
			var promises = protocol_layer.send(calls);
	
			if(log_response_fn || log_error_fn){
				for(i = 0; i < promises.length; i++){
					(function(i){
						promises[i].then(function(response){
							log_response_fn && log_response_fn("result[" + i + "]", response);
							return response;
						}, function(error){
							var logger = log_error_fn || log_response_fn;
							logger && logger("error[" + i + "]", error);
						})
					})(i);
				}
			}
			return promises;
		}
	}
	
	/* harmony default export */ exports["a"] = LogLayer;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	function extractResult(response){
		if(typeof response !== "object"){
			throw {name: "RpcProtocolError", message: "Bad response format: object expected, got " + (typeof response), code: 1};
		}
		if(response["status"] === undefined){
			throw {name: "RpcProtocolError", message: "no status", code: 1};
		}
		if(response["result"] === undefined){
			throw {name: "RpcProtocolError", message: "no result", code: 1};
		}
		if(!response["status"]){
			throw {name: response["result"]["type"] || "UnknownError", message: response["result"]["message"] || "", code: response["result"]["code"] || 0};
		}
		return response["result"];
	}
	
	/**
	 * @param {object} json_layer
	 * @constructor
	 */
	function ProtocolLayer(json_layer){
	
		var id = 1;
	
		this.send = function(calls){
	
			var i, call;
			var promises = new Array(calls.length);
			var callbacks = [];
			if(calls.length > 0){
	
				var formed_calls = new Array(calls.length);
	
				for(i = 0; i < calls.length; i++){
					call = calls[i];
					formed_calls[i] = {
						service: call[0],
						method: call[1]
					};
					if(call[2] && call[2].length > 0){
						formed_calls[i].parameters = call[2];
					}
					promises[i] = new Promise(function(resolve, reject){
						callbacks.push([resolve, reject]);
					});
				}
	
				var request = {
					id: id++,
					calls: formed_calls
				};
	
				json_layer.send(request).then(function(response){
					try{
						var result = extractResult(response);
						for(i = 0; i < callbacks.length; i++){
							try{
								var r = extractResult(result[i]);
								callbacks[i][0](r);
							}catch(e){
								callbacks[i][1](e);
							}
						}
					}catch(e){
						for(i = 0; i < callbacks.length; i++){
							callbacks[i][1](e);
						}
					}
				}, function(e){
					for(i = 0; i < callbacks.length; i++){
						callbacks[i][1](e);
					}
				});
			}
			return promises;
		}
	
	}
	
	/* harmony default export */ exports["a"] = ProtocolLayer;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_request__ = __webpack_require__(9);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_request___default = __WEBPACK_IMPORTED_MODULE_0_request__ && __WEBPACK_IMPORTED_MODULE_0_request__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_0_request__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_0_request__; };
	/* harmony import */ __webpack_require__.d(__WEBPACK_IMPORTED_MODULE_0_request___default, 'a', __WEBPACK_IMPORTED_MODULE_0_request___default);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
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
	
				__WEBPACK_IMPORTED_MODULE_0_request___default()(requestOptions, function(error, response, body){
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
	
	/* harmony default export */ exports["a"] = RequestLayer;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BatchLayer__ = __webpack_require__(7);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	/**
	 * @param {object} protocol_layer
	 * @constructor
	 */
	function RpcClient(protocol_layer){
	
		var client = this;
	
		client.call = function(service, method, params){
			return protocol_layer.send([[service, method, params]])[0];
		};
	
		client.batch = function(callback){
			var batchLayer = new __WEBPACK_IMPORTED_MODULE_0__BatchLayer__["a" /* default */]();
			var batchClient = new RpcClient(batchLayer);
			callback(batchClient);
			return batchLayer.flush(protocol_layer);
		};
	
	}
	
	/* harmony default export */ exports["a"] = RpcClient;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	/**
	 * @constructor
	 */
	function BatchLayer(){
	
		var layer = this;
		var i, calls_acc = [], callbacks_acc = [];
	
		layer.send = function(calls){
			var promises = new Array(calls.length);
			calls_acc = calls_acc.concat(calls);
			for(i = 0; i < calls.length; i++){
				promises[i] = new Promise(function(resolve, reject){
					callbacks_acc.push([resolve, reject]);
				});
			}
			return promises;
		};
	
		layer.flush = function(protocol_layer){
			var promises = protocol_layer.send(calls_acc);
			for(var i = 0; i < callbacks_acc.length; i++){
				promises[i].then(callbacks_acc[i][0], callbacks_acc[i][1]);
			}
			return promises;
		};
	
	}
	
	/* harmony default export */ exports["a"] = BatchLayer;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ = __webpack_require__(0);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer__ = __webpack_require__(3);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__HookLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__ = __webpack_require__(4);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RpcClient__ = __webpack_require__(6);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RequestLayer__ = __webpack_require__(5);
	
	/* harmony export */ __webpack_require__.d(exports, "CreateBrowserRpcClient", function() { return CreateBrowserRpcClient; });
	/* harmony export */ __webpack_require__.d(exports, "CreateNodeRpcClient", function() { return CreateNodeRpcClient; });/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	
	
	
	function CreateNodeRpcClient(url, options){
		var httpOpt = options && options.http || {};
		var httpLayer = new __WEBPACK_IMPORTED_MODULE_6__RequestLayer__["a" /* default */](url, httpOpt.pre_request, httpOpt.post_request);
		var jsonLayer = new __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a" /* default */](httpLayer);
		var protocolLayer = new __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__["a" /* default */](jsonLayer);
		var lo = options && options.log || {};
		var logLayer = new __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a" /* default */](protocolLayer, lo.request, lo.response, lo.error);
		return new __WEBPACK_IMPORTED_MODULE_5__RpcClient__["a" /* default */](logLayer);
	}
	
	function CreateBrowserRpcClient(url, options){
		var httpOpt = options && options.http || {};
		var httpLayer = new __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__["a" /* default */](url, httpOpt.pre_request, httpOpt.post_request);
		var jsonLayer = new __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a" /* default */](httpLayer);
		var protocolLayer = new __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__["a" /* default */](jsonLayer);
		var lo = options && options.log || {};
		var logLayer = new __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a" /* default */](protocolLayer, lo.request, lo.response, lo.error);
		return new __WEBPACK_IMPORTED_MODULE_5__RpcClient__["a" /* default */](logLayer);
	}
	
	
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__AjaxLayer__, "a")) __webpack_require__.d(exports, "AjaxLayer", function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_1__LogLayer__, "a")) __webpack_require__.d(exports, "LogLayer", function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_3__HookLayer__, "a")) __webpack_require__.d(exports, "HookLayer", function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__, "a")) __webpack_require__.d(exports, "ProtocolLayer", function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_5__RpcClient__, "a")) __webpack_require__.d(exports, "RpcClient", function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_6__RequestLayer__, "a")) __webpack_require__.d(exports, "RequestLayer", function() { return __WEBPACK_IMPORTED_MODULE_6__RequestLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_2__JsonLayer__, "a")) __webpack_require__.d(exports, "JsonLayer", function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a"]; });
	


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=rpc_client.js.map