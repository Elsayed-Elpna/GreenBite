import api from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET PROFILE

export const getProfile = async () => {
  const res = await api.get("/auth/users/me/");
  return res.data;
};

// UPDATE PROFILE
const updateProfile = async (formData) => {
  const res = await api.patch("/api/profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// HOOK

export const useProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });

  return {
    ...profileQuery,
    updateProfile: updateMutation,
  };
};
