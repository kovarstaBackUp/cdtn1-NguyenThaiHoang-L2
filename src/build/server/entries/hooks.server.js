import { t as errorResponse } from "../chunks/api.js";
//#region src/hooks.server.ts
var handle = async ({ event, resolve }) => {
	event.locals.employee = null;
	const header = event.request.headers.get("authorization");
	const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
	if (token) try {
		const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
		event.locals.employee = {
			employeeId: BigInt(payload.employee_id),
			role: String(payload.role),
			centerCode: String(payload.center_code)
		};
	} catch {
		event.locals.employee = null;
	}
	if (event.url.pathname.startsWith("/api/") && !event.locals.employee) return errorResponse(401, "UNAUTHENTICATED", "Vui lòng đăng nhập");
	return resolve(event);
};
//#endregion
export { handle };

//# sourceMappingURL=hooks.server.js.map