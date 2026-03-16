import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Case from "@/components/Case";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { usePagination } from "@/hooks/usePagination";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, useUploadPostFiles, useDeletePostFile } from "@/hooks/usePosts";
import { validateForm, parseApiErrors } from "@/utils/validation";
import { toast } from "@/utils/toast";
import InputValidation from "@/pages/Layout/Components/InputValidation";
import TextareaValidation from "@/pages/Layout/Components/TextareaValidation";
import Pagination from "@/pages/Layout/Components/Pagination";
import AddButton from "@/pages/Layout/Components/AddButton";
import SearchEntries from "@/pages/Layout/Components/SearchEntries";
import ModalFooter from "@/pages/Layout/Components/ModalFooter";
import ModalHeader from "@/pages/Layout/Components/ModalHeader";

const INITIAL_VALUES = { title: "", content: "" };

const VALIDATION_RULES = {
    title: { required: "Title is required" },
    content: { required: "Content is required" },
};

export default function Post() {
    useDocumentTitle("Posts");
    const navigate = useNavigate();

    // ─── Pagination & Search ─────────────────────────────────────────────
    const pagination = usePagination();

    // ─── TanStack Query ──────────────────────────────────────────────────
    const {
        data: postData,
        isLoading,
        isError,
    } = usePosts({
        page: pagination.currentPage,
        limit: pagination.perPage,
        search: pagination.debouncedSearch,
    });

    const rows = postData?.data ?? [];
    const totalPages = postData?.meta?.totalPages ?? 1;
    const totalRows = postData?.meta?.total ?? 0;

    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();
    const deleteMutation = useDeletePost();
    const uploadFilesMutation = useUploadPostFiles();
    const deleteFileMutation = useDeletePostFile();

    // ─── Form & Modal State ──────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [detailPost, setDetailPost] = useState(null);

    const fileInputRef = useRef(null);

    const { formData, errors, handleChange, isValid, reset, setValues, setErrors } = useForm(INITIAL_VALUES, (data) => validateForm(data, VALIDATION_RULES));

    const isMutating = createMutation.isPending || updateMutation.isPending;

    // Sync detailPost with fresh data after query refetch (upload/delete)
    useEffect(() => {
        if (detailPost) {
            const fresh = rows.find((r) => r.id === detailPost.id);
            if (fresh) setDetailPost(fresh);
        }
    }, [rows]);

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
            content: row.content,
        });
    };

    const handleTogglePublish = (row) => {
        updateMutation.mutate({ id: row.id, data: { published: !row.published } });
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

    const handleUploadFiles = (postId) => {
        if (!selectedFiles || selectedFiles.length === 0) {
            toast.error("Please select files to upload");
            return;
        }
        const fd = new FormData();
        Array.from(selectedFiles).forEach((file) => {
            fd.append("files[]", file);
        });
        uploadFilesMutation.mutate(
            { postId, formData: fd },
            {
                onSuccess: () => {
                    setSelectedFiles(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    // Modal tetap terbuka agar user bisa lihat file yang baru diupload
                },
            }
        );
    };

    const handleDeleteFile = async (postId, fileId) => {
        const result = await toast.confirmDelete();
        if (result.isConfirmed) {
            deleteFileMutation.mutate({ postId, fileId });
        }
    };

    // ─── Error handling for 403 ──────────────────────────────────────────
    if (isError) {
        navigate("/403");
        return null;
    }

    // ─── Loading ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <Case>
                <div className="section-header">
                    <h1>Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header">
                <h1>Posts</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <h3>Table Posts</h3>
                    <div className="card-body">
                        <SearchEntries showing={pagination.perPage} handleShow={pagination.handlePerPageChange} searchTerm={pagination.search} handleSearch={pagination.handleSearch} />
                        <div className="table-responsive">
                            <table className="tw-w-full tw-table-auto">
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-text-gray-700">
                                        <th width="8%" className="text-center tw-whitespace-nowrap">
                                            No
                                        </th>
                                        <th className="tw-whitespace-nowrap">Title</th>
                                        <th className="tw-whitespace-nowrap">Content</th>
                                        <th width="10%" className="text-center tw-whitespace-nowrap">
                                            Published
                                        </th>
                                        <th width="8%" className="text-center tw-whitespace-nowrap">
                                            Files
                                        </th>
                                        <th className="text-center tw-whitespace-nowrap">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length > 0 ? (
                                        rows.map((row, index) => (
                                            <tr key={row.id}>
                                                <td className="text-center">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
                                                <td>{row.title}</td>
                                                <td>{row.content?.length > 80 ? row.content.substring(0, 80) + "..." : row.content}</td>
                                                <td className="text-center">
                                                    <button onClick={() => handleTogglePublish(row)} className={`badge ${row.published ? "badge-success" : "badge-secondary"} tw-cursor-pointer`}>
                                                        {row.published ? "Published" : "Draft"}
                                                    </button>
                                                </td>
                                                <td className="text-center">
                                                    <button onClick={() => setDetailPost(row)} className="badge badge-info tw-cursor-pointer" data-toggle="modal" data-target="#filesModal">
                                                        {row.files?.length ?? 0}
                                                    </button>
                                                </td>
                                                <td className="text-center tw-whitespace-nowrap">
                                                    <button onClick={() => handleEdit(row)} className="btn btn-primary mr-1" data-toggle="modal" data-target="#formDataModal">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button onClick={() => handleConfirmDelete(row.id)} className="btn btn-danger">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                No data available in the table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={pagination.currentPage} showing={pagination.perPage} totalRows={totalRows} totalPages={totalPages} handlePageChange={pagination.handlePageChange} />
                    </div>
                </div>
                <AddButton handleAdd={handleAdd} />
            </div>

            {/* Create/Edit Modal */}
            <div className="modal fade" id="formDataModal" aria-labelledby="formDataModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <ModalHeader isEditing={isEditing} />
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <InputValidation label="Title" name="title" type="text" value={formData.title} onChange={handleChange} error={errors.title} />
                                <TextareaValidation label="Content" name="content" value={formData.content} onChange={handleChange} error={errors.content} />
                            </div>
                            <ModalFooter isSubmitting={isMutating} />
                        </form>
                    </div>
                </div>
            </div>

            {/* Files Modal */}
            <div className="modal fade" id="filesModal" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Files — {detailPost?.title}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Upload area */}
                            <div className="tw-mb-4 tw-flex tw-items-end tw-gap-2">
                                <div className="tw-flex-1">
                                    <label className="tw-mb-1 tw-block tw-text-sm tw-font-medium">Upload files</label>
                                    <input type="file" multiple className="form-control" ref={fileInputRef} onChange={(e) => setSelectedFiles(e.target.files)} />
                                </div>
                                <button type="button" className="btn btn-primary" onClick={() => handleUploadFiles(detailPost?.id)} disabled={uploadFilesMutation.isPending}>
                                    {uploadFilesMutation.isPending ? "Uploading..." : "Upload"}
                                </button>
                            </div>

                            {/* Files list */}
                            {detailPost?.files?.length > 0 ? (
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th className="tw-whitespace-nowrap">File Name</th>
                                            <th className="tw-whitespace-nowrap">Type</th>
                                            <th className="tw-whitespace-nowrap">Size</th>
                                            <th className="text-center tw-whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailPost.files.map((file) => (
                                            <tr key={file.id}>
                                                <td>
                                                    <a href={`/${file.path}`} target="_blank" rel="noopener noreferrer">
                                                        {file.originalName}
                                                    </a>
                                                </td>
                                                <td>{file.mimeType}</td>
                                                <td>{(file.size / 1024).toFixed(1)} KB</td>
                                                <td className="text-center tw-whitespace-nowrap">
                                                    <button onClick={() => handleDeleteFile(detailPost.id, file.id)} className="btn btn-danger btn-sm" disabled={deleteFileMutation.isPending}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted text-center">No files uploaded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Case>
    );
}
