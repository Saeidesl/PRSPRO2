# معماری فرانت‌اند PMS

> پایگاه دانش پایدار معماری و قابلیت‌های تکمیل‌شده در مخزن `Saeidesl/PRSPRO2`. این سند فقط آنچه را از نقشه فنی، تغییرات ثبت‌شده و تأییدهای کاربر قابل پشتیبانی است مستند می‌کند؛ وجود Log به‌تنهایی معادل تست خودکار end-to-end نیست.

## 2026-10-28 — منوی عملیات کارت پروژه، پیوست‌های تصویری و خروجی پروژه

### محدوده و وضعیت

- مخزن: `Saeidesl/PRSPRO2`، شاخه `main`.
- مخزن بک‌اند مرتبط: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- وضعیت: ۱۱ تسک فاز تکمیل و در `TODO1.md` علامت‌گذاری شده‌اند؛ کاربر در نسخه آزمایشی نبود خطا را تأیید کرده است.
- محدودیت اعتبارسنجی: بررسی نحوی/ایستای کد و آزمون کاربر ثبت شده‌اند؛ تست مستقل خودکار end-to-end و تمام حالت‌های منفی API در این محیط اجرا نشده‌اند.

### نقشه معماری و فایل‌های مرتبط

#### کارت‌های پروژه و داشبورد

- `js/modules/projects.js`
  - `Projects.init()`: راه‌اندازی ماژول، کنترل مجوزهای مشاهده/ایجاد و بارگذاری داده‌ها.
  - `Projects.render()`: رندر کارت‌های پروژه و اتصال عملیات.
  - `Projects.openProjectEditForm(projectId, options)`: دریافت تازه پروژه از `GET /projects/:id` و بازکردن فرم ویرایش یا حالت تنظیمات‌محور.
  - `Projects.openCreateForm(project, options)`: فرم ایجاد/ویرایش؛ حالت `settingsOnly` پنجره تنظیمات پروژه ذخیره‌شده را مستقیم نمایش می‌دهد.
  - `shareProject(projectId)`: ساخت متن اشتراک‌گذاری شامل کد، عنوان، وضعیت، مرحله، تعداد و لینک؛ استفاده از Web Share API و fallback کپی.
  - `printProject(projectId)`: ساخت پنجره چاپ مستقل فارسی/RTL با قالب A4 و امکان چاپ یا Save as PDF.
  - رویداد سفارشی `pms:project-menu-action` عملیات منو را به `material-specs`, `color-size`, `settings`, `share` و `print` متصل می‌کند.
- `js/modules/dashboard-redesign.js`
  - `Dashboard.renderProjectCard(project)`, `Dashboard.bindEvents()`: رندر کارت داشبورد و اتصال منوی عملیات؛ قرارداد منو با صفحه پروژه‌ها همسان نگه داشته شده است.
- `js/modules/material-planning.js`
  - تابع `open(projectId)` از طریق `window.PMS.MaterialPlanning.open` منتشر شده و از منوی کارت قابل استفاده است؛ جریان موجود API/فرم حفظ می‌شود.
- `index.html`, `pages/dashboard.html`
  - نسخه‌گذاری cache-busting برای تازه‌سازی ماژول‌های منو، عملیات، تنظیمات، اشتراک‌گذاری و چاپ اضافه/به‌روزرسانی شده است. کلیدهای ثبت‌شده در Logها: `20261028-project-menu-4`, `20261028-project-actions-1`, `20261028-project-settings-4`, `20261028-project-share-1`, `20261028-project-print-1`.

#### پیوست‌ها و تصاویر پروژه

