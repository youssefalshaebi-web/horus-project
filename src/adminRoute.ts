/**
 * مسار سري للوحة المالك (SPA). لا يوجد رابط له في واجهة المتجر — يُفتح يدوياً فقط.
 * لاستضافة Netlify: يبقى `public/_redirects` مع `/* /index.html 200` لنسخه إلى جذر `dist`.
 */
export const ADMIN_PANEL_BASE_PATH = '/medyar-gate'
export const ADMIN_PANEL_LOGIN_PATH = `${ADMIN_PANEL_BASE_PATH}/login`
