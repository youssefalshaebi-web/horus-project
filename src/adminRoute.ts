/**
 * مسار سري للوحة المالك (SPA). لا يوجد رابط له في واجهة المتجر — يُفتح يدوياً فقط.
 * التطبيق يستخدم HashRouter؛ العناوين تظهر مثل /#/medyar-gate/login (لا حاجة لملف redirects على Netlify).
 */
export const ADMIN_PANEL_BASE_PATH = '/medyar-gate'
export const ADMIN_PANEL_LOGIN_PATH = `${ADMIN_PANEL_BASE_PATH}/login`
