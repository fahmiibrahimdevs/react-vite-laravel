import InputValidation from "@/pages/Layout/Components/InputValidation";
import TextareaValidation from "@/pages/Layout/Components/TextareaValidation";
import ModalFooter from "@/pages/Layout/Components/ModalFooter";
import ModalHeader from "@/pages/Layout/Components/ModalHeader";

export default function TodoModal({ isEditing, isMutating, formData, errors, onChange, onSubmit }) {
    return (
        <div className="modal fade" id="formDataModal" aria-labelledby="formDataModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <ModalHeader isEditing={isEditing} />
                    <form onSubmit={onSubmit}>
                        <div className="modal-body">
                            <InputValidation label="Title" name="title" type="text" value={formData.title} onChange={onChange} error={errors.title} />
                            <TextareaValidation label="Description" name="description" value={formData.description} onChange={onChange} error={errors.description} />
                        </div>
                        <ModalFooter isSubmitting={isMutating} />
                    </form>
                </div>
            </div>
        </div>
    );
}
