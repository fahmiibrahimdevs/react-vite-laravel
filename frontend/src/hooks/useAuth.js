import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services/api";
import { setTokenWithExpiration, getTokenWithExpiration, removeToken } from "@/utils/session";
import { toast } from "@/utils/toast";
import { parseApiErrors } from "@/utils/validation";

/**
 * Hook to manage authentication state.
 * Provides user data, login, logout, and registration.
 */
export function useAuth() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = getTokenWithExpiration("token");

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["auth", "user"],
        queryFn: async () => {
            const { data } = await authApi.getUser();
            return data.data;
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: (response) => {
            const { accessToken } = response.data.data;
            setTokenWithExpiration("token", accessToken);
            toast.success("Login successfully");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Login failed", resData?.errors);
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data) => {
            // Transform frontend snake_case to backend camelCase
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                passwordConfirmation: data.password_confirmation,
            };
            return authApi.register(payload);
        },
        onSuccess: () => {
            toast.success("Registered successfully");
            setTimeout(() => navigate("/"), 1500);
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Registration failed", resData?.errors);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            removeToken("token");
            queryClient.clear();
            navigate("/");
        },
    });

    const requireAuth = useCallback(() => {
        if (!token) {
            navigate("/");
            return false;
        }
        return true;
    }, [token, navigate]);

    return {
        user,
        token,
        isLoading,
        isError,
        isAuthenticated: !!token,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        logout: logoutMutation.mutate,
        requireAuth,
    };
}
