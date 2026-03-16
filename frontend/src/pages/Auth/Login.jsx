import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { validateForm } from "@/utils/validation";

const VALIDATION_RULES = {
    email: { required: "Email wajib diisi" },
    password: { required: "Password wajib diisi" },
};

export default function Login() {
    useDocumentTitle("Login");
    const { login, isLoggingIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const { formData, errors, handleChange, isValid } = useForm({ email: "", password: "" }, (data) => validateForm(data, VALIDATION_RULES));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid()) return;
        login(formData);
    };

    return (
        <div className="tw-w-full tw-max-w-md">
            {/* Card */}
            <div className="tw-rounded-2xl tw-bg-white tw-px-8 tw-py-10 tw-shadow-xl tw-shadow-slate-200/60">
                {/* Logo & Branding */}
                <div className="tw-mb-8 tw-text-center">
                    <div className="tw-mx-auto tw-mb-4 tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-blue-800 tw-text-white">
                        <i className="fas fa-code tw-text-2xl"></i>
                    </div>
                    <h1 className="tw-text-xl tw-font-bold tw-text-gray-800">Starter App</h1>
                    <p className="tw-mt-1 tw-text-sm tw-text-gray-400">React + Hono.js Starter Template</p>
                </div>

                {/* Heading */}
                <div className="tw-mb-6 tw-text-center">
                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">Selamat Datang</h2>
                    <p className="tw-mt-1 tw-text-sm tw-text-gray-500">Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="tw-mb-4">
                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-medium tw-text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input type="email" name="email" id="email" className={`tw-w-full tw-rounded-lg tw-border tw-px-4 tw-py-2.5 tw-text-sm tw-text-gray-700 tw-outline-none tw-transition focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-500/20 ${errors.email ? "tw-border-red-400 focus:tw-border-red-500 focus:tw-ring-red-500/20" : "tw-border-gray-300"}`} placeholder="emailanda@contoh.com" value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="tw-mt-1 tw-text-xs tw-text-red-500">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="tw-mb-4">
                        <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-medium tw-text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <div className="tw-relative">
                            <input type={showPassword ? "text" : "password"} name="password" id="password" className={`tw-w-full tw-rounded-lg tw-border tw-px-4 tw-py-2.5 tw-pr-11 tw-text-sm tw-text-gray-700 tw-outline-none tw-transition focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-500/20 ${errors.password ? "tw-border-red-400 focus:tw-border-red-500 focus:tw-ring-red-500/20" : "tw-border-gray-300"}`} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                            <button type="button" className="tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-text-gray-400 tw-transition hover:tw-text-gray-600" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} tw-text-sm`}></i>
                            </button>
                        </div>
                        {errors.password && <p className="tw-mt-1 tw-text-xs tw-text-red-500">{errors.password}</p>}
                    </div>

                    {/* Remember Me */}
                    <div className="tw-mb-6 tw-flex tw-items-center">
                        <input type="checkbox" id="remember" className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-blue-600 focus:tw-ring-blue-500" />
                        <label htmlFor="remember" className="tw-ml-2 tw-text-sm tw-text-gray-600">
                            Ingat saya di perangkat ini
                        </label>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={isLoggingIn} className="tw-flex tw-w-full tw-items-center tw-justify-center tw-rounded-lg tw-bg-blue-800 tw-px-4 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-blue-900 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60">
                        {isLoggingIn ? (
                            <>
                                <i className="fas fa-spinner fa-spin tw-mr-2"></i> Memproses...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <p className="tw-mt-6 tw-text-center tw-text-sm tw-text-gray-500">
                    Belum punya akun?{" "}
                    <Link to="/register" className="tw-font-semibold tw-text-blue-700 hover:tw-text-blue-800">
                        Daftar disini
                    </Link>
                </p>
            </div>

            {/* Copyright */}
            <p className="tw-mt-6 tw-text-center tw-text-xs tw-text-gray-400">&copy; {new Date().getFullYear()} Starter App. All rights reserved.</p>
        </div>
    );
}
