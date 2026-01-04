import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

const deleteAccount = async (password) => {
  return api.delete("/auth/users/me/", {
    data: { current_password: password },
  });
};

export const useDeleteAccount = (options = {}) => {
  return useMutation({
    mutationFn: deleteAccount,
    ...options,
  });
};
