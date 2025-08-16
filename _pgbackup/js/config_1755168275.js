/* ============== config.js ==============
 * Global config for the console
 * ENV: 'mock' to use local mock data, 'live' to call your backend API
 * API_BASE_URL: only used when ENV === 'live'
 * =======================================
*/
window.APP_CONFIG = {
  ENV: 'mock',            // 'mock' | 'live'
  API_BASE_URL: '',       // e.g. 'https://api.datatech.cloud/v1'
  BRAND_FALLBACK: {
    name: 'Loyalty Console',
    logo: 'images/DataTech.png'
  }
};