- `js/modules/project-images.js`: بارگذاری/فهرست تصاویر و تفکیک بر اساس نوع پیوست.
- `js/modules/projects.js`: انتخاب تصویر کارت فقط از نوع `PROFILE` و نگاشت سازگار داده‌های تصویری قدیمی فاقد نوع به تصویر پروفایل.
- `pages/project-detail.html`: دو بخش مستقل `project-detail-sewing-passport` و `project-detail-cutting-passport`.
- `js/modules/project-detail.js`: توابع `loadProjectPassportImages(forceRefresh)`, `previewProjectPassportImage(attachmentId, label)`, `bindProjectPassportImageEvents()`, `ensureProjectPassportStyles()` برای تفکیک، نمایش، پیش‌نمایش و حالت‌های بارگذاری/خالی/خطا.
- فایل‌های بک‌اند مرتبط در `Saeidesl/PRSPRO2BACKEND`:
  - `Router.js`: مسیرهای API پیوست و کنترل مجوزهای مسیر.
  - `AttachmentService.js`: `listProjectImages`, `upload`, `listByEntity`, `download`, `delete` و کنترل‌های tenant/دسترسی پروژه.
  - `AttachmentRepository.js`: مخزن شیت `15_Attachments` و عملیات خواندن/نوشتن.
  - `AttachmentValidator.js`: اعتبارسنجی نوع‌های مجاز.
  - `DatabaseSetup.js`: تعریف سرستون‌های `ATTACHMENTS`، شامل `AttachmentType` پس از `Status`.
- مقادیر قراردادی `AttachmentType`:
  - `PROFILE`: تصویر کارت پروژه.
  - `SEWING_PASSPORT`: شناسنامه دوخت؛ نمایش در جزئیات پروژه.
  - `CUTTING_PASSPORT`: شناسنامه برش؛ نمایش در جزئیات پروژه.
- APIهای مرتبط:
  - `GET /projects/:projectId`
  - `GET /projects/:projectId/attachments`
  - `POST /projects/:projectId/attachments`
  - `GET /project-card-images`
  - `GET /attachments/:attachmentId/download`
  - `GET /attachments/:attachmentId`
  - `DELETE /attachments/:attachmentId?reason=...`
- قرارداد بارگذاری موجود شامل `FileName`, `MimeType`, `Base64` است و `AttachmentType` برای طبقه‌بندی افزوده شده. فهرست تصاویر کارت باید فقط `PROFILE` و تصاویر legacy سازگار را ارائه کند؛ شناسنامه‌ها نباید به‌عنوان عکس کارت انتخاب شوند.

#### API و دسترسی فرانت‌اند

- `js/core/api.js`: لایه درخواست‌های API شامل `request`, `get`, `post`, `put`, `delete`, `getCached`, `getFresh`, `extractData`, `invalidate`, `invalidateMany`. برای درخواست‌های فرانت‌اند از این لایه استفاده شود تا مدیریت توکن/خطا و کش حفظ شود.
- `js/core/router.js`: مسیریابی و بررسی دسترسی، شامل `loadPage()`, `initPageModule()`, `navigate()`, `hasRouteAccess()`, `getUser()`, `isAdmin()`.
- منوی فرانت‌اند جایگزین کنترل مجوز بک‌اند نیست؛ مجوزهای پیوست و پروژه باید در API نیز اعمال شوند.

### رفتارهای محصول ثبت‌شده

1. منوی سه‌نقطه در کارت پروژه‌ها و داشبورد هشت گزینه فارسی دارد: عکس پروفایل، شناسنامه دوخت، شناسنامه برش، مصرف ملزومات، رنگ‌بندی و سایزبندی، اشتراک‌گذاری، ذخیره و چاپ، تنظیمات.
2. منو از صفحه‌کلید پشتیبانی می‌کند، با Escape/کلیک بیرون بسته می‌شود، وضعیت ARIA را به‌روز می‌کند و برای کمبود فضای پایین کارت بازشدن رو به بالا را پشتیبانی می‌کند.
3. عملیات مصرف ملزومات و رنگ‌بندی/سایزبندی به منو منتقل شده‌اند و فرم‌ها/منطق قبلی حفظ شده‌اند.
4. تنظیمات پروژه ذخیره‌شده از تنظیمات پیش‌فرض کاربر برای ایجاد پروژه تفکیک شده‌اند.
5. اشتراک‌گذاری از Web Share API استفاده می‌کند و fallback کپی دارد؛ لغو اشتراک‌گذاری (`AbortError`) به‌عنوان خطای عمومی برنامه گزارش نمی‌شود.
6. چاپ با قالب RTL و A4 در پنجره مستقل ارائه می‌شود و امکان چاپ یا ذخیره PDF از مرورگر دارد.
7. تصاویر پروفایل و شناسنامه دوخت/برش در مسیرهای جداگانه مصرف می‌شوند.

