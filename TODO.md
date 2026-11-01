## 🎯 Current Objective

بازطراحی صفحه مشاهده پروژه برای نمایش فرم‌های ثبت‌شده به‌صورت یکپارچه؛ امکان انتخاب و ترکیب چند فرم از رویدادهای پروژه و تهیه نسخه چاپی استاندارد A4.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`، شاخه کاری `feat/project-forms-combined-a4-print` بر پایه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- این فاز روی صفحه مشاهده پروژه، دریافت پاسخ فرم‌های ثبت‌شده و چاپ ترکیبی A4 متمرکز است.
- قابلیت اصلاح فرم‌های ثبت‌شده از فاز قبل موجود است؛ پاسخ نهایی فرم باید از منبع اصلی خوانده شود و رویدادهای اصلاحی نباید به‌عنوان فرم مستقل تکراری نمایش داده شوند، مگر پاسخ فرم مستقلی داشته باشند.
- هیچ merge یا انتشار تولیدی بدون اجازه صریح کاربر انجام نمی‌شود.

### وضع موجود کشف‌شده
- صفحه: `pages/project-detail.html`؛ ماژول: `js/modules/project-detail.js` و شیء `window.PMS.ProjectDetail`.
- `ProjectDetail.init()` صفحه را راه‌اندازی می‌کند؛ `load()` پروژه و بسته جزئیات را می‌گیرد؛ `applyEventDetailsBundle()` و `renderEvents()` خط زمانی رویدادها را نمایش می‌دهند.
- بخش‌های فعلی صفحه: مشخصات پروژه، «اطلاعات پرونده» به‌صورت اطلاعات مرکزی جداگانه، تصاویر شناسنامه دوخت/برش، آخرین رویدادها و تغییرات مدیریتی.
- اطلاعات مرکزی از `GET /projects/:projectId/information` در `loadProjectInformation(forceRefresh)` دریافت و در `renderProjectInformation()` نمایش داده می‌شود.
- بسته رویدادها از `GET /projects/:projectId/details` دریافت می‌شود؛ پاسخ آن شامل `events`, `eventData`, `eventFields` است.
- پاسخ فرم هر رویداد از endpoint موجود `GET /events/:eventId/forms` دریافت می‌شود.
- Backend در `Router.js` مسیر فوق را به `FormService.getEventResponses(eventId, params)` متصل و مجوز `EVENT_VIEW` را اعمال می‌کند.
- `FormRepository.js` پاسخ‌ها را در شیت `35_EventFormData` نگه می‌دارد؛ `ResponseJSON` و `DefinitionSnapshotJSON` داده و ساختار فرم در زمان ثبت را حفظ می‌کنند.
- `EventService.getProjectDetails(projectId, params)` رویدادهای پروژه را از `EventRepository.findByProjectId` می‌گیرد و پس از کنترل Tenant و دسترسی پروژه، داده‌های رویداد را غنی‌سازی می‌کند.
- پیوست‌های پاسخ فرم با شناسه پیوست نگهداری می‌شوند؛ دانلود کنترل‌شده از `GET /attachments/:attachmentId/download` با مجوز `ATTACHMENT_VIEW` انجام می‌شود.
- چاپ موجود: `Projects.printProject(projectId)` در `js/modules/projects.js` قالب فارسی/RTL و A4 مشخصات پروژه را دارد، اما فرم‌های reusable و ترکیب چند فرم را چاپ نمی‌کند.
- `js/core/api.js` لایه استاندارد درخواست و cache شامل `getCached`, `getFresh`, `extractData`, `invalidate`, `invalidateMany` است؛ `index.html` محل cache-busting assetهاست.

### فایل‌ها، توابع و APIهای درگیر

#### Frontend
- `pages/project-detail.html`: بازآرایی بخش اطلاعات پراکنده به نمای «فرم‌های پروژه»، فهرست فرم‌ها، انتخاب چندگانه و اقدام چاپ.
- `js/modules/project-detail.js`:
  - `init()`, `load()`, `applyEventDetailsBundle()`, `renderEvents()`: بارگذاری پروژه و رویدادها.
  - `loadProjectInformation()`, `renderProjectInformation()`: نمایش فعلی اطلاعات مرکزی به تفکیک نوع اطلاعات.
  - توابع جدید برای دریافت پاسخ فرم‌های رویدادها، نرمال‌سازی snapshot/response، رندر، انتخاب/لغو انتخاب و ساخت سند ترکیبی.
- `js/core/api.js`: استفاده از API و cache استاندارد و جلوگیری از درخواست‌های تکراری.
- `css/`: استایل نمای فرم‌ها و قواعد چاپ A4، تم‌ها و موبایل.
- `index.html`: cache-busting ماژول‌ها و stylesheetهای تغییرکرده.

#### Backend
- `Router.js`: مسیرهای موجود `GET /projects/:id/details` و `GET /events/:eventId/forms` با مجوز `EVENT_VIEW`.
- `EventService.js`: تابع `getProjectDetails(projectId, params)` با کنترل Tenant و دسترسی پروژه.
- `FormService.js`: تابع `getEventResponses(eventId, params)` برای پاسخ‌ها و snapshot فرم.
- `FormRepository.js`: تابع‌های `findResponsesByEvent(eventId)` و شیت `35_EventFormData`.
- `AttachmentService.js`: دانلود کنترل‌شده پیوست‌ها؛ هیچ فایل غیرمجاز نباید از مسیر چاپ قابل دسترسی شود.
- در ابتدا APIهای موجود استفاده شوند؛ endpoint تجمیعی فقط در صورت اثبات نیاز کارایی/امنیتی افزوده شود.

### قرارداد رفتاری و چاپ هدف
1. به‌جای نمایش جداگانه انواع اطلاعات مرکزی، فرم‌های ثبت‌شده پروژه به‌صورت یکپارچه و قابل مرور نمایش داده شوند؛ مشخصات پایه پروژه در سربرگ باقی بماند.
2. هر فرم با عنوان، رویداد ثبت‌کننده، تاریخ ثبت/آخرین اصلاح و وضعیت پاسخ قابل تشخیص باشد.
3. امکان انتخاب یک یا چند فرم، حتی از رویدادهای متفاوت، وجود داشته باشد؛ فرم‌های تکراری/اصلاح‌شده با هویت رویداد و نسخه نهایی پاسخ تفکیک شوند.
4. پاسخ بر اساس `DefinitionSnapshotJSON` زمان ثبت رندر شود تا تغییر طراحی بعدی فرم، داده قدیمی را جابه‌جا نکند؛ فیلدهای تکی، چندردیفی، فایل و تصویر حفظ شوند.
5. فرم‌های انتخابی در یک سند واحد، هرکدام در بخش مستقل با عنوان و اطلاعات رویداد قرار گیرند.
6. چاپ فارسی و RTL، اندازه A4 واقعی، حاشیه استاندارد، شکست صفحه کنترل‌شده، تکرار سرستون جدول و جلوگیری از شکستن عنوان/ردیف تا حد ممکن داشته باشد؛ مرورگر امکان چاپ و Save as PDF را فراهم کند.
7. سربرگ چاپ شامل مشخصات پروژه و تاریخ تهیه گزارش باشد؛ ترتیب پیش‌فرض فرم‌ها زمانی (قدیمی به جدید) باشد.
8. مجوزهای `EVENT_VIEW` و `ATTACHMENT_VIEW` و محدوده Tenant/Project رعایت شوند.
9. نمای انتخاب و مرور فرم‌ها در موبایل نیز بدون سرریز افقی کار کند.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف ساختار صفحه مشاهده پروژه، قرارداد دریافت رویدادها و پاسخ فرم‌ها، snapshot فرم و چاپ A4 موجود؛ تدوین نقشه فنی و رفتار نسخه ترکیبی.
  - *Log:* TODO و ARCHITECTURE فرانت‌اند و نقشه فنی بک‌اند بررسی شدند. فایل‌های `pages/project-detail.html`, `js/modules/project-detail.js`, `js/modules/events.js`, `js/core/api.js`, `Router.js`, `EventService.js`, `FormService.js`, `FormRepository.js` مرور شدند. `GET /projects/:id/details` بسته `events/eventData/eventFields` را می‌دهد و `GET /events/:eventId/forms` پاسخ و snapshot فرم را برمی‌گرداند. چاپ A4 مشخصات پروژه در `Projects.printProject(projectId)` موجود است اما فرم‌ها را ترکیب نمی‌کند. شاخه کاری از `main` ساخته شد؛ در تسک کشف کد اجرایی یا API تغییر نکرد.
- [ ] تسک ۲ — (IN PROGRESS) ساخت نمای یکپارچه فرم‌های پروژه: واکشی بهینه پاسخ فرم‌های رویدادهای پروژه، رندر بر اساس snapshot، نمایش عنوان/تاریخ/رویداد، حفظ فیلدهای تکی و چندردیفی و فایل/تصویر، و جایگزینی نمایش پراکنده اطلاعات به‌عنوان نمای اصلی؛ همراه تست رگرسیون.
  - *Log (2026-11-01 — پیاده‌سازی اولیه نمای فرم‌های پروژه):* در `js/modules/project-detail.js` دریافت پاسخ فرم‌های رویدادهای پروژه با endpoint موجود `GET /events/:eventId/forms` اضافه شد؛ درخواست‌ها در دسته‌های حداکثر ۵تایی اجرا می‌شوند و نتیجه‌ها با کنترل نسخه بارگذاری محافظت می‌شوند. پاسخ‌ها بر اساس `Definition` (snapshot ثبت‌شده) و `Values` رندر می‌شوند؛ فیلدهای تکی، جدول‌های چندردیفی، مقدارهای خالی و مشخصات فایل/تصویر نمایش داده می‌شوند. در `pages/project-detail.html` پنل «اطلاعات پرونده» از نمای اصلی برداشته و با «فرم‌های ثبت‌شده پروژه» جایگزین شد؛ APIها و توابع قدیمی ویرایش/تاریخچه حذف نشده‌اند تا قابلیت‌های موجود شکسته نشوند. cache-busting در `index.html` به `20261101-project-forms-view-1` تغییر کرد. تست‌های `tests/reusable-forms.test.js`, `tests/project-information-dossier.test.js`, `tests/project-draft-information-flow.test.js` با رفتار جدید همسو شدند. PR فرانت‌اند #131 ایجاد و از Draft خارج شد؛ merge و deploy انجام نشده است. در اولین اجرای CI سه assertion قدیمی که انتظار پنل قبلی/نسخه asset قبلی داشتند شکست خوردند؛ تست‌ها اصلاح شدند. اجرای مجدد روی آخرین commit `195adf194b8d590af43af7b0f5ee9b4ce69e2e43`، frontend-check موفق شده و cross-repository QA، دو agent review و browser audit هنوز در حال اجرا هستند. تست واقعی با داده‌های فرم پروژه و کنترل پیوست‌ها هنوز انجام نشده است.
- [ ] تسک ۳ — انتخاب و ترکیب چند فرم و تولید نسخه چاپی استاندارد A4: انتخاب چند فرم، پیش‌نمایش سند ترکیبی با سربرگ پروژه، ترتیب زمانی، صفحه‌بندی و چاپ/ذخیره PDF با CSS چاپی استاندارد و واکنش‌گرایی.
- [ ] تسک ۴ — آزمون و تثبیت: تست snapshot و پاسخ‌های قدیمی، فرم چندردیفی، پیوست‌ها و مجوز، چند فرم و شکست صفحات A4، موبایل، کارایی و CI؛ آماده‌سازی برای تست کاربر بدون merge/deploy.
