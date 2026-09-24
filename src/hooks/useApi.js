import { useAuth } from '../auth/AuthContext';

const API_BASE = '/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = isJson ? data?.error || data : `HTTP ${response.status}`;
    throw new Error(error);
  }

  return data;
}

export function useApi() {
  const { isAuthenticated } = useAuth();

  const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = { ...options, headers };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    return handleResponse(response);
  };

  const get = (endpoint, options) => request(endpoint, { ...options, method: 'GET' });
  const post = (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body });
  const put = (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body });
  const del = (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' });

  const sendEmail = async (payload) => {
    return post('/send-email', payload);
  };

  return {
    get,
    post,
    put,
    delete: del,
    request,
    sendEmail,
    isAuthenticated,
  };
}