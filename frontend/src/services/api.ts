import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3333",
  withCredentials: true,
});

// Interceptor para deslogar usuário quando o token expirar
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado - redireciona para login
      // Os cookies serão limpos automaticamente pelo backend
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
