declare global { interface Window { __FCV_CONFIG__?: { apiUrl?: string }; } }
export const environment = {
  apiUrl: window.__FCV_CONFIG__?.apiUrl ?? 'http://localhost:8080/api/v1'
};
