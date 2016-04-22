(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("rpc_client", [], factory);
	else if(typeof exports === 'object')
		exports["rpc_client"] = factory();
	else
		root["rpc_client"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].e;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			e: {},
/******/ 			i: moduleId,
/******/ 			l: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.e, module, module.e, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.e;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
								message: e.name + ": " + e.message + "\n" + json_response
							});
						}
						resolve(response);
					}, reject);
				}catch(e){
					reject({
						name: "JsonLayerError",
						message: e.name + ": " + e.message
					});
				}
			});
		}
	}
	
	/* harmony default export */ exports["a"] = JsonLayer;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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
	
	/* harmony default export */ exports["a"] = LogLayer;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	function extractResult(response){
		if(typeof response !== "object"){
			throw {name: "RpcProtocolError", message: "Bad response format: object expected, got " + (typeof response)};
		}
		if(response["status"] === undefined){
			throw {name: "RpcProtocolError", message: "no status"};
		}
		if(response["result"] === undefined){
			throw {name: "RpcProtocolError", message: "no result"};
		}
		if(!response["status"]){
			throw {name: response["result"]["type"] || "UnknownError", message: response["result"]["message"] || ""};
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

	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BatchLayer__ = __webpack_require__(6);
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
			var batchLayer = new /* harmony import */__WEBPACK_IMPORTED_MODULE_0__BatchLayer__["a"]();
			var batchClient = new RpcClient(batchLayer);
			callback(batchClient);
			return batchLayer.flush(protocol_layer);
		};
	
	}
	
	/* harmony default export */ exports["a"] = RpcClient;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

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
			var new_promises = new Array(promises.length);
			for(var i = 0; i < callbacks_acc.length; i++){
				new_promises[i] = promises[i].then(callbacks_acc[i][0], callbacks_acc[1]);
			}
			return new_promises;
		};
	
	}
	
	/* harmony default export */ exports["a"] = BatchLayer;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ = __webpack_require__(0);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer__ = __webpack_require__(3);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__HookLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__ = __webpack_require__(4);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RpcClient__ = __webpack_require__(5);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	
	
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_5__RpcClient__, "a")) Object.defineProperty(exports, "RpcClient", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient__["a"]; }});
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_0__AjaxLayer__, "a")) Object.defineProperty(exports, "AjaxLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__["a"]; }});
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_1__LogLayer__, "a")) Object.defineProperty(exports, "LogLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a"]; }});
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_2__JsonLayer__, "a")) Object.defineProperty(exports, "JsonLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a"]; }});
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_3__HookLayer__, "a")) Object.defineProperty(exports, "HookLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer__["a"]; }});
	/* harmony reexport */ if(Object.prototype.hasOwnProperty.call(__WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__, "a")) Object.defineProperty(exports, "ProtocolLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__["a"]; }});
	


/***/ }
/******/ ])
});
;
//# sourceMappingURL=rpc_client.js.map