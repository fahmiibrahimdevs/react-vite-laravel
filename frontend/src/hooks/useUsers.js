import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/services/api";
import { toast } from "@/utils/toast";

const USERS_KEY = "users";

/**
 * Fetch paginated users list (admin only).
 * Backend supports: page, limit, role, status filters
 */
export function useUsers({ page = 1, limit = 10, role = "", status = "" } = {}) {
    return useQuery({
        queryKey: [USERS_KEY, { page, limit, role, status }],
        queryFn: async () => {
            const params = { page, limit };
            if (role) params.role = role;
            if (status) params.status = status;
            const { data } = await userApi.getAll(params);
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Create a new user (admin can set role & status).
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => userApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success("User berhasil dibuat");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Gagal membuat user.", resData?.errors);
        },
    });
}

/**
 * Update user role.
 */
export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, role }) => userApi.updateRole(id, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success("Role berhasil diperbarui");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Gagal memperbarui role.", resData?.errors);
        },
    });
}

/**
 * Update user status (ACTIVE / INACTIVE).
 */
export function useUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => userApi.updateStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success("Status berhasil diperbarui");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Gagal memperbarui status.", resData?.errors);
        },
    });
}

/**
 * Delete a user.
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => userApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success("User berhasil dihapus");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Gagal menghapus user.", resData?.errors);
        },
    });
}
