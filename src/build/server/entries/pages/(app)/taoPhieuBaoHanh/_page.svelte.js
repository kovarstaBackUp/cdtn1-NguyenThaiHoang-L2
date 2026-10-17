import "../../../../chunks/server2.js";
/* empty css                     */
//#region src/routes/(app)/taoPhieuBaoHanh/+page.svelte
function _page($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="title">Tao Phieu Bao Hanh</div> <div class="thongTinKhachHang flex gap-1"><p>Ten:</p> <p>SDT:</p></div> <div class="phone flex flex-col gap-1"><div class="deviceListDisplay">Ma | Ngay Mua | Thong Tin Bao Hanh
        value | Value | Value</div> <div class="flex gap-1"><p>IMEI / Serial</p> <input class="border border-b-black" type="text"/></div> <div class="flex gap-1"><p>Ghi Chu Nguon Goc</p> <input class="border border-b-black" type="text"/></div> <div class="flex gap-1"><p>Ngay Mua</p> <input class="border border-b-black" type="date"/></div></div> <div class="phone flex flex-col gap-1"><p>Mo ta loi do khach ke</p> <textarea class="border border-b-black" rows="3" cols="1"></textarea> <p>Nhom su co</p> <div><input type="radio" name="" value=""/> <label for=""></label> <input type="radio" name="" value=""/> <label for=""></label> <input type="radio" name="" value=""/> <label for=""></label> <input type="radio" name="" value=""/> <label for=""></label></div> <p>Muc uu tien</p> <div><input type="radio" name="cao" value="cao"/> <label for="cao">Cao</label> <input type="radio" name="trungBinh" value="trungBinh"/> <label for="trungBinh">Trung Binh</label> <input type="radio" name="thap" value="thap"/> <label for="thap">Thap</label></div></div> <div><p>Xac Nhan</p> <p>Han cam ket: dd/mm/yy</p> <div><button class="cancel">Huy</button> <button class="proceed">Tao Phieu</button></div></div> <div class="error"></div>`);
}
//#endregion
export { _page as default };

//# sourceMappingURL=_page.svelte.js.map