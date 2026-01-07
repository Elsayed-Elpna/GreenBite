import api from "@/api/axios";

export const getExpiringSoon = async () => {
  const response = await api.get("/api/food/expiry-soon/");
  return response.data;
};

export const getFoodLogSummary = async () => {
  const response = await api.get("/api/food/summary/");
  return response.data;
};

export const getFoodLogCategoryBreakdown = async () => {
  const response = await api.get("/api/food/category-breakdown/");
  return response.data;
};


export const createFoodSafetyScan = async (imageFile) => {
  const form = new FormData();
  form.append("image", imageFile);

  const res = await api.post("/api/food-safety/scan/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const getFoodSafetyScanStatus = async (jobId) => {
  const res = await api.get(`/api/food-safety/scan-status/${jobId}/`);
  return res.data;
};