import api from "@/api/axios";

export const createReport = (payload) =>
  api.post("/api/community/reports/", payload);

export const getReports = (params) =>
  api.get("/api/community/reports/", { params });

export const getReportDetails = (id) =>
  api.get(`/api/community/reports/${id}/`);

export const moderateReport = ({ reportId, data }) =>
  api.patch(`/api/community/reports/${reportId}/`, data);