## 🎯 Current Objective

ساخت چاپ‌ساز دیداری و قابل تنظیم برای پروژه‌ها؛ انتخاب اطلاعات و فرم‌ها، افزودن و جابه‌جایی المان‌ها، تنظیم ظاهر و ذخیره قالب‌های چاپ A4.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`، تغییرات تسک ۲ در شاخه `main` ادغام شده‌اند؛ PR #131 با روش squash ادغام شد.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- این فاز روی صفحه مشاهده پروژه و محیط طراحی سند چاپی با انتخاب محتوا، چیدمان دیداری، استایل‌دهی و چاپ A4 متمرکز است.
- شاخه اجرایی: `feat/visual-print-layout-designer` بر پایه `main`.
- قابلیت اصلاح فرم‌های ثبت‌شده از فاز قبل موجود است؛ پاسخ نهایی فرم باید از منبع اصلی خوانده شود و رویدادهای اصلاحی نباید به‌عنوان فرم مستقل تکراری نمایش داده شوند، مگر پاسخ فرم مستقلی داشته باشند.
- PR #131 با اجازه صریح کاربر ادغام شد؛ commit ادغام: `c114629edc3b05569caea91a8dd52df23a7e7fc3`.

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
- `pages/project-detail.html`: نمای فرم‌های پروژه؛ چاپ‌ساز از این صفحه جدا شده است.
- `pages/print-designer.html` (جدید): صفحه مستقل انتخاب پروژه و شروع طراحی چاپ.
- `pages/project-print-designer.html` (جدید): محیط انتخاب محتوا، ابزارهای طراحی، بوم A4 و پیش‌نمایش.
- `js/modules/project-detail.js`: بارگذاری پروژه/فرم‌ها و توابع مشترک چاپ‌ساز؛ `initPrintDesignerPage()`, `loadStandalonePrintProject()`, `openPrintDesigner()`.
- `js/components/layout.js`: افزودن گزینه «چاپ‌ساز» به سایدبار با مجوز `PROJECT_VIEW`.
- `js/core/router.js`: ثبت route `print-designer`، صفحه و مجوز مشاهده پروژه.
- `js/modules/project-print-designer.js` (جدید): انتخاب محتوا، افزودن/حذف/تکثیر/جابجایی المان‌ها، تنظیم ظاهر، ذخیره قالب و چاپ.
- `css/project-print-designer.css` (جدید): محیط طراحی، بوم A4، واکنش‌گرایی و قواعد چاپ.
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

### قرارداد رفتاری چاپ‌ساز
1. چاپ‌ساز یک بخش مستقل در سایدبار و یک صفحه مجزا باشد؛ کاربر ابتدا پروژه را انتخاب کند و سپس محیط طراحی را باز کند.
2. پنل محتوا شامل مشخصات پایه پروژه، فیلدهای مشخصات، فرم‌های ثبت‌شده و اطلاعات رویدادها باشد؛ هر مورد جداگانه قابل افزودن باشد.
3. هر جزء روی بوم A4 المانی مستقل باشد؛ جابه‌جایی drag-and-drop، تغییر ترتیب، حذف، تکثیر و تنظیم اندازه/عرض فراهم شود.
4. پنل ظاهر برای عنوان، متن، کادر/ضخامت/رنگ حاشیه، پس‌زمینه، فاصله داخلی، تراز و اندازه قلم فراهم شود؛ افزودن متن آزاد و جداکننده نیز ممکن باشد.
5. امکان افزودن چند فرم از رویدادهای متفاوت و انتخاب فیلدهای مشخصات پروژه وجود داشته باشد؛ پاسخ‌ها بر اساس snapshot زمان ثبت رندر شوند.
6. پیش‌نمایش زنده A4 فارسی/RTL، جهت صفحه، حاشیه و صفحه‌شکنی داشته باشد؛ چاپ و Save as PDF از مرورگر انجام شود.
7. قالب طراحی برای کاربر ذخیره و بارگذاری شود و داده عملیاتی را تغییر ندهد.
8. مجوزهای `EVENT_VIEW` و `ATTACHMENT_VIEW` رعایت شوند؛ محتوای چاپ امن و escape شده باشد.
9. محیط طراحی در موبایل بدون سرریز و با پنل‌های عمودی قابل استفاده باشد.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف ساختار صفحه مشاهده پروژه، قرارداد دریافت رویدادها و پاسخ فرم‌ها، snapshot فرم و چاپ A4 موجود؛ تدوین نقشه فنی و رفتار نسخه ترکیبی.
  - *Log:* TODO و ARCHITECTURE فرانت‌اند و نقشه فنی بک‌اند بررسی شدند. فایل‌های `pages/project-detail.html`, `js/modules/project-detail.js`, `js/modules/events.js`, `js/core/api.js`, `Router.js`, `EventService.js`, `FormService.js`, `FormRepository.js` مرور شدند. `GET /projects/:id/details` بسته `events/eventData/eventFields` را می‌دهد و `GET /events/:eventId/forms` پاسخ و snapshot فرم را برمی‌گرداند. چاپ A4 مشخصات پروژه در `Projects.printProject(projectId)` موجود است اما فرم‌ها را ترکیب نمی‌کند. شاخه کاری از `main` ساخته شد؛ در تسک کشف کد اجرایی یا API تغییر نکرد.
- [x] تسک ۲ — ساخت نمای یکپارچه فرم‌های پروژه: واکشی بهینه پاسخ فرم‌های رویدادهای پروژه، رندر بر اساس snapshot، نمایش عنوان/تاریخ/رویداد، حفظ فیلدهای تکی و چندردیفی و فایل/تصویر، و جایگزینی نمایش پراکنده اطلاعات به‌عنوان نمای اصلی؛ همراه تست رگرسیون.
  - *Log (2026-11-01 — پیاده‌سازی اولیه نمای فرم‌های پروژه):* در `js/modules/project-detail.js` دریافت پاسخ فرم‌های رویدادهای پروژه با endpoint موجود `GET /events/:eventId/forms` اضافه شد؛ درخواست‌ها در دسته‌های حداکثر ۵تایی اجرا می‌شوند و نتیجه‌ها با کنترل نسخه بارگذاری محافظت می‌شوند. پاسخ‌ها بر اساس `Definition` (snapshot ثبت‌شده) و `Values` رندر می‌شوند؛ فیلدهای تکی، جدول‌های چندردیفی، مقدارهای خالی و مشخصات فایل/تصویر نمایش داده می‌شوند. در `pages/project-detail.html` پنل «اطلاعات پرونده» از نمای اصلی برداشته و با «فرم‌های ثبت‌شده پروژه» جایگزین شد؛ APIها و توابع قدیمی ویرایش/تاریخچه حذف نشده‌اند تا قابلیت‌های موجود شکسته نشوند. cache-busting در `index.html` به `20261101-project-forms-view-1` تغییر کرد. تست‌های `tests/reusable-forms.test.js`, `tests/project-information-dossier.test.js`, `tests/project-draft-information-flow.test.js` با رفتار جدید همسو شدند. PR فرانت‌اند #131 پس از سبز شدن تمام ۶ بررسی CI روی commit نهایی `734869b76ff5babe6366df417594d32226134a48` با روش squash ادغام شد؛ commit ادغام `c114629edc3b05569caea91a8dd52df23a7e7fc3` است. پس از ادغام، کاربر نمایش فرم‌های ثبت‌شده را در برنامه بررسی و موفقیت آن را تأیید کرد. اجرای workflowهای پس از ادغام برای commit اصلی هنگام ثبت این Log در صف شروع بود؛ وضعیت انتشار نهایی باید جداگانه بررسی شود.
- [ ] تسک ۳ — (IN PROGRESS) تکمیل چاپ‌ساز دیداری مستقل: انتخاب پروژه از صفحه جداگانه سایدبار، انتخاب مشخصات و فرم‌ها، افزودن و جابه‌جایی المان‌ها، تنظیم ظاهر و کادر، بوم زنده A4، ذخیره/بارگذاری قالب و چاپ/PDF.
- [ ] تسک ۴ — آزمون و تثبیت: تست drag-and-drop، انتخاب محتوا، ذخیره قالب، snapshot و فرم چندردیفی، پیوست و مجوزها، صفحه‌بندی A4، موبایل، کارایی و CI؛ آماده‌سازی برای تست کاربر بدون merge/deploy.
