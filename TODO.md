## 🎯 Current Objective

تفکیک کامل «طراحی قالب» از «چاپ اسناد» در PMS؛ حفظ قالب‌های چاپ فعلی و فراهم‌کردن مسیر مستقل برای طراحی، مدیریت و استفاده از قالب‌ها و مسیر مستقل برای انتخاب و چاپ اسناد. پس از ادغام، نسخه برای آزمون کلی آماده شود.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`؛ شاخه مرجع `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`؛ این تفکیک در محدوده فعلی فرانت‌اند است و تا وقتی نیاز واقعی کشف نشود تغییری در بک‌اند لازم نیست.
- شاخه اجرایی این فاز: `feat/separate-print-design-and-output` بر پایه `main`.
- شاخه `main` دست‌نخورده می‌ماند تا PR آماده و ادغام شود.

### وضعیت موجود کشف‌شده
- منوی اصلی در `js/components/layout.js` تعریف می‌شود؛ در حال حاضر فقط یک گزینه با route برابر `print-designer` و عنوان «چاپ‌ساز» دارد.
- مسیرها و مجوزها در `js/core/router.js` تعریف شده‌اند؛ route فعلی `print-designer` به `pages/print-designer.html` و ماژول `ProjectDetail` متصل است و مجوز `PROJECT_VIEW` دارد.
- صفحه `pages/print-designer.html` فقط انتخاب پروژه و دکمه ورود به محیط طراحی را دارد.
- `js/modules/project-detail.js` شامل `initPrintDesignerPage()`, `loadStandalonePrintProject()`, `openPrintDesigner()`, `bindPrintDesigner()`, `renderPrintDesigner()`, `loadPrintDesignerTemplate()` و `savePrintDesignerTemplate()` است.
- محیط طراحی فعلی در `openPrintDesigner()` به‌صورت پویا ساخته می‌شود و در همان toolbar هم «ذخیره قالب» و هم «چاپ / PDF» وجود دارد؛ بنابراین طراحی و خروجی چاپ هنوز در یک محیط قرار دارند.
- قالب‌ها در localStorage با کلید `pms-print-template-` به‌همراه شناسه پروژه و ساختار `version: 1` و `elements` ذخیره می‌شوند. تنظیمات تصویر در `innerLayout` و تنظیمات جدول در `tableLayout` نگهداری می‌شوند؛ سازگاری این ساختار باید حفظ شود.
- CSS محیط در `css/project-print-designer.css` است و فایل‌های JS/CSS از `index.html` بارگذاری می‌شوند.
- این تفکیک باید بدون تغییر داده‌های رویداد/فرم و بدون ایجاد مسیر موازی برای ثبت پروژه یا رویداد انجام شود.

### فایل‌ها، توابع و APIهای درگیر

#### Frontend
- `js/components/layout.js`
  - `navItems`: افزودن دو مقصد مستقل «طراحی قالب» و «چاپ اسناد» به منوی برنامه.
- `js/core/router.js`
  - `pages`, `routePermissions`, نگاشت route به ماژول: تعریف مسیرهای مستقل و حفظ دسترسی مناسب.
- `pages/print-designer.html`
  - صفحه مستقل مدیریت/ورود به طراحی قالب.
- صفحه جدید چاپ اسناد (مسیر و نام فایل در پیاده‌سازی نهایی تثبیت شود).
  - انتخاب پروژه، مشاهده قالب‌های ذخیره‌شده و اجرای خروجی چاپ/PDF.
- `js/modules/project-detail.js`
  - `initPrintDesignerPage()`, `loadStandalonePrintProject()`, `openPrintDesigner()`: جداسازی حالت طراحی از حالت خروجی.
  - `loadPrintDesignerTemplate()`, `savePrintDesignerTemplate()`: حفظ ذخیره و بازیابی قالب‌های فعلی.
  - روال رندر و چاپ: استفاده از همان داده و قالب موجود بدون دست‌کاری snapshot فرم.
- `css/project-print-designer.css`: ظاهر مجزای صفحات طراحی و چاپ و حذف کنترل‌های طراحی از خروجی نهایی.
- `index.html`: بارگذاری صفحه/ماژول/استایل و cache-busting.
- تست‌های موجود چاپ‌ساز در پوشه `tests/`؛ تست‌های مسیر، قالب و خروجی باید به‌روزرسانی شوند.

#### Backend و API
- داده پروژه از `GET /projects` و `GET /projects/:projectId` دریافت می‌شود.
- فرم‌های ثبت‌شده از `GET /events/:eventId/forms` و تصاویر از `GET /attachments/:attachmentId/download` خوانده می‌شوند.
- تغییر API یا دیتابیس در محدوده فعلی پیش‌بینی نشده است.

### قرارداد رفتاری فاز
1. در منوی برنامه دو بخش مستقل و واضح وجود داشته باشد: «طراحی قالب» و «چاپ اسناد».
2. بخش طراحی فقط برای ساخت، ویرایش، مرتب‌سازی، تنظیم و ذخیره قالب باشد؛ عملیات چاپ مستقیم از محیط طراحی حذف یا به مسیر چاپ منتقل شود.
3. بخش چاپ اسناد برای انتخاب پروژه و قالب ذخیره‌شده و مشاهده پیش‌نمایش نهایی و چاپ/PDF باشد؛ کنترل‌های ویرایش در آن نمایش داده نشوند.
4. قالب‌های فعلی و کلیدهای ذخیره‌سازی نسخه ۱ بدون حذف یا مهاجرت از دست نروند؛ مسیرهای قدیمی در صورت نیاز با هدایت سازگار پشتیبانی شوند.
5. چاپ/PDF باید دقیقاً از همان تنظیمات تصویر، جدول، ستون و ترتیب ذخیره‌شده استفاده کند.
6. مجوزهای مسیریابی و نمایش منو همسو باشند؛ مسیر جدید نباید دسترسی فراتر از مجوز مشاهده پروژه بدهد.
7. طراحی واکنش‌گرا و سازگار با موبایل/تم فعلی باقی بماند.
8. هیچ تغییر عملیاتی در داده فرم‌ها، رویدادها، پروژه‌ها یا پیوست‌ها انجام نشود.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف معماری فعلی و تعیین مسیر جداسازی طراحی قالب از چاپ اسناد.
  - *Log:* `TODO.md` و `ARCHITECTURE.md` از `main` خوانده شدند. فایل‌های `js/components/layout.js`, `js/core/router.js`, `pages/print-designer.html`, `js/modules/project-detail.js`, `css/project-print-designer.css` و `index.html` بررسی شدند. مشخص شد منو فقط route «چاپ‌ساز» دارد، route به `ProjectDetail` متصل است، محیط طراحی در `openPrintDesigner()` به‌صورت پویا ساخته می‌شود و دکمه ذخیره قالب و چاپ/PDF در یک toolbar قرار دارند. قالب‌ها در localStorage با کلید `pms-print-template-<projectId>` و ساختار نسخه ۱ ذخیره می‌شوند. این فاز فقط به فرانت‌اند نیاز دارد. شاخه `feat/separate-print-design-and-output` از `main` ایجاد شد.
- [ ] تسک ۲ — پیاده‌سازی کامل دو بخش مستقل «طراحی قالب» و «چاپ اسناد»، حفظ سازگاری قالب‌های فعلی، افزودن پیش‌نمایش/انتخاب قالب در بخش چاپ، تست‌های رگرسیون و آماده‌سازی PR برای ادغام در `main`. (IN PROGRESS)
  - *Log:* در انتظار پیاده‌سازی یکپارچه فرانت‌اند، تست و بازبینی PR.
