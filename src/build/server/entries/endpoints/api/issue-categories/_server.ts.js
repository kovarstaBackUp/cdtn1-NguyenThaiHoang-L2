import { i as unauthenticated, t as db } from "../../../../chunks/db.js";
//#region src/routes/api/issue-categories/+server.ts
var GET = async ({ locals }) => {
	if (!locals.employee) return unauthenticated();
	const items = (await db.orm.public.IssueCategory.select("categoryId", "categoryName", "defaultPriority").all()).map((row) => ({
		category_id: Number(row.categoryId),
		category_name: row.categoryName,
		default_priority: row.defaultPriority
	})).sort((a, b) => a.category_id - b.category_id);
	return Response.json({
		total: items.length,
		items
	});
};
//#endregion
export { GET };

//# sourceMappingURL=_server.ts.js.map