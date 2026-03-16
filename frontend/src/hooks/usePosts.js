import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/services/api";
import { toast } from "@/utils/toast";
import { parseApiErrors } from "@/utils/validation";

const POSTS_KEY = "posts";

/**
 * Fetch paginated posts list.
 * Backend uses: page, limit, search
 * Backend returns: { success, data: [...], meta: { page, limit, total, totalPages } }
 */
export function usePosts({ page = 1, limit = 10, search = "" } = {}) {
    return useQuery({
        queryKey: [POSTS_KEY, { page, limit, search }],
        queryFn: async () => {
            const { data } = await postApi.getAll({ page, limit, search });
            return data; // { success, data: [...], meta: { page, limit, total, totalPages } }
        },
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Create a new post.
 * Backend expects: { title, content, published? }
 */
export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => postApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
            toast.success("Post created successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Update an existing post.
 * Backend expects: { title?, content?, published? }
 */
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => postApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
            toast.success("Post updated successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Delete a post.
 */
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => postApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
            toast.success("Post deleted successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Upload files to a post.
 * Backend expects: multipart/form-data with field "files" (multiple)
 */
export function useUploadPostFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, formData }) => postApi.uploadFiles(postId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
            toast.success("Files uploaded successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

/**
 * Delete a single file from a post.
 */
export function useDeletePostFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, fileId }) => postApi.removeFile(postId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
            toast.success("File deleted successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}
