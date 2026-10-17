import { t as errorResponse } from "../../../../chunks/api.js";
import { i as unauthenticated, r as forbiddenRole, t as db } from "../../../../chunks/db.js";
//#region src/lib/phone.ts
function maskPhone(phone) {
	if (phone.length <= 6) return phone;
	return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}
function normalizePhone(input) {
	const digits = input.replace(/[^0-9]/g, "").replace(/^84/, "0");
	if (!/^0\d{9}$/.test(digits)) return null;
	return digits;
}
//#endregion
//#region src/routes/api/customers/+server.ts
var GET = async ({ url, locals }) => {
	const employee = locals.employee;
	if (!employee) return unauthenticated();
	const raw = url.searchParams.get("phone") ?? "";
	const phone = normalizePhone(raw);
	if (!phone) return errorResponse(400, "INVALID_PHONE", "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)", { phone: raw });
	const customer = await db.orm.public.Customer.where({ phone }).select("customerId", "phone", "fullName", "address").first();
	if (!customer) return errorResponse(404, "CUSTOMER_NOT_FOUND", "Không tìm thấy thông tin khách hàng");
	const devices = await db.orm.public.Device.where({ customerId: customer.customerId }).select("deviceId", "serialNo", "isExternal", "purchaseDate", "warrantyMonths").all();
	const body = {
		customer_id: Number(customer.customerId),
		full_name: customer.fullName,
		phone_masked: maskPhone(customer.phone),
		address: customer.address,
		devices: devices.map((device) => ({
			device_id: Number(device.deviceId),
			serial_no: device.serialNo,
			is_external: device.isExternal,
			purchase_date: device.purchaseDate,
			warranty_months: device.warrantyMonths
		}))
	};
	if (employee.role === "QUAN_LY") body.phone = customer.phone;
	return Response.json(body);
};
var POST = async ({ request, locals }) => {
	const employee = locals.employee;
	if (!employee) return unauthenticated();
	if (employee.role === "QUAN_LY") return forbiddenRole();
	const body = await request.json().catch(() => null);
	const fullName = (body?.full_name ?? "").trim();
	if (!fullName) return errorResponse(400, "VALIDATION_FAILED", "Vui lòng nhập Họ tên khách hàng", { full_name: "Trường bắt buộc" });
	const raw = (body?.phone ?? "").trim();
	const phone = normalizePhone(raw);
	if (!phone) return errorResponse(400, "INVALID_PHONE", "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)", { phone: raw });
	const existing = await db.orm.public.Customer.where({ phone }).select("customerId").first();
	if (existing) return errorResponse(409, "CUSTOMER_EXISTS", "Số điện thoại đã tồn tại trên hệ thống", { existing_customer_id: Number(existing.customerId) });
	const address = (body?.address ?? "").trim();
	const created = await db.orm.public.Customer.create({
		phone,
		fullName,
		address: address ? address : null,
		isActive: true
	});
	return Response.json({
		customer_id: Number(created.customerId),
		full_name: created.fullName,
		phone_masked: maskPhone(created.phone)
	}, { status: 201 });
};
//#endregion
export { GET, POST };

//# sourceMappingURL=_server.ts.js.map