import axios from "axios";

const TOKEN_KEY = "hisaab_token";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a 401 comes back, clear the stale token
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const ordersAPI = {
  getAll: () => API.get("/orders"),
  getById: (id) => API.get(`/orders/${id}`),
  getByToken: (token) => API.get(`/orders/share/${token}`),   // public — no auth needed, but interceptor won't break it
  create: (data) => API.post("/orders", data),
  update: (id, data) => API.put(`/orders/${id}`, data),
  delete: (id) => API.delete(`/orders/${id}`),
  markPayment: (orderId, personId, data) =>
    API.patch(`/orders/${orderId}/person/${personId}/payment`, data),
  getQR: (id, baseUrl) =>
    API.get(`/orders/${id}/qr`, { params: { baseUrl } }),
};

export default API;
