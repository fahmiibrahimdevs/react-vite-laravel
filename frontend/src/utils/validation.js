/**
 * Parse backend Zod validation errors into a form-friendly object.
 * Backend format: { errors: [{ path: ["fieldName"], message: "..." }, ...] }
 *
 * @param {Object} responseData - error.response.data from Axios
 * @returns {{ formErrors: Object, summary: string }}
 */
export function parseApiErrors(responseData) {
    const formErrors = {};
    const messages = [];

    if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((err) => {
            const field = err.path?.[0] || "general";
            const msg = err.message || "Invalid value";
            formErrors[field] = msg;
            messages.push(field !== "general" ? `${field}: ${msg}` : msg);
        });
    }

    return {
        formErrors,
        summary: messages.length > 0 ? messages.join("\n") : responseData?.message || "Something went wrong.",
    };
}

/**
 * Validates form data against a set of rules.
 *
 * @param {Object} data  - Form data to validate
 * @param {Object} rules - { fieldName: { required?: string, pattern?: { value: RegExp, message: string } } }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateForm(data, rules) {
    const errors = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field];

        if (fieldRules.required && !value) {
            isValid = false;
            errors[field] = fieldRules.required;
            continue;
        }

        if (fieldRules.pattern && value && !fieldRules.pattern.value.test(value)) {
            isValid = false;
            errors[field] = fieldRules.pattern.message;
            continue;
        }

        if (fieldRules.minLength && value && value.length < fieldRules.minLength.value) {
            isValid = false;
            errors[field] = fieldRules.minLength.message;
            continue;
        }

        if (fieldRules.match && value !== data[fieldRules.match.field]) {
            isValid = false;
            errors[field] = fieldRules.match.message;
        }
    }

    return { isValid, errors };
}
