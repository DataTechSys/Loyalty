/* js/config.js
   Global config. Adjust ENV and API_BASE_URL for your backend.
*/
(function (global) {
  const APP_CONFIG = {
    ENV:        'mock',                          // 'mock' or 'live'
    API_BASE_URL: 'https://api.example.com',     // used when ENV === 'live'
    // optional: how long a login lasts (seconds)
    SESSION_TTL_SEC: 60 * 60 * 8, // 8 hours
  };
  global.APP_CONFIG = APP_CONFIG;
})(window);
