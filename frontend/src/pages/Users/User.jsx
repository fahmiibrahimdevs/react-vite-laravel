import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Case from "@/components/Case";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { usePagination } from "@/hooks/usePagination";
import { useUsers, useCreateUser, useUpdateRole, useUpdateStatus, useDeleteUser } from "@/hooks/useUsers";
import { validateForm, parseApiErrors } from "@/utils/validation";
import { toast } from "@/utils/toast";
import InputValidation from "@/pages/Layout/Components/InputValidation";
import SelectValidation from "@/pages/Layout/Components/SelectValidation";
import Pagination from "@/pages/Layout/Components/Pagination";
import AddButton from "@/pages/Layout/Components/AddButton";
import SearchEntries from "@/pages/Layout/Components/SearchEntries";
import ModalFooter from "@/pages/Layout/Components/ModalFooter";
import ModalHeader from "@/pages/Layout/Components/ModalHeader";

const ROLE_OPTIONS = [
    { value: "USER", label: "User" },
    { value: "MODERATOR", label: "Moderator" },
    { value: "ADMIN", label: "Admin" },
];

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const INITIAL_VALUES = {
    name: "",
    email: "",
    password: "",
    phone: "",
    birthDate: "",
    role: "USER",
    status: "ACTIVE",
};

const VALIDATION_RULES = {
    name: { required: "Nama wajib diisi" },
    email: { required: "Email wajib diisi" },
    password: { required: "Password wajib diisi" },
};

