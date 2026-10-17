import { G as server_api_unavailable } from "./server-errors.js";
//#region node_modules/.pnpm/@sveltejs+kit@3.0.1_@svelte_edf5a04311f7e6627894a7e0c6d5ad75/node_modules/@sveltejs/kit/src/utils/functions.js
function noop() {}
/**
* @template T
* @param {() => T} fn
*/
function once(fn) {
	let done = false;
	/** @type T */
	let result;
	return () => {
		if (done) return result;
		done = true;
		return result = fn();
	};
}
/**
* @param {string} name
* @param {string} [parens]
*/
function disallow_on_server(name, parens = "(...)") {
	return () => {
		server_api_unavailable({ name: `${name}${parens}` });
	};
}
//#endregion
export { noop as n, once as r, disallow_on_server as t };

//# sourceMappingURL=functions.js.map