/* author: Ponomarev Denis <ponomarev@gmail.com> */

import LogLayer from "./LogLayer";
import JsonLayer from "./JsonLayer";
import ProtocolLayer from "./ProtocolLayer";
import RpcClient from "./RpcClient";
import RequestLayer from "./RequestLayer";

function CreateNodeRpcClient(url, request_fn, options){
	var httpLayer = new RequestLayer(url, request_fn);
	var jsonLayer = new JsonLayer(httpLayer);
	var protocolLayer = new ProtocolLayer(jsonLayer);
	var lo = options && options.log || {};
	var logLayer = new LogLayer(protocolLayer, lo.request, lo.response, lo.error);
	return new RpcClient(logLayer);
}

export default CreateNodeRpcClient;
