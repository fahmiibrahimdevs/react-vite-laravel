import { Route, Routes } from "react-router-dom";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/pages/Layout/AuthLayout";
import MainLayout from "@/pages/Layout/MainLayout";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import Dashboard from "@/pages/Dashboard";
import Todo from "@/pages/Todos/Todo";
import Post from "@/pages/Posts/Post";
import Profile from "@/pages/Profile/Profile";
import User from "@/pages/Users/User";
import CrudGenerator from "@/pages/Generator/CrudGenerator";
import Error403 from "@/pages/Error/403";
import Error404 from "@/pages/Error/404";

export default function Router() {
    return (
        <Routes>
            {/* Guest-only routes — redirects to /dashboard if already logged in */}
            <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
            </Route>

            {/* Protected routes — redirects to / if not logged in */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/todos" element={<Todo />} />
                    <Route path="/posts" element={<Post />} />
                    <Route path="/users" element={<User />} />
                    <Route path="/generator" element={<CrudGenerator />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Error routes */}
            <Route path="/403" element={<Error403 />} />
            <Route path="*" element={<Error404 />} />
        </Routes>
    );
}
