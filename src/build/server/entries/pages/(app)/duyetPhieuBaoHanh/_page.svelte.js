import "../../../../chunks/server2.js";
/* empty css                     */
//#region src/routes/(app)/duyetPhieuBaoHanh/+page.svelte
function _page($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="title">Duyet Phieu Bao Hanh</div> <div class="topBar flex gap-1"><p>Bo Loc</p> <button class="filterAll">Tat ca</button> <button class="notApproved">Chua Duyet</button></div> <div class="table flex flex-col gap-1"><div class="deviceListDisplay"><p>Da Qua Han</p> <table><thead><tr><th>Ma Phieu</th><th>Khach Hang</th><th>Thiet Bi</th><th>Han Cam Ket</th></tr></thead><tbody><tr></tr></tbody></table> <p>Chua Qua Han</p> <table><thead><tr><th>Ma Phieu</th><th>Khach Hang</th><th>Thiet Bi</th><th>Han Cam Ket</th></tr></thead><tbody><tr></tr></tbody></table></div></div> <div class="details flex flex-col gap-1"><p>Chi Tiet Phieu</p> <p>Ma Phieu</p> <p>Khach Hang</p> <p>Thiet Bi</p> <p>Ngay mua</p> <p>So thang bao hanh</p> <p>Ghi Chu Nguon Goc</p> <p>Mo ta loi do khach ke</p></div> <div><p>Xac Nhan</p> <div><button class="accept">Duyet Bao Hanh Mien Phi</button> <button class="decline">Tu Choi Bao Hanh Mien Phi</button></div> <div><p>Ly Do Tu Choi</p> <textarea class="border border-b-black" rows="3" cols="3"></textarea></div></div> <div class="error"></div>`);
}
//#endregion
export { _page as default };

//# sourceMappingURL=_page.svelte.js.map