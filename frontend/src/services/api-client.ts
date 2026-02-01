import axios from 'axios';

// Helder, mudei para export const apiClient para bater com o import do agent-api.ts
export const apiClient = axios.create({
  baseURL: 'http://76.13.101.17:4105/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
