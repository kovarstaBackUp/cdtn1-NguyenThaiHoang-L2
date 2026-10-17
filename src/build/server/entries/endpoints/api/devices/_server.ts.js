import { t as errorResponse } from "../../../../chunks/api.js";
import { i as unauthenticated, r as forbiddenRole, t as db } from "../../../../chunks/db.js";
//#region src/routes/api/devices/+server.ts
var POST = async ({ request, locals }) => {
	const employee = locals.employee;
	if (!employee) return unauthenticated();
	if (employee.role === "QUAN_LY") return forbiddenRole();
	const body = await request.json().catch(() => null);
	const customerId = body?.customer_id;
	if (typeof customerId !== "number" || !Number.isInteger(customerId) || customerId <= 0) return errorResponse(400, "VALIDATION_FAILED", "Khách hàng là trường bắt buộc", { customer_id: "Trường bắt buộc" });
	const serialNo = (body?.serial_no ?? "").trim();
	if (!serialNo) return errorResponse(400, "VALIDATION_FAILED", "Số serial/IMEI là trường bắt buộc", { serial_no: "Trường bắt buộc" });
	const isExternal = body?.is_external === true;
	const originNote = (body?.origin_note ?? "").trim();
	if (isExternal && !originNote) return errorResponse(400, "VALIDATION_FAILED", "Thiết bị mua ngoài phải có ghi chú nguồn gốc", { origin_note: "Trường bắt buộc" });
	const purchaseDate = body?.purchase_date ?? null;
	if (purchaseDate !== null && purchaseDate > (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) return errorResponse(400, "VALIDATION_FAILED", "Ngày mua không hợp lệ", { purchase_date: "Không được sau ngày hiện tại" });
	const warrantyMonths = body?.warranty_months ?? 12;
	if (!Number.isInteger(warrantyMonths) || warrantyMonths < 1 || warrantyMonths > 120) return errorResponse(400, "VALIDATION_FAILED", "Số tháng bảo hành không hợp lệ", { warranty_months: "Từ 1 đến 120" });
	const customer = await db.orm.public.Customer.where({ customerId: BigInt(customerId) }).select("customerId").first();
	if (!customer) return errorResponse(404, "CUSTOMER_NOT_FOUND", "Không tìm thấy khách hàng");
	const serialValue = serialNo;
	const existing = await db.orm.public.Device.where({ serialNo: serialValue }).select("deviceId", "customerId").first();
	if (existing && existing.customerId !== customer.customerId) return errorResponse(409, "SERIAL_OWNED_BY_OTHER", "Serial/IMEI này đang thuộc một khách hàng khác. Vui lòng chuyển Quản lý trung tâm xử lý");
	const device = existing ? existing.deviceId : (await db.orm.public.Device.create({
		customerId: customer.customerId,
		serialNo: serialValue,
		isExternal,
		originNote: originNote ? originNote : null,
		purchaseDate,
		warrantyMonths,
		isActive: true
	})).deviceId;
	const saved = await db.orm.public.Device.where({ deviceId: device }).select("deviceId", "serialNo", "isExternal", "purchaseDate", "warrantyMonths").first();
	if (!saved) return errorResponse(404, "DEVICE_NOT_FOUND", "Không tìm thấy thiết bị");
	return Response.json({
		device_id: Number(saved.deviceId),
		serial_no: saved.serialNo,
		is_external: saved.isExternal,
		purchase_date: saved.purchaseDate,
		warranty_months: saved.warrantyMonths
	}, { status: 201 });
};
//#endregion
export { POST };

//# sourceMappingURL=_server.ts.js.map