import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/services/api";
import { toast } from "@/utils/toast";
import { parseApiErrors } from "@/utils/validation";

const PROFILE_KEY = "profile";

export function useProfile() {
    return useQuery({
        queryKey: [PROFILE_KEY],
        queryFn: async () => {
            const { data } = await profileApi.get();
            return data.data;
        },
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => profileApi.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
            toast.success("Profile updated successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}

export function useUpdatePassword() {
    return useMutation({
        mutationFn: (data) => {
            // Transform frontend snake_case to backend camelCase
            const payload = {
                currentPassword: data.current_password,
                newPassword: data.password,
                passwordConfirmation: data.password_confirmation,
            };
            return profileApi.updatePassword(payload);
        },
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
        onError: (error) => {
            const resData = error.response?.data;
            toast.validationError(resData?.message || "Something went wrong.", resData?.errors);
        },
    });
}
