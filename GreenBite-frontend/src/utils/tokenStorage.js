export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const getTokens = () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
