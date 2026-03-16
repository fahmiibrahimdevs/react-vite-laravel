export default function SelectValidation({ label, name, value, onChange, error, options = [], placeholder = "-- Select --" }) {
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <select name={name} id={name} className={`form-control ${error ? "is-invalid" : ""}`} value={value} onChange={onChange}>
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                    </option>
                ))}
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}
