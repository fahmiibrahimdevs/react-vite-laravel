import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <section className="tw-flex tw-min-h-screen tw-items-center tw-justify-center tw-bg-gradient-to-br tw-from-blue-50 tw-to-slate-100 tw-px-4 tw-py-8">
            <Outlet />
        </section>
    );
}
