/* author: Ponomarev Denis <ponomarev@gmail.com> */

import AjaxLayer from "./AjaxLayer";
import LogLayer from "./LogLayer";
import JsonLayer from "./JsonLayer";
import ProtocolLayer from "./ProtocolLayer";
import RpcClient from "./RpcClient";

function CreateBrowserRpcClient(url, options){
	var httpOpt = options && options.http || {};
	var httpLayer = new AjaxLayer(url, httpOpt.pre_request, httpOpt.post_request);
	var jsonLayer = new JsonLayer(httpLayer);
	var protocolLayer = new ProtocolLayer(jsonLayer);
	var lo = options && options.log || {};
	var logLayer = new LogLayer(protocolLayer, lo.request, lo.response, lo.error);
	return new RpcClient(logLayer);
}

export default CreateBrowserRpcClient;
