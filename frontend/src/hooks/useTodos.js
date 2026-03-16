import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/services/api";
import { toast } from "@/utils/toast";
import { parseApiErrors } from "@/utils/validation";

const TODOS_KEY = "todos";

/**
 * Fetch paginated todos list.
 * Backend uses: page, limit, search
 * Backend returns: { success, data: [...], meta: { page, limit, total, totalPages } }
 */
export function useTodos({ page = 1, limit = 10, search = "" } = {}) {
    return useQuery({
        queryKey: [TODOS_KEY, { page, limit, search }],
        queryFn: async () => {
            const { data } = await todoApi.getAll({ page, limit, search });
            return data; // { success, data: [...], meta: { page, limit, total, totalPages } }
        },
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Create a new todo.
 * Backend expects: { title, description? }
 */
export function useCreateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => todoApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
            toast.success("Data created successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Update an existing todo.
 * Backend expects: { title?, description?, completed? }
 */
export function useUpdateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => todoApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
            toast.success("Data updated successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Delete a todo.
 */
export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => todoApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
            toast.success("Data deleted successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}
