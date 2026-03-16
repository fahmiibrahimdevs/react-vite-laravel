import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/hooks/useForm";
import { usePagination } from "@/hooks/usePagination";
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { validateForm, parseApiErrors } from "@/utils/validation";
import { toast } from "@/utils/toast";

const INITIAL_VALUES = { title: "", description: "" };

const VALIDATION_RULES = {
    title: { required: "Title is required" },
};

export function useTodoPage() {
    const navigate = useNavigate();

    // ─── Pagination & Search ─────────────────────────────────────────────
    const pagination = usePagination();

    // ─── TanStack Query ──────────────────────────────────────────────────
    const {
        data: todoData,
        isLoading,
        isError,
    } = useTodos({
        page: pagination.currentPage,
        limit: pagination.perPage,
        search: pagination.debouncedSearch,
    });

    const rows = todoData?.data ?? [];
    const totalPages = todoData?.meta?.totalPages ?? 1;
    const totalRows = todoData?.meta?.total ?? 0;

    const createMutation = useCreateTodo();
    const updateMutation = useUpdateTodo();
    const deleteMutation = useDeleteTodo();

    // ─── Form & Modal State ──────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const { formData, errors, handleChange, isValid, reset, setValues } = useForm(INITIAL_VALUES, (data) => validateForm(data, VALIDATION_RULES));

    const isMutating = createMutation.isPending || updateMutation.isPending;

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleAdd = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
    };

    const handleEdit = (row) => {
        setIsEditing(true);
        setEditId(row.id);
        setValues({
            title: row.title,
            description: row.description || "",
        });
    };

    const handleToggleComplete = (row) => {
        updateMutation.mutate({ id: row.id, data: { completed: !row.completed } });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid()) return;

        const onSuccess = () => {
            $(".modal").modal("hide");
            reset();
        };

        const onError = (error) => {
            const resData = error.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                const { formErrors } = parseApiErrors(resData);
                setErrors((prev) => ({ ...prev, ...formErrors }));
            }
        };

        if (isEditing) {
            updateMutation.mutate({ id: editId, data: formData }, { onSuccess, onError });
        } else {
            createMutation.mutate(formData, { onSuccess, onError });
        }
    };

    const handleConfirmDelete = async (id) => {
        const result = await toast.confirmDelete();
        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    return {
        // Navigation
        navigate,
        // Data & Status
        rows,
        totalPages,
        totalRows,
        isLoading,
        isError,
        // Pagination
        pagination,
        // Form
        formData,
        errors,
        handleChange,
        isEditing,
        isMutating,
        // Handlers
        handleAdd,
        handleEdit,
        handleToggleComplete,
        handleSubmit,
        handleConfirmDelete,
    };
}
