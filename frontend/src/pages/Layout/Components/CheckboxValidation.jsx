export default function CheckboxValidation({ label, name, checked, onChange, error }) {
    return (
        <div className="form-group">
            <div className="form-check">
                <input type="checkbox" name={name} id={name} className={`form-check-input ${error ? "is-invalid" : ""}`} checked={!!checked} onChange={onChange} />
                <label className="form-check-label" htmlFor={name}>
                    {label}
                </label>
                {error && <div className="invalid-feedback">{error}</div>}
            </div>
        </div>
    );
}
