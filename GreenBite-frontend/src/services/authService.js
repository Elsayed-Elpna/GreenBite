import api from "../api/axios";
import { saveTokens, getTokens, clearTokens } from "../utils/tokenStorage";

export const login = async (credentials) => {
  const response = await api.post("/auth/jwt/create/", credentials);
  const { access, refresh } = response.data;
  saveTokens(access, refresh);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/users/me/");
  return response.data;
};

export const refreshToken = async () => {
  const { refreshToken } = getTokens();
  const response = await api.post("/auth/jwt/refresh/", {
    refresh: refreshToken,
  });
  const { access, refresh } = response.data;
  saveTokens(access, refresh);

  return access;
};

export const logout = () => {
  clearTokens();
};
