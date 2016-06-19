/* author: Ponomarev Denis <ponomarev@gmail.com> */

import AjaxLayer from "./AjaxLayer";
import LogLayer from "./LogLayer";
import JsonLayer from "./JsonLayer";
import HookLayer from "./HookLayer";
import ProtocolLayer from "./ProtocolLayer";
import RpcClient from "./RpcClient";
import RequestLayer from "./RequestLayer";

function CreateNodeRpcClient(url, options){
	var httpOpt = options && options.http || {};
	var httpLayer = new RequestLayer(url, httpOpt.pre_request, httpOpt.post_request);
	var jsonLayer = new JsonLayer(httpLayer);
	var protocolLayer = new ProtocolLayer(jsonLayer);
	var lo = options && options.log || {};
	var logLayer = new LogLayer(protocolLayer, lo.request, lo.response, lo.error);
	return new RpcClient(logLayer);
}

function CreateBrowserRpcClient(url, options){
	var httpOpt = options && options.http || {};
	var httpLayer = new AjaxLayer(url, httpOpt.pre_request, httpOpt.post_request);
	var jsonLayer = new JsonLayer(httpLayer);
	var protocolLayer = new ProtocolLayer(jsonLayer);
	var lo = options && options.log || {};
	var logLayer = new LogLayer(protocolLayer, lo.request, lo.response, lo.error);
	return new RpcClient(logLayer);
}


export {AjaxLayer, LogLayer, JsonLayer, HookLayer, ProtocolLayer, RpcClient, RequestLayer,
	CreateNodeRpcClient, CreateBrowserRpcClient};
