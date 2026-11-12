import axios from 'axios';

type TokenProvider = () => string | null;

let getToken: TokenProvider = () => null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const setApiTokenProvider = (tokenProvider: TokenProvider) => {
  getToken = tokenProvider;
};

export default api;
