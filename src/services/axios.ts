// src/api/axios.ts
import axios from "axios";
import { store } from "../store";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  // baseURL: "https://api.royafi.com/api/",
});

api.interceptors.request.use((config) => {
  const token = store.getState().user.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
