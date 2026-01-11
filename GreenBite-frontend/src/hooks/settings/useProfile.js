import api from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET PROFILE (use the same endpoint you update)
export const getProfile = async () => {
  const res = await api.get("/api/profile/");
  return res.data;
};

// UPDATE PROFILE
const updateProfile = async (formData) => {
  const res = await api.patch("/api/profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      // update cache immediately (no delay) + force refetch
      queryClient.setQueryData(["profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    ...profileQuery,
    updateProfile: updateMutation,
  };
};
