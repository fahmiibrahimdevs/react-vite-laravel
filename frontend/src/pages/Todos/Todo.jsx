import Case from "@/components/Case";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import AddButton from "@/pages/Layout/Components/AddButton";
import { useTodoPage } from "./useTodoPage";
import TodoTable from "./TodoTable";
import TodoModal from "./TodoModal";

export default function Todo() {
    useDocumentTitle("Todos");

    const { navigate, rows, totalPages, totalRows, isLoading, isError, pagination, formData, errors, handleChange, isEditing, isMutating, handleAdd, handleEdit, handleToggleComplete, handleSubmit, handleConfirmDelete } = useTodoPage();

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
                <h1>Todos</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <h3>Table Todos</h3>
                    <div className="card-body">
                        <TodoTable rows={rows} pagination={pagination} totalRows={totalRows} totalPages={totalPages} onEdit={handleEdit} onToggleComplete={handleToggleComplete} onConfirmDelete={handleConfirmDelete} />
                    </div>
                </div>
                <AddButton handleAdd={handleAdd} />
            </div>

            <TodoModal isEditing={isEditing} isMutating={isMutating} formData={formData} errors={errors} onChange={handleChange} onSubmit={handleSubmit} />
        </Case>
    );
}
