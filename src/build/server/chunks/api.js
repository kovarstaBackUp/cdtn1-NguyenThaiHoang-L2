import "./exports.js";
//#region src/lib/server/api.ts
function errorResponse(status, code, message, fields) {
	const error = {
		code,
		message,
		fields
	};
	return Response.json({ error }, { status });
}
//#endregion
export { errorResponse as t };

//# sourceMappingURL=api.js.map