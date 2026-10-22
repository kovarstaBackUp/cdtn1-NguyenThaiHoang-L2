<script lang="ts">
    import "#lib/app.css";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
</script>

<div class="login flex flex-col gap-1">
    <h1>Dang Nhap</h1>

    <form method="POST" class="flex flex-col gap-1">
        <label class="flex gap-1">
            Ten dang nhap
            <input
                name="username"
                type="text"
                class="border border-b-black"
                autocomplete="username"
                value={form?.username ?? ""}
            />
        </label>

        <label class="flex gap-1">
            Mat khau
            <input
                name="password"
                type="password"
                class="border border-b-black"
                autocomplete="current-password"
            />
        </label>

        <button type="submit">Dang Nhap</button>
    </form>

    {#if form?.message}
        <p class="message">{form.message}</p>
    {/if}
</div>
