export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	app_dir: "_app",
	app_path: "_app",
	assets: new Set(["robots.txt"]),
	mime_types: {".txt":"text/plain"},
	client: {start:"_app/immutable/entry/start.CHdg66Bc.js",app:"_app/immutable/entry/app.-KB9hQV7.js",imports:["_app/immutable/entry/start.CHdg66Bc.js","_app/immutable/entry/payload.DSmR2FwN.js","_app/immutable/chunks/CRzLMJPS.js","_app/immutable/chunks/CTWKXuiq.js","_app/immutable/chunks/BEWIQj-H.js","_app/immutable/chunks/NDGgBF2a.js","_app/immutable/entry/app.-KB9hQV7.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
	
	nodes: [
		__memo(() => import('./nodes/0.js')),
		__memo(() => import('./nodes/1.js')),
		__memo(() => import('./nodes/2.js')),
		__memo(() => import('./nodes/3.js')),
		__memo(() => import('./nodes/4.js'))
	],
	remotes: {
		
	},
	routes: [
		{
			id: "/api/customers",
			pattern: /^\/api\/customers\/?$/,
			params: [],
			page: null,
			endpoint: __memo(() => import('./entries/endpoints/api/customers/_server.ts.js'))
		},
		{
			id: "/api/devices",
			pattern: /^\/api\/devices\/?$/,
			params: [],
			page: null,
			endpoint: __memo(() => import('./entries/endpoints/api/devices/_server.ts.js'))
		},
		{
			id: "/api/issue-categories",
			pattern: /^\/api\/issue-categories\/?$/,
			params: [],
			page: null,
			endpoint: __memo(() => import('./entries/endpoints/api/issue-categories/_server.ts.js'))
		},
		{
			id: "/(app)/duyetPhieuBaoHanh",
			pattern: /^\/duyetPhieuBaoHanh\/?$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 2 },
			endpoint: null
		},
		{
			id: "/(app)/taoPhieuBaoHanh",
			pattern: /^\/taoPhieuBaoHanh\/?$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 3 },
			endpoint: null
		},
		{
			id: "/(app)/traCuuKhachHang",
			pattern: /^\/traCuuKhachHang\/?$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 4 },
			endpoint: null
		}
	],
	prerendered_routes: new Set([]),
	matchers: async () => {
		return {};
	},
	server_assets: {}
}
})();
