/* author: Ponomarev Denis <ponomarev@gmail.com> */

import CreateNodeRpcClient from './CreateNodeRpcClient';

/**
 * @constructor
 */
function ApiGenerator(url, request_fn){

	var log = console.log.bind(console);
	var call = CreateNodeRpcClient(url, request_fn, {log: {request: log, error: log}}).call;

	this.generate = function(className, path){
		var rootContainer, serviceName;
		if(path){
			var pathArr = path.split("/");
			serviceName = pathArr.pop();
			rootContainer = pathArr.join("/");
		}else{
			rootContainer = null;
			serviceName = null;
		}
		return loadContainer(rootContainer).then(function(tree){
			var service;
			if(serviceName){
				service = tree.items.find(function(i){
					return i.name == serviceName;
				});
			}else{
				service = tree;
			}
			var classDef = generateSomething(className, service, "", path);
			return "// GENERATED CODE\n\n" + classDef + "\nexport default "  + className + ";\n";
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

	function generateServiceClass(className, serviceDef, indent, iPath){
		var result = "";
		result += indent + "/**\n";
		result += indent + " * @constructor\n";
		result += indent + " */\n";
		result += indent + "function " + className + "(call){\n\n";
		result += indent + "\tvar servicePath = '" + iPath + "';\n";
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
		result += indent + "/**\n";
		result += indent + " * @constructor\n";
		result += indent + " */\n";
		result += indent + "function " + className + "(call){\n";
		tree.items.forEach(function(i){
			var iClass = i.name[0].toUpperCase() + i.name.substr(1);
			var iVar = i.name;
			var iPath = path ? path + '/' + i.name : i.name;
			result += "\n" + generateSomething(iClass, i, indent + "\t", iPath);
			result += "\n" + indent + "\tthis." + iVar + " = new " + iClass + "(call);\n";
		});
		result += indent + "}\n";
		return result;
	}

	function generateSomething(className, definition, indent, iPath){
		if(definition.container){
			return generateContainerClass(className, definition, indent, iPath);
		}else{
			return generateServiceClass(className, definition, indent, iPath);
		}
	}
	
}

export default ApiGenerator;