### Implementation Logs — خلاصه سوابق تسک‌های ۱ تا ۱۱

- تسک ۱ — بررسی ساختار: فقط `TODO1.md` ایجاد شد و نقشه فایل‌ها، توابع، APIها، مجوزها و وابستگی‌های فرانت‌اند/بک‌اند ثبت شد؛ فایل اصلی کد تغییر نکرد.
- تسک ۲ — قرارداد پیوست و منو: قرارداد `PROFILE`, `SEWING_PASSPORT`, `CUTTING_PASSPORT` و رفتار سازگار با تصاویر legacy ثبت شد؛ فایل‌های کد تغییر نکردند.
- تسک ۳ — UI منو: در `js/modules/projects.js` و `js/modules/dashboard-redesign.js` منوی هشت‌گزینه‌ای، صفحه‌کلید، Escape/کلیک بیرون، ARIA و رفتار واکنش‌گرا پیاده شد؛ cache-busting در `index.html` و `pages/dashboard.html` به‌روز شد. کاربر نمایش منو را تأیید کرد.
- تسک ۴ — اتصال عملیات: دکمه‌های جداگانه مصرف ملزومات/رنگ‌بندی از کارت حذف و رویداد `pms:project-menu-action` متصل شد؛ `window.PMS.MaterialPlanning.open` منتشر شد. کاربر هر دو عملیات را تأیید کرد.
- تسک ۵ — تصاویر: `js/modules/project-images.js` افزوده شد؛ `AttachmentValidator.js`, `AttachmentService.js` و `DatabaseSetup.js` برای نوع پیوست به‌روز شدند؛ `AttachmentType` در سرستون‌ها تعریف شد. کاربر اضافه‌کردن ستون و رفع اختلاط تصاویر را تأیید کرد.
- تسک ۶ — شناسنامه‌ها در جزئیات: دو بخش مستقل در `pages/project-detail.html` و توابع بارگذاری/پیش‌نمایش/استایل در `js/modules/project-detail.js` افزوده شد. کاربر نمایش تصاویر را تأیید کرد.
- تسک ۷ — تنظیمات پروژه: `openProjectEditForm(projectId, options)` و حالت `settingsOnly` در `js/modules/projects.js` تنظیمات پروژه ذخیره‌شده را مستقیم باز می‌کند و تنظیمات پیش‌فرض کاربر را جدا نگه می‌دارد. کاربر عملکرد را تأیید کرد.
- تسک ۸ — اشتراک‌گذاری: `shareProject(projectId)` در `js/modules/projects.js` اضافه شد؛ Web Share API و fallback کپی و مدیریت لغو عملیات پیاده شد. کاربر عملکرد را تأیید کرد.
- تسک ۹ — چاپ: `printProject(projectId)` در `js/modules/projects.js` قالب مستقل RTL/A4، جدول مشخصات و چاپ/Save as PDF را اضافه کرد. بررسی نحوی موفق و عملکرد توسط کاربر تأیید شد.
- تسک ۱۰ — آزمون و اصلاح: نحو ۹ فایل JS بررسی‌شده بدون خطا بود؛ بررسی ایستا وجود عملیات چاپ، نوع پیوست، جداسازی تصاویر، مجوز endpoint و cache-busting را تأیید کرد. کاربر گفت در نسخه آزمایشی خطایی مشاهده نکرده است. تست مستقل end-to-end و تمام حالت‌های منفی API اجرا نشدند.
- تسک ۱۱ — جمع‌بندی نهایی: سوابق commitهای چاپ/اشتراک‌گذاری و cache-busting مرور شد؛ تغییرات چاپ در `js/modules/projects.js`, `index.html` و `pages/dashboard.html` محدود بودند و در commitهای بررسی‌شده حذف فایل اصلی یا تغییر بک‌اند مشاهده نشد.

### Commitهای کلیدی ثبت‌شده

