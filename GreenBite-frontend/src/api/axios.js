import axios from "axios";
import { getTokens } from "../utils/tokenStorage";
import { refreshToken, logout } from "@/services/authService";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();

    if (accessToken) {
      // for handel the undefined case if happen
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return Promise.resolve(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQue = [];

const processQue = (error, token = null) => {
  failedQue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQue = [];
};

api.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  async (error) => {
    const orgRequest = error.config;
    if (error.response?.status === 401 && !orgRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQue.push({ resolve, reject });
        })
          .then((token) => {
            orgRequest.headers.Authorization = "Bearer " + token;
            return api(orgRequest);
          })
          .catch(Promise.reject);
      }
      orgRequest._retry = true;
      isRefreshing = true;
      try {
        const newAccess = await refreshToken();
        processQue(null, newAccess);
        orgRequest.headers.Authorization = "Bearer " + newAccess;
        return api(orgRequest);
      } catch (err) {
        processQue(err, null);
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
