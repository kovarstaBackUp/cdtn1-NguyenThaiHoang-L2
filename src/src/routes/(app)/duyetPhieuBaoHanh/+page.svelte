<script lang="ts">
    import "#lib/app.css";
    import type { PageProps } from "./$types";

    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { toVietnamDdMmYy } from "#lib/due-date";
    import type { TicketListItem } from "#lib/types/ticket";

    let { data }: PageProps = $props();

    const overdue = $derived(
        data.tickets.items.filter((ticket) => ticket.is_overdue),
    );
    const upcoming = $derived(
        data.tickets.items.filter((ticket) => !ticket.is_overdue),
    );

    const activeWarranty = $derived(
        page.url.searchParams.get("warranty") ?? "",
    );

    let selectedTicketId = $state<number | null>(null);
    const selectedTicket = $derived(
        data.tickets.items.find(
            (ticket) => ticket.ticket_id === selectedTicketId,
        ) ?? null,
    );

    let rejectReason = $state("");
    let errorMessage = $state<string | null>(null);
    let busy = $state(false);

    function selectTicket(ticket: TicketListItem) {
        selectedTicketId = ticket.ticket_id;
        rejectReason = "";
        errorMessage = null;
    }

    function setFilter(warranty: string) {
        selectedTicketId = null;
        const target = warranty
            ? `${page.url.pathname}?warranty=${warranty}`
            : page.url.pathname;

        goto(target);
    }

    async function decide(decision: "APPROVE" | "REJECT") {
        const ticket = selectedTicket;
        if (!ticket) return;

        busy = true;
        errorMessage = null;

        try {
            const res = await fetch(
                `/api/tickets/${ticket.ticket_id}/warranty-decision`,
                {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(
                        decision === "REJECT"
                            ? { decision, reject_reason: rejectReason }
                            : { decision },
                    ),
                },
            );

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                errorMessage = payload?.error?.message ?? "Khong duyet duoc phieu";
                return;
            }

            await invalidateAll();
        } catch {
            errorMessage = "Khong ket noi duoc toi may chu";
        } finally {
            busy = false;
        }
    }
</script>

<div class="title">Duyet Phieu Bao Hanh</div>
<!-- Khach Hang -->
<div class="topBar flex gap-1">
    <p>Bo Loc</p>
    <button
        class={activeWarranty === "" ? "font-bold" : ""}
        type="button"
        onclick={() => setFilter("")}
    >
        Tat ca
    </button>
    <button
        class={activeWarranty === "CHUA_DUYET" ? "font-bold" : ""}
        type="button"
        onclick={() => setFilter("CHUA_DUYET")}
    >
        Chua Duyet
    </button>
</div>

<!-- Thiet Bi -->
<div class="table flex flex-col gap-1">
    <div class="deviceListDisplay">
        <p>Da Qua Han</p>
        <table>
            <thead>
                <tr>
                    <th>Ma Phieu</th>
                    <th>Khach Hang</th>
                    <th>Thiet Bi</th>
                    <th>Han Cam Ket</th>
                </tr>
            </thead>
            <tbody>
                {#if overdue.length === 0}
                    <tr><td colspan="4">Khong co phieu</td></tr>
                {/if}
                {#each overdue as ticket (ticket.ticket_id)}
                    <tr
                        class={`cursor-pointer hover:bg-gray-50 ${
                            selectedTicketId === ticket.ticket_id
                                ? "bg-gray-100"
                                : ""
                        }`}
                        onclick={() => selectTicket(ticket)}
                    >
                        <td>{ticket.ticket_code}</td>
                        <td>{ticket.customer.full_name}</td>
                        <td>{ticket.device.serial_no}</td>
                        <td>{toVietnamDdMmYy(ticket.due_date)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <p>Chua Qua Han</p>
        <table>
            <thead>
                <tr>
                    <th>Ma Phieu</th>
                    <th>Khach Hang</th>
                    <th>Thiet Bi</th>
                    <th>Han Cam Ket</th>
                </tr>
            </thead>
            <tbody>
                {#if upcoming.length === 0}
                    <tr><td colspan="4">Khong co phieu</td></tr>
                {/if}
                {#each upcoming as ticket (ticket.ticket_id)}
                    <tr
                        class={`cursor-pointer hover:bg-gray-50 ${
                            selectedTicketId === ticket.ticket_id
                                ? "bg-gray-100"
                                : ""
                        }`}
                        onclick={() => selectTicket(ticket)}
                    >
                        <td>{ticket.ticket_code}</td>
                        <td>{ticket.customer.full_name}</td>
                        <td>{ticket.device.serial_no}</td>
                        <td>{toVietnamDdMmYy(ticket.due_date)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Chi tiet phieu  -->
<div class="details flex flex-col gap-1">
    <p>Chi Tiet Phieu</p>
    {#if selectedTicket}
        <p>Ma Phieu: {selectedTicket.ticket_code}</p>
        <p>
            Khach Hang: {selectedTicket.customer.full_name} -
            {selectedTicket.customer.phone_masked}
        </p>
        <p>Thiet Bi: {selectedTicket.device.serial_no}</p>
        <p>Nhom Su Co: {selectedTicket.category.category_name}</p>
        <p>Muc Uu Tien: {selectedTicket.priority}</p>
        <p>
            Han Cam Ket: {toVietnamDdMmYy(selectedTicket.due_date)}
            {selectedTicket.is_overdue ? "(qua han)" : ""}
        </p>
        <!-- The four fields below are NOT returned by GET /api/tickets -->
        <p>Ngay mua: -</p>
        <p>So thang bao hanh: -</p>
        <p>Ghi Chu Nguon Goc: -</p>
        <p>Mo ta loi do khach ke: -</p>
    {:else}
        <p>Chon mot phieu de xem chi tiet</p>
    {/if}
</div>

<!-- Xac Nhan -->
<div>
    <p>Xac Nhan</p>
    {#if selectedTicket}
        <p>
            Hinh Thuc: {selectedTicket.is_warranty === null
                ? "Chua duyet"
                : selectedTicket.is_warranty
                  ? "Mien phi"
                  : "Tinh phi"}
        </p>
    {/if}
    <div>
        <button
            class="accept"
            type="button"
            disabled={busy || !selectedTicket || selectedTicket.is_warranty !== null}
            onclick={() => decide("APPROVE")}
        >
            Duyet Bao Hanh Mien Phi
        </button>
        <button
            class="decline"
            type="button"
            disabled={busy || !selectedTicket || selectedTicket.is_warranty !== null}
            onclick={() => decide("REJECT")}
        >
            Tu Choi Bao Hanh Mien Phi
        </button>
    </div>

    <div>
        <p>Ly Do Tu Choi</p>
        <textarea
            class="border border-b-black"
            rows="3"
            cols="3"
            bind:value={rejectReason}
        ></textarea>
    </div>
</div>

<!-- Loi -->
<div class="error">{errorMessage ?? ""}</div>
