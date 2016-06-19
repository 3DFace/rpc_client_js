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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
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
/* 2 */
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BatchLayer__ = __webpack_require__(10);
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
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__LogLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__JsonLayer__ = __webpack_require__(0);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ProtocolLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__RpcClient__ = __webpack_require__(3);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RequestLayer__ = __webpack_require__(6);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	
	function CreateNodeRpcClient(url, request_fn, options){
		var httpLayer = new __WEBPACK_IMPORTED_MODULE_4__RequestLayer__["a" /* default */](url, request_fn);
		var jsonLayer = new __WEBPACK_IMPORTED_MODULE_1__JsonLayer__["a" /* default */](httpLayer);
		var protocolLayer = new __WEBPACK_IMPORTED_MODULE_2__ProtocolLayer__["a" /* default */](jsonLayer);
		var lo = options && options.log || {};
		var logLayer = new __WEBPACK_IMPORTED_MODULE_0__LogLayer__["a" /* default */](protocolLayer, lo.request, lo.response, lo.error);
		return new __WEBPACK_IMPORTED_MODULE_3__RpcClient__["a" /* default */](logLayer);
	}
	
	/* harmony default export */ exports["a"] = CreateNodeRpcClient;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	
	/* harmony default export */ exports["a"] = RequestLayer;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__CreateNodeRpcClient__ = __webpack_require__(5);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	/**
	 * @constructor
	 */
	function ApiGenerator(url, request_fn){
	
		var log = console.log.bind(console);
		var call = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__CreateNodeRpcClient__["a" /* default */])(url, request_fn, {log: {error: log}}).call;
	
		this.generate = function(rootClassName, rootContainer){
			return loadContainer(rootContainer || null).then(function(tree){
				var rootClass = generateContainerClass(rootClassName, tree, "");
				return "// GENERATED CODE\n\n" + rootClass + "\nexport default "  + rootClassName + ";\n";
			}, log);
		};
	
		function loadContainer(pathName){
	
			return new Promise(function(resolve, reject){
				call("explorer", "getServicesInfo", [pathName]).then(function(items){
					var subPromises = [];
					items.forEach(function(i){
						if(i.container){
							var iName = pathName ? pathName + '/' + e.name : i.name;
							subPromises.push(loadContainer(iName));
						}else{
							subPromises.push(i);
						}
					});
					Promise.all(subPromises).then(function(items){
						resolve({
							name: pathName,
							container: true,
							items: items
						});
					}, reject);
				});
			})
		}
	
		function generateServiceClass(className, serviceDef, indent){
			var result = "";
			result += indent + "/**\n";
			result += indent + " * @constructor\n";
			result += indent + " */\n";
			result += indent + "function " + className + "(call, servicePath){\n";
			serviceDef.methods.forEach(function(m){
				result += "\n";
				var params = m.params.join(", ");
				result += indent + "\t/**\n";
				result += indent + "\t * @return {Promise}\n";
				result += indent + "\t */\n";
				result += indent + "\tthis." + m.name + " = " + "function(" + params + "){\n";
				result += indent + "\t\treturn call(servicePath, '" + m.name + "', [" + params +"]);\n";
				result += indent + "\t};\n";
			});
			result += indent + "}\n";
			return result;
		}
	
		function generateContainerClass(className, tree, indent, path){
			var result = "";
			var services = [];
			result += indent + "/**\n";
			result += indent + " * @constructor\n";
			result += indent + " */\n";
			result += indent + "function " + className + "(call){\n";
			tree.items.forEach(function(i){
				var iClass = i.name[0].toUpperCase() + i.name.substr(1);
				var iVar = i.name;
				var iPath = path ? path + '/' + i.name : i.name;
				var service;
				if(i.container){
					result += "\n" + generateContainerClass(iClass, i, indent + "\t", iPath);
					service = indent + "\tthis." + iVar + " = new " + iClass + "(call);\n";
				}else{
					result += "\n" + generateServiceClass(iClass, i, indent + "\t");
					service = indent + "\tthis." + iVar + " = new " + iClass + "(call, '" + iPath + "');\n";
				}
				services.push(service);
			});
			result += "\n" + services.join("") + "\n";
			result += indent + "}\n";
			return result;
		}
	
	}
	
	/* harmony default export */ exports["a"] = ApiGenerator;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ = __webpack_require__(4);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ = __webpack_require__(0);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ProtocolLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RpcClient__ = __webpack_require__(3);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	
	function CreateBrowserRpcClient(url, options){
		var httpOpt = options && options.http || {};
		var httpLayer = new __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__["a" /* default */](url, httpOpt.pre_request, httpOpt.post_request);
		var jsonLayer = new __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a" /* default */](httpLayer);
		var protocolLayer = new __WEBPACK_IMPORTED_MODULE_3__ProtocolLayer__["a" /* default */](jsonLayer);
		var lo = options && options.log || {};
		var logLayer = new __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a" /* default */](protocolLayer, lo.request, lo.response, lo.error);
		return new __WEBPACK_IMPORTED_MODULE_4__RpcClient__["a" /* default */](logLayer);
	}
	
	/* harmony default export */ exports["a"] = CreateBrowserRpcClient;


