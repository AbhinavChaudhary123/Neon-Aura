import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("na_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export default api;