export default function User() {
    useDocumentTitle("User Management");
    const navigate = useNavigate();

    // ─── Pagination ──────────────────────────────────────────────────────
    const pagination = usePagination();

    // ─── TanStack Query ──────────────────────────────────────────────────
    const {
        data: queryData,
        isLoading,
        isError,
    } = useUsers({
        page: pagination.currentPage,
        limit: pagination.perPage,
    });

    const rows = queryData?.data ?? [];
    const totalPages = queryData?.meta?.totalPages ?? 1;
    const totalRows = queryData?.meta?.total ?? 0;

    const createMutation = useCreateUser();
    const updateRoleMutation = useUpdateRole();
    const updateStatusMutation = useUpdateStatus();
    const deleteMutation = useDeleteUser();

    // ─── Form State ──────────────────────────────────────────────────────
    const { formData, errors, handleChange, isValid, reset, setValues, setErrors } = useForm(INITIAL_VALUES, (data) => validateForm(data, VALIDATION_RULES));

    const isMutating = createMutation.isPending;

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleAdd = () => {
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid()) return;

        const payload = { ...formData };
        if (!payload.phone) delete payload.phone;
        if (!payload.birthDate) delete payload.birthDate;

        createMutation.mutate(payload, {
            onSuccess: () => {
                $(".modal").modal("hide");
                reset();
            },
            onError: (error) => {
                const resData = error.response?.data;
                if (resData?.errors && Array.isArray(resData.errors)) {
                    const { formErrors } = parseApiErrors(resData);
                    setErrors((prev) => ({ ...prev, ...formErrors }));
                }
            },
        });
    };

    const handleChangeRole = async (userId, newRole) => {
        const result = await toast.confirmDelete("Yakin ingin mengubah role user ini?", "Ya, ubah!", "Ubah Role");
        if (result.isConfirmed) {
            updateRoleMutation.mutate({ id: userId, role: newRole });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const result = await toast.confirmDelete(`Yakin ingin ${newStatus === "ACTIVE" ? "mengaktifkan" : "menonaktifkan"} user ini?`, `Ya, ${newStatus === "ACTIVE" ? "aktifkan" : "nonaktifkan"}!`, "Ubah Status");
        if (result.isConfirmed) {
            updateStatusMutation.mutate({ id: userId, status: newStatus });
        }
    };

    const handleConfirmDelete = async (id) => {
        const result = await toast.confirmDelete();
        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    if (isError) {
        navigate("/403");
        return null;
    }

    if (isLoading) {
        return (
            <Case>
                <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                    <h1 className="mb-1 tw-text-lg">Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                <h1 className="mb-1 tw-text-lg">User Management</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <h3>Daftar User</h3>
                    <div className="card-body px-0">
                        <SearchEntries showing={pagination.perPage} handleShow={pagination.handlePerPageChange} searchTerm={pagination.search} handleSearch={pagination.handleSearch} />

                        <div className="table-responsive tw-max-h-[500px]">
                            <table className="tw-table-auto">
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-text-gray-700">
                                        <th width="6%" className="text-center tw-whitespace-nowrap">
                                            No
                                        </th>
                                        <th className="tw-whitespace-nowrap">Nama</th>
                                        <th className="tw-whitespace-nowrap">Email</th>
                                        <th className="tw-whitespace-nowrap">Phone</th>
                                        <th className="text-center tw-whitespace-nowrap">Role</th>
                                        <th className="text-center tw-whitespace-nowrap">Status</th>
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
                                                <td>
                                                    <div className="tw-font-semibold">{row.name}</div>
                                                    {row.birthDate && <small className="tw-text-gray-400">{new Date(row.birthDate).toLocaleDateString("id-ID")}</small>}
                                                </td>
                                                <td>{row.email}</td>
                                                <td>{row.phone || <span className="tw-text-gray-300">-</span>}</td>
                                                <td className="text-center">
                                                    <select className={`form-control form-control-sm tw-mx-auto tw-w-auto tw-text-xs tw-font-semibold ${row.role === "ADMIN" ? "tw-text-red-600" : row.role === "MODERATOR" ? "tw-text-yellow-600" : "tw-text-blue-600"}`} value={row.role} onChange={(e) => handleChangeRole(row.id, e.target.value)} disabled={updateRoleMutation.isPending}>
                                                        {ROLE_OPTIONS.map((o) => (
                                                            <option key={o.value} value={o.value}>
                                                                {o.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="text-center">
                                                    <button onClick={() => handleToggleStatus(row.id, row.status)} className={`badge tw-cursor-pointer tw-border-0 tw-px-3 tw-py-1 ${row.status === "ACTIVE" ? "badge-success" : "badge-danger"}`} disabled={updateStatusMutation.isPending}>
                                                        {row.status === "ACTIVE" ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="text-center tw-whitespace-nowrap">
                                                    <button onClick={() => handleConfirmDelete(row.id)} className="btn btn-danger" title="Hapus user">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                Tidak ada data
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination currentPage={pagination.currentPage} showing={pagination.perPage} totalRows={totalRows} totalPages={totalPages} handlePageChange={pagination.handlePageChange} />
                    </div>
                </div>
            </div>

            {/* ── Add User Button ── */}
            <AddButton onClick={handleAdd} />

            {/* ── Create User Modal ── */}
            <div className="modal fade" id="formDataModal" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <ModalHeader title="Tambah User Baru" />
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputValidation label="Nama" name="name" type="text" value={formData.name} onChange={handleChange} error={errors.name} />
                                    </div>
                                    <div className="col-md-6">
                                        <InputValidation label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputValidation label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
                                    </div>
                                    <div className="col-md-6">
                                        <InputValidation label="Phone" name="phone" type="text" value={formData.phone} onChange={handleChange} error={errors.phone} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <InputValidation label="Tanggal Lahir" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} error={errors.birthDate} />
                                    </div>
                                    <div className="col-md-4">
                                        <SelectValidation label="Role" name="role" value={formData.role} onChange={handleChange} error={errors.role} options={ROLE_OPTIONS} />
                                    </div>
                                    <div className="col-md-4">
                                        <SelectValidation label="Status" name="status" value={formData.status} onChange={handleChange} error={errors.status} options={STATUS_OPTIONS} />
                                    </div>
                                </div>
                            </div>
                            <ModalFooter isMutating={isMutating} />
                        </form>
                    </div>
                </div>
            </div>
        </Case>
    );
}