- چاپ A4/PDF: https://github.com/Saeidesl/PRSPRO2/commit/eed8d9a57ce9a7bd6b93e5bbd5c5b95a60137e79
- cache-busting index برای چاپ: https://github.com/Saeidesl/PRSPRO2/commit/2269f00029946239339a57eda9a95aa98c084d9a
- cache-busting داشبورد برای چاپ: https://github.com/Saeidesl/PRSPRO2/commit/4b54b1f9caa069e80f4ac046c4682e0fadb4e13e
- اشتراک‌گذاری: https://github.com/Saeidesl/PRSPRO2/commit/1c2e4c24f7eb55783a8f579da375f857cf8c68d3
- cache-busting index برای اشتراک‌گذاری: https://github.com/Saeidesl/PRSPRO2/commit/bd2cb956ba134a9fbf6b7f542df34085aa6dbd06
- cache-busting داشبورد برای اشتراک‌گذاری: https://github.com/Saeidesl/PRSPRO2/commit/ba9682fb699c182c42876b45c7a4121631540d0d
- ثبت تسک‌های ۹ تا ۱۱ در TODO1: https://github.com/Saeidesl/PRSPRO2/commit/cfb1cf7e254f1e680a1a86f9a89a3824706b2d24
- آخرین ثبت TODO1: https://github.com/Saeidesl/PRSPRO2/commit/d8bce660b012ab839cb07d6a0e227ef9f5a6ad09

## 2026-10-31 — نوع داده تصویر و فایل در اطلاعات پویا

### نقشه فرانت‌اند

- `js/modules/information-types.js`: نوع‌های `image` و `file` در تعریف اطلاعات مرکزی و تعریف/ویرایش ستون‌های جدولی ارائه می‌شوند.
- `js/modules/project-detail.js`: `informationInput`, `uploadInformationFile`, `renderInformationValue`, `openInformationAttachment` برای انتخاب فایل، پیش‌نمایش محلی تصویر، ارسال فایل به API پیوست پروژه، نمایش نام و دریافت/پیش‌نمایش فایل استفاده می‌شوند.
- `js/modules/events.js`: `createFieldInput`, `addConfiguredFormRow`, `collectConfiguredFormResponses`, `uploadConfiguredFormFile` انواع تصویر/فایل را در فرم‌های متصل به رویداد پشتیبانی می‌کنند. فایل قبل از ثبت رویداد به پروژه انتخاب‌شده متصل می‌شود و فقط metadata مرجع در `FormResponses` ارسال می‌شود.
- `index.html`: نسخه cache-busting ماژول‌های `information-types.js`, `project-detail.js`, `events.js` با کلید `20261031-information-files-1` برای `information-types.js` و `project-detail.js` و `20261031-information-files-2` برای `events.js` به‌روز شده است.

### قرارداد و محدودیت‌ها

- فرانت‌اند از `POST /projects/:projectId/attachments` با `AttachmentType=INFORMATION` استفاده می‌کند؛ Base64 فقط در زمان انتقال است و فایل در Google Drive ذخیره می‌شود.
- سقف انتخاب فایل در رابط با سقف سمت سرور همسان است: ۱۰ مگابایت. پسوند و MIME باید با هم سازگار باشند؛ تصویر فقط JPEG/PNG/WebP/GIF است و فایل می‌تواند تصویر، PDF، Word یا Excel باشد.
- مقادیر ذخیره‌شده در اطلاعات پروژه یا پاسخ فرم فقط `AttachmentID`, `FileName`, `MimeType`, `FileSize`, `AttachmentType` را نگه می‌دارند. دانلود و پیش‌نمایش از API کنترل‌شده `/attachments/:id/download` عبور می‌کند.
- فایل‌های فرم پروژه به شناسه پروژه متصل می‌شوند؛ ثبت فرم دارای فایل در رویداد مستقل پشتیبانی نمی‌شود.
- آزمون‌های رگرسیون فرانت‌اند در `tests/information-file-types.test.js` و بک‌اند در `tests/information-file-types.test.js` اضافه شده‌اند. آزمون عملی کاربر هنوز برای این تسک لازم است.
