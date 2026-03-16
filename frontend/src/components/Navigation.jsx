import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NavLink from "./NavLink";

export default function Navigation() {
    const location = useLocation();
    const { user, logout, requireAuth } = useAuth();

    useEffect(() => {
        requireAuth();
    }, [requireAuth]);

    const isActive = (...paths) => paths.includes(location.pathname);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    return (
        <>
            {/* Top Navbar */}
            <nav className="navbar navbar-expand-lg main-navbar">
                <Link to="/" className="navbar-brand sidebar-gone-hide">
                    REACT VITE + LARAVEL
                </Link>
                <div className="navbar-nav">
                    <a href="#" className="nav-link sidebar-gone-show" data-toggle="sidebar">
                        <i className="fas fa-bars"></i>
                    </a>
                </div>
                <form className="form-inline ml-auto"></form>
                <ul className="navbar-nav navbar-right">
                    <li className="dropdown">
                        <a href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user">
                            <div className="d-sm-none d-lg-inline-block">Hi, {user?.name}</div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <div className="dropdown-title">ROLE: {user?.role}</div>
                            <Link to="/profile" className="dropdown-item has-icon">
                                <i className="far fa-user"></i> Profile
                            </Link>
                            <div className="dropdown-divider"></div>
                            <a href="#" onClick={handleLogout} className="dropdown-item has-icon text-danger">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Secondary Sidebar Navbar */}
            <nav className="navbar navbar-secondary navbar-expand-lg">
                <div className="container">
                    <ul className="navbar-nav tw-mt-1">
                        <NavItem path="/dashboard" active={isActive("/dashboard")}>
                            <i className="far fa-home"></i>
                            <span>Dashboard</span>
                        </NavItem>
                        <li className={`nav-item dropdown ${isActive("/todos", "/posts", "/users", "/generator") ? "active" : ""}`}>
                            <a href="#" className="nav-link has-dropdown" data-toggle="dropdown">
                                <i className="fas fa-th-large"></i>
                                <span>Template Starter</span>
                            </a>
                            <ul className="dropdown-menu">
                                <NavItem path="/todos" active={isActive("/todos")}>
                                    Todos
                                </NavItem>
                                <NavItem path="/posts" active={isActive("/posts")}>
                                    Posts
                                </NavItem>
                                {user?.role === "ADMIN" && (
                                    <NavItem path="/users" active={isActive("/users")}>
                                        Users
                                    </NavItem>
                                )}
                                <NavItem path="/generator" active={isActive("/generator")}>
                                    Generator CRUD
                                </NavItem>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

/** Small helper for sidebar nav items */
function NavItem({ path, active, children }) {
    return (
        <li className={`nav-item ${active ? "active" : ""}`}>
            <NavLink href={path}>{children}</NavLink>
        </li>
    );
}
