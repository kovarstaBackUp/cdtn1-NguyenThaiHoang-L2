<script lang="ts">
    import "#lib/app.css";
    import type { PageProps } from "./$types";

    import {
        calculateDueDate,
        isPriority,
        toVietnamDdMmYy,
        toVietnamIso,
    } from "#lib/due-date";
    import type { TicketCreated } from "#lib/types/ticket";

    let { data }: PageProps = $props();

    let selectedDeviceId = $state<number | null>(null);

    const devices = $derived(data.customer?.devices ?? []);
    const selectedDevice = $derived(
        devices.find((device) => device.device_id === selectedDeviceId) ?? null,
    );

    const serialNo = $derived(selectedDevice?.serial_no ?? "");
    const originNote = $derived(selectedDevice?.origin_note ?? "");
    const purchaseDate = $derived(selectedDevice?.purchase_date ?? "");

    let issueCategoryId = $state<number | null>(null);
    let issueDesc = $state("");

    // BR-21 / AC5.1: picking a category pre-fills priority from its
    // default_priority. The employee can still override it; the override
    // holds until the category changes.
    const selectedCategory = $derived(
        data.categories.find(
            (category) => category.category_id === issueCategoryId,
        ) ?? null,
    );
    let priority = $derived(
        selectedCategory && isPriority(selectedCategory.default_priority)
            ? selectedCategory.default_priority
            : null,
    );

    let submitting = $state(false);
    let errorMessage = $state<string | null>(null);
    let createdTicket = $state<TicketCreated | null>(null);

    const dueDateIso = $derived(
        priority && isPriority(priority)
            ? toVietnamIso(calculateDueDate(new Date(), priority))
            : null,
    );

    const dueDateLabel = $derived(
        createdTicket
            ? toVietnamDdMmYy(createdTicket.due_date)
            : dueDateIso
              ? toVietnamDdMmYy(dueDateIso)
              : "dd/mm/yy",
    );

    async function submitTicket() {
        if (!data.customer) return;

        submitting = true;
        errorMessage = null;

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    customer_id: data.customer.customer_id,
                    device_id: selectedDeviceId,
                    issue_desc: issueDesc,
                    category_id: issueCategoryId,
                    priority,
                }),
            });

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                errorMessage = payload?.error?.message ?? "Khong tao duoc phieu";
                return;
            }

            createdTicket = payload as TicketCreated;
        } catch {
            errorMessage = "Khong ket noi duoc toi may chu";
        } finally {
            submitting = false;
        }
    }
</script>

<div class="title">Tao Phieu Bao Hanh</div>
<!-- Khach Hang -->
<div class="thongTinKhachHang flex gap-1">
    <p>Ten: {data.customer?.full_name ?? "-"}</p>
    <p>SDT: {data.customer?.phone_masked ?? "-"}</p>
</div>

<!-- Thiet Bi -->
<div class="phone flex flex-col gap-1">
    <div class="deviceListDisplay">
        {#if devices.length === 0}
            <p>Chua co thiet bi</p>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Serial</th>
                        <th>Mua Ngoai</th>
                        <th>Ngay Mua</th>
                        <th>Bao Hanh</th>
                    </tr>
                </thead>
                <tbody>
                    {#each devices as device (device.device_id)}
                        <tr>
                            <td>
                                <input
                                    type="radio"
                                    name="device"
                                    value={device.device_id}
                                    bind:group={selectedDeviceId}
                                />
                            </td>
                            <td>{device.serial_no}</td>
                            <td>{device.is_external ? "Co" : "Khong"}</td>
                            <td>{device.purchase_date ?? "-"}</td>
                            <td>{device.warranty_months} thang</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
    <div class="flex gap-1">
        <p>IMEI / Serial</p>
        <input
            class="border border-b-black"
            type="text"
            value={serialNo}
            readonly
        />
    </div>

    <div class="flex gap-1">
        <p>Ghi Chu Nguon Goc</p>
        <input
            class="border border-b-black"
            type="text"
            value={originNote}
            readonly
        />
    </div>
    <div class="flex gap-1">
        <p>Ngay Mua</p>
        <input
            class="border border-b-black"
            type="date"
            value={purchaseDate}
            readonly
        />
    </div>
</div>

<!-- Noi Dung Tiep Nhan  -->
<div class="phone flex flex-col gap-1">
    <p>Mo ta loi do khach ke</p>
    <textarea
        class="border border-b-black"
        rows="3"
        cols="1"
        bind:value={issueDesc}
    ></textarea>

    <p>Nhom su co</p>

    <div>
        {#each data.categories as category (category.category_id)}
            <label>
                <input
                    type="radio"
                    name="issueCategory"
                    value={category.category_id}
                    bind:group={issueCategoryId}
                />
                {category.category_name}
            </label>
        {/each}
    </div>

    <p>Muc uu tien</p>
    <div>
        <label>
            <input
                type="radio"
                name="priority"
                value="CAO"
                bind:group={priority}
            />
            Cao
        </label>
        <label>
            <input
                type="radio"
                name="priority"
                value="TRUNG_BINH"
                bind:group={priority}
            />
            Trung Binh
        </label>
        <label>
            <input
                type="radio"
                name="priority"
                value="THAP"
                bind:group={priority}
            />
            Thap
        </label>
    </div>
</div>

<!-- Xac Nhan -->
<div>
    <p>Xac Nhan</p>
    {#if createdTicket}
        <p>Da tao phieu {createdTicket.ticket_code}</p>
    {/if}
    <p>Han cam ket: {dueDateLabel}</p>
    <div>
        <button class="cancel" type="button">Huy</button>
        <button
            class="proceed"
            type="button"
            onclick={submitTicket}
            disabled={submitting || !data.customer}
        >
            {submitting ? "Dang tao..." : "Tao Phieu"}
        </button>
    </div>
</div>

<!-- Loi -->
<div class="error">{errorMessage ?? ""}</div>
