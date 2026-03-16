import Swal from "sweetalert2";

export const toast = {
    success: (text = "Operation successful") => Swal.fire({ title: "Success!", text, icon: "success", timer: 1500 }),

    error: (text = "Something went wrong.", html = null) =>
        Swal.fire({
            title: "Oops...",
            ...(html ? { html } : { text }),
            icon: "error",
            timer: 4000,
        }),

    validationError: (summary = "Validation failed", errors) => {
        if (!errors || !Array.isArray(errors) || errors.length === 0) {
            return Swal.fire({ title: "Oops...", text: summary, icon: "error", timer: 3000 });
        }
        const list = errors
            .map((e) => {
                const field = e.path?.[0] || e.field;
                const msg = e.message || "Nilai tidak valid";
                return field ? `<li><strong>${field}:</strong> ${msg}</li>` : `<li>${msg}</li>`;
            })
            .join("");
        return Swal.fire({
            title: summary,
            html: `<ul style="text-align:left;margin:0;padding-left:1.2em;">${list}</ul>`,
            icon: "error",
            timer: 5000,
        });
    },

    confirmDelete: (text, confirmText, title) =>
        Swal.fire({
            title: title || "Yakin?",
            text: text || "Data yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: confirmText || "Ya, hapus!",
        }),
};
