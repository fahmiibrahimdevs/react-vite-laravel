import apiClient from "@/lib/axios";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
    login: (data) => apiClient.post("/auth/login", data),
    register: (data) => apiClient.post("/auth/register", data),
    logout: () => apiClient.post("/auth/logout"),
    getUser: () => apiClient.get("/auth/profile"),
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileApi = {
    get: () => apiClient.get("/auth/profile"),
    update: (data) => apiClient.put("/auth/profile", data),
    updatePassword: (data) => apiClient.post("/auth/change-password", data),
};

// ─── Todos ───────────────────────────────────────────────────────────────────

export const todoApi = {
    getAll: (params) => apiClient.get("/todos", { params }),
    create: (data) => apiClient.post("/todos", data),
    show: (id) => apiClient.get(`/todos/${id}`),
    update: (id, data) => apiClient.put(`/todos/${id}`, data),
    remove: (id) => apiClient.delete(`/todos/${id}`),
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postApi = {
    getAll: (params) => apiClient.get("/posts", { params }),
    create: (data) => apiClient.post("/posts", data),
    show: (id) => apiClient.get(`/posts/${id}`),
    update: (id, data) => apiClient.put(`/posts/${id}`, data),
    remove: (id) => apiClient.delete(`/posts/${id}`),
    uploadFiles: (id, data) =>
        apiClient.post(`/posts/${id}/files`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    removeFile: (postId, fileId) => apiClient.delete(`/posts/${postId}/files/${fileId}`),
};

// ─── Users (Admin only) ─────────────────────────────────────────────────────

export const userApi = {
    getAll: (params) => apiClient.get("/users", { params }),
    create: (data) => apiClient.post("/users", data),
    show: (id) => apiClient.get(`/users/${id}`),
    remove: (id) => apiClient.delete(`/users/${id}`),
    updateRole: (id, data) => apiClient.patch(`/users/${id}/role`, data),
    updateStatus: (id, data) => apiClient.patch(`/users/${id}/status`, data),
};