/***/ },
/* 9 */
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
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__ = __webpack_require__(4);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__LogLayer__ = __webpack_require__(1);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__JsonLayer__ = __webpack_require__(0);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__HookLayer__ = __webpack_require__(9);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__ = __webpack_require__(2);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RpcClient__ = __webpack_require__(3);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RequestLayer__ = __webpack_require__(6);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__CreateNodeRpcClient__ = __webpack_require__(5);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__CreateBrowserRpcClient__ = __webpack_require__(8);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ApiGenerator__ = __webpack_require__(7);
	/* author: Ponomarev Denis <ponomarev@gmail.com> */
	
	
	
	
	
	
	
	
	
	
	
	
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_9__ApiGenerator__, "a")) __webpack_require__.d(exports, "ApiGenerator", function() { return __WEBPACK_IMPORTED_MODULE_9__ApiGenerator__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__AjaxLayer__, "a")) __webpack_require__.d(exports, "AjaxLayer", function() { return __WEBPACK_IMPORTED_MODULE_0__AjaxLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_1__LogLayer__, "a")) __webpack_require__.d(exports, "LogLayer", function() { return __WEBPACK_IMPORTED_MODULE_1__LogLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_2__JsonLayer__, "a")) __webpack_require__.d(exports, "JsonLayer", function() { return __WEBPACK_IMPORTED_MODULE_2__JsonLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_3__HookLayer__, "a")) __webpack_require__.d(exports, "HookLayer", function() { return __WEBPACK_IMPORTED_MODULE_3__HookLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__, "a")) __webpack_require__.d(exports, "ProtocolLayer", function() { return __WEBPACK_IMPORTED_MODULE_4__ProtocolLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_5__RpcClient__, "a")) __webpack_require__.d(exports, "RpcClient", function() { return __WEBPACK_IMPORTED_MODULE_5__RpcClient__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_6__RequestLayer__, "a")) __webpack_require__.d(exports, "RequestLayer", function() { return __WEBPACK_IMPORTED_MODULE_6__RequestLayer__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_7__CreateNodeRpcClient__, "a")) __webpack_require__.d(exports, "CreateNodeRpcClient", function() { return __WEBPACK_IMPORTED_MODULE_7__CreateNodeRpcClient__["a"]; });
	/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_8__CreateBrowserRpcClient__, "a")) __webpack_require__.d(exports, "CreateBrowserRpcClient", function() { return __WEBPACK_IMPORTED_MODULE_8__CreateBrowserRpcClient__["a"]; });
	


/***/ }
/******/ ])
});
;
//# sourceMappingURL=rpc_client.js.map