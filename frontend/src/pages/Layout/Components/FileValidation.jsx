export default function FileValidation({ label, name, onChange, error, accept, multiple = false }) {
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input type="file" name={name} id={name} className={`form-control ${error ? "is-invalid" : ""}`} onChange={onChange} accept={accept} multiple={multiple} />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}
