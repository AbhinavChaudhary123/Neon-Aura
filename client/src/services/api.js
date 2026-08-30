import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://neon-aura-8nuc.onrender.com",
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("na_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export default api;
