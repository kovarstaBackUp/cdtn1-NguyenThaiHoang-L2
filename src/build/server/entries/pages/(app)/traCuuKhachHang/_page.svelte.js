import { i as attr } from "../../../../chunks/server2.js";
/* empty css                     */
//#region src/routes/(app)/traCuuKhachHang/+page.svelte
function _page($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="title">Tra Cuu Khach Hang</div> <div class="searchPhoneNumber flex gap-1"><p>So Dien Thoai</p> <input class="border border-b-black" type="text"/></div> <div class="search flex flex-col gap-1"><div class="flex gap-1"><p>Ho Ten</p> <input${attr("readonly", true, true)} class="border border-b-black" type="text"/></div> <div class="flex gap-1"><p>SDT</p> <input${attr("readonly", true, true)} class="border border-b-black" type="text"/></div> <div class="flex gap-1"><p>Dia Chi</p> <input${attr("readonly", true, true)} class="border border-b-black" type="text"/></div> <div class="deviceListDisplay"></div> <button class="goToTaoPhieuBaoHanh">Tiep Tuc Tao Phieu</button></div> <div class="search flex flex-col gap-1"><div class="flex gap-1"><p>Ho Ten</p> <input${attr("readonly", false, true)} class="border border-b-black" type="text"/></div> <div class="flex gap-1"><p>Dia Chi</p> <input${attr("readonly", false, true)} class="border border-b-black" type="text"/></div> <button class="goToTaoPhieuBaoHanh">Tiep Tuc Tao Phieu</button></div> <div class="error"></div>`);
}
//#endregion
export { _page as default };

//# sourceMappingURL=_page.svelte.js.map