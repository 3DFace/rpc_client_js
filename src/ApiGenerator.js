/* author: Ponomarev Denis <ponomarev@gmail.com> */

import CreateNodeRpcClient from './CreateNodeRpcClient';

/**
 * @constructor
 */
function ApiGenerator(url, request_fn){

	var log = console.log.bind(console);
	var call = CreateNodeRpcClient(url, request_fn, {log: {error: log}}).call;

	this.generate = function(rootClassName, rootContainer){
		return loadContainer(rootContainer || null).then(function(tree){
			var rootClass = generateContainerClass(rootClassName, tree, "", rootContainer || null);
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

export default ApiGenerator;
