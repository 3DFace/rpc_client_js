(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("promise"));
	else if(typeof define === 'function' && define.amd)
		define("rpc_client", ["promise"], factory);
	else if(typeof exports === 'object')
		exports["rpc_client"] = factory(require("promise"));
	else
		root["rpc_client"] = factory(root["promise"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.e = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var Promise = __webpack_require__(0);
	
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
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){
	
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
		return HookLayer;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var Promise = __webpack_require__(0);
	
		/**
		 *
		 * @param {object} under_layer
		 * @constructor
		 */
		function JsonLayer(under_layer){
	
			this.send = function(request){
	
				return new Promise(function(resolve, reject){
					try{
						var json = JSON.stringify(request);
	
						under_layer.send(json).then(function(json_response){
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
	
		return JsonLayer;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var Promise = __webpack_require__(0);
	
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
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var Promise = __webpack_require__(0);
	
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
		 * @param {object} under_layer
		 * @constructor
		 */
		function ProtocolLayer(under_layer){
	
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
	
					under_layer.send(request).then(function(response){
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
	
		return ProtocolLayer;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var BatchLayer = __webpack_require__(7);
	
		/**
		 * @param protocol_layer
		 * @constructor
		 */
		function RpcClient(protocol_layer){
	
			var client = this;
	
			client.call = function(service, method, params){
				return protocol_layer.send([[service, method, params]])[0];
			};
	
			client.batch = function(callback){
				var batchLayer = new BatchLayer();
				var batchClient = new RpcClient(batchLayer);
				callback(batchClient);
				return batchLayer.flush(protocol_layer);
			};
	
		}
	
		return RpcClient;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require){
	
		var Promise = __webpack_require__(0);
	
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
	
		return BatchLayer;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.e = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer___default = __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ && __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_0__AjaxLayer___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_0__AjaxLayer___default });
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer__ = __webpack_require__(4);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer___default = __WEBPACK_IMPORTED_MODULE_1__LogLayer__ && __WEBPACK_IMPORTED_MODULE_1__LogLayer__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_1__LogLayer___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_1__LogLayer___default });
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ = __webpack_require__(3);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer___default = __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ && __WEBPACK_IMPORTED_MODULE_2__JsonLayer__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_2__JsonLayer___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_2__JsonLayer___default });
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__HookLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__HookLayer___default = __WEBPACK_IMPORTED_MODULE_3__HookLayer__ && __WEBPACK_IMPORTED_MODULE_3__HookLayer__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_3__HookLayer___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_3__HookLayer___default });
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__ = __webpack_require__(5);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer___default = __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__ && __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_4__ProtocolLayer___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer___default });
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RpcClient__ = __webpack_require__(6);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RpcClient___default = __WEBPACK_IMPORTED_MODULE_5__RpcClient__ && __WEBPACK_IMPORTED_MODULE_5__RpcClient__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient__; }
	/* harmony import */ Object.defineProperty(__WEBPACK_IMPORTED_MODULE_5__RpcClient___default, 'a', { get: __WEBPACK_IMPORTED_MODULE_5__RpcClient___default });
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	/* harmony reexport */ Object.defineProperty(exports, "RpcClient", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient___default.a; }});
	/* harmony reexport */ Object.defineProperty(exports, "AjaxLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer___default.a; }});
	/* harmony reexport */ Object.defineProperty(exports, "LogLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer___default.a; }});
	/* harmony reexport */ Object.defineProperty(exports, "JsonLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer___default.a; }});
	/* harmony reexport */ Object.defineProperty(exports, "HookLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer___default.a; }});
	/* harmony reexport */ Object.defineProperty(exports, "ProtocolLayer", {configurable: false, enumerable: true, get: function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer___default.a; }});
	


/***/ }
/******/ ])
});
;
//# sourceMappingURL=rpc_client.js.map