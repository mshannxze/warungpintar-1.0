export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

export function formatDate(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
    }).format(d);
}
