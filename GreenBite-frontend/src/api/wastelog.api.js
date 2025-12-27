import api from "./axios";

export const getWasteLog = (params = {}) => {
  return api.get("/api/waste-log/", { params });
};

export const addWasteLog = (data) => {
  return api.post("/api/waste-log/", data);
};

export const updateWasteLog = ({ id, data }) => {
  return api.patch(`/api/waste-log/${id}/`, data);
};

export const deleteWasteLog = (id) => {
  return api.delete(`/api/waste-log/${id}/`);
};
