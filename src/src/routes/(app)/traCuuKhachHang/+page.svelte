<script lang="ts">
    import "#lib/app.css";
    import { goto } from "$app/navigation";
    import type { Customer } from "#lib/types/customer";

    let loading = $state(false);
    let message = $state<string | null>(null);
    let customer = $state<Customer | null>(null);
    let phoneNum = $state("");
    let status = $state<"idle" | "found" | "notfound">("idle");
    let form = $state({ full_name: "", address: "" });

    async function searchPhoneNumber() {
        loading = true;
        message = null;
        customer = null;

        try {
            const res = await fetch(
                `/api/customers?phone=${encodeURIComponent(phoneNum)}`,
            );
            const body = await res.json();

            if (res.ok) {
                customer = body as Customer;
                status = "found";
                return;
            }

            if (res.status === 404) {
                form.full_name = "";
                form.address = "";
                status = "notfound";
                return;
            }

            message = body.error.message;
        } finally {
            loading = false;
        }
    }

    async function createCustomer() {
        loading = true;
        message = null;

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: phoneNum,
                    full_name: form.full_name,
                    address: form.address,
                }),
            });
            const body = await res.json();

            if (!res.ok) {
                message = body.error.message;
                return;
            }

            await searchPhoneNumber();
        } finally {
            loading = false;
        }
    }

    function goToCreate() {
        goto(`/taoPhieuBaoHanh?phone=${encodeURIComponent(phoneNum)}`);
    }
</script>

<div class="title">Tra Cuu Khach Hang</div>

<div class="searchPhoneNumber flex gap-1">
    <p>So Dien Thoai</p>
    <input bind:value={phoneNum} class="border border-b-black" type="text" />
    <button
        disabled={loading}
        onclick={searchPhoneNumber}
        class="goToTaoPhieuBaoHanh ml-10">Tra Cuu</button
    >
</div>

{#if status === "found" && customer}
    <div class="search flex flex-col gap-1">
        <div class="flex gap-1">
            <p>Ho Ten</p>
            <input
                readonly={true}
                value={customer.full_name}
                class="border border-b-black"
                type="text"
            />
        </div>

        <div class="flex gap-1">
            <p>SDT</p>
            <input
                readonly={true}
                value={customer.phone ?? customer.phone_masked}
                class="border border-b-black"
                type="text"
            />
        </div>

        <div class="flex gap-1">
            <p>Dia Chi</p>
            <input
                readonly={true}
                value={customer.address}
                class="border border-b-black"
                type="text"
            />
        </div>
        <div class="deviceListDisplay">
            <p>Danh Sach Thiet Bi</p>

            {#if customer.devices.length === 0}
                <p>Chua co thiet bi</p>
            {:else}
                <table>
                    <thead>
                        <tr>
                            <th>Serial</th>
                            <th>Mua Ngoai</th>
                            <th>Ngay Mua</th>
                            <th>Bao Hanh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each customer.devices as device (device.device_id)}
                            <tr>
                                <td>{device.serial_no}</td>
                                <td>{device.is_external ? "Co" : "Khong"}</td>
                                <td>{device.purchase_date ?? "—"}</td>
                                <td>{device.warranty_months} thang</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
        <button class="goToTaoPhieuBaoHanh" onclick={goToCreate}>
            Tiep Tuc Tao Phieu
        </button>
    </div>
{:else if status === "notfound"}
    <div class="search flex flex-col gap-1">
        <div class="flex gap-1">
            <p>Ho Ten</p>
            <input
                bind:value={form.full_name}
                class="border border-b-black"
                type="text"
            />
        </div>

        <div class="flex gap-1">
            <p>Dia Chi</p>
            <input
                bind:value={form.address}
                class="border border-b-black"
                type="text"
            />
        </div>

        <button onclick={createCustomer} disabled={loading}>
            Tao Khach Hang
        </button>
    </div>
{/if}

<div class="error">
    {message}
</div>
