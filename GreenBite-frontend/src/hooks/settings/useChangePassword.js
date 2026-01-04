import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

const changePassword = async (data) => {
  return api.post("/auth/users/set_password/", data);
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
