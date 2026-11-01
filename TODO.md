## 🎯 Current Objective

ایجاد «قالب‌های چاپی نام‌دار و قابل استفاده مجدد»؛ قالب پس از ذخیره با نام دلخواه در همه پروژه‌ها در دسترس باشد. در «چاپ اسناد» کاربر کد پروژه و قالب را انتخاب کند و خروجی دقیقاً با همان چیدمان، فرم‌ها، اندازه‌ها، تصاویر و تنظیمات طراحی‌شده ساخته شود. اگر فرم انتخاب‌شده برای پروژه پاسخ ثبت‌شده ندارد، جای آن حفظ و پیام «اطلاعات وارد نشده» نمایش داده شود.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`
- Backend: `Saeidesl/PRSPRO2BACKEND`
- شاخه کاری هر دو مخزن: `feat/named-reusable-print-templates`؛ پایه `main`.
- آخرین merge مرتبط با چاپ‌ساز: PR #143، commit ادغام `7960ca069f0495d369e95ca5d6715ebb81d37ee4`.
- تغییرات این فاز باید در هر دو مخزن ثبت شوند؛ هیچ تغییری مستقیم روی `main` انجام نشود.

### یافته‌های کشف و وضعیت فعلی
- صفحه طراحی: `pages/print-designer.html`، صفحه خروجی: `pages/print-output.html`.
- منطق هر دو صفحه در `js/modules/project-detail.js` و شیء `ProjectDetail` است.
- `initPrintDesignerPage()` پروژه را می‌گیرد و با `loadStandalonePrintProject()` داده‌ها/فرم‌های ثبت‌شده را بارگذاری می‌کند؛ سپس `openPrintDesigner(true)` محیط ویرایش را باز می‌کند.
- `openPrintDesigner()` دکمه ذخیره را به `savePrintDesignerTemplate()` متصل می‌کند.
- مشکل بنیادی ذخیره فعلی: `savePrintDesignerTemplate()` فقط در localStorage و با کلید `pms-print-template-<projectId>` ذخیره می‌کند؛ بنابراین قالب نام‌دار، مشترک بین پروژه‌ها/کاربران و قابل انتخاب مستقل نیست.
- `loadPrintDesignerTemplate()` نیز فقط قالب همان پروژه را از localStorage می‌خواند.
- `initPrintOutputPage()` فعلاً فقط پروژه را انتخاب می‌کند و با `loadPrintDesignerTemplate()` قالب مخصوص همان پروژه را بارگذاری می‌کند؛ UI انتخاب قالب ندارد.
- المان‌های فرم فعلی به `sourceIndex` متکی‌اند؛ این index فقط در آرایه موقت `projectForms` معنا دارد و پس از انتخاب پروژه دیگر پایدار نیست. المان‌ها باید به شناسه پایدار فرم و شناسه فیلد متصل شوند و snapshot تعریف فرم برای نمایش حتی در نبود پاسخ پروژه حفظ شود.
- `loadStandalonePrintProject()` از `GET /projects/:id` و `GET /projects/:id/details` استفاده می‌کند. `applyEventDetailsBundle()` و `loadProjectForms()` پاسخ فرم رویدادها را از `GET /events/:eventId/forms` دریافت می‌کنند. هر پاسخ شامل `FormID`, `Values`, `Definition` و snapshot تعریف فرم است.
- فرم‌های طراحی فعلی از رویدادهای ثبت‌شده همان پروژه استخراج می‌شوند؛ پس از ذخیره قالب، snapshot تعریف هر فرم باید مستقل از پاسخ‌های پروژه باشد. هنگام چاپ، پاسخ‌های پروژه بر اساس FormID به المان‌های قالب متصل می‌شوند.
- رندر فعلی در `renderPrintDesignerElement(item)` برای فرم/فیلد از `sourceIndex` استفاده می‌کند و در نبود رکورد خالی برمی‌گرداند؛ باید به مدل پایدار فرم/فیلد تغییر کند و برای نبود پاسخ، ساختار فرم و تمام فیلدها با متن «اطلاعات وارد نشده» رندر شود.
- تصاویر پیوست با `prepareProjectFormImages()`, `loadPrintDesignerImages()` و `GET /attachments/:attachmentId/download` بارگذاری می‌شوند. شناسه پیوست در مقادیر فرم نگهداری می‌شود؛ تصویر فقط وقتی در پروژه انتخابی موجود است نمایش داده شود و در نبود مقدار، placeholder متناظر بیاید.
- قالب فعلی `version:1`, `orientation:'portrait'`, `elements` دارد و تنظیمات `style`, `innerLayout`, `tableLayout` باید عیناً حفظ شوند.
- CSS چاپ در `css/project-print-designer.css` و cache-busting منابع در `index.html` قرار دارد.

### Frontend — فایل‌ها و توابع
- `js/modules/project-detail.js`:
  - `initPrintDesignerPage()`, `loadStandalonePrintProject()`, `openPrintDesigner()`.
  - `bindPrintDesigner()`, `renderPrintDesigner()`, `renderPrintDesignerElement()`, `renderPrintDesignerTable()`, `renderPrintDesignerValue()`.
  - `savePrintDesignerTemplate()`, `loadPrintDesignerTemplate()`.
  - `initPrintOutputPage()`, `openPrintOutput()`, `getPrintOutputProjectId()`.
  - `loadProjectForms()`, `prepareProjectFormImages()`, `loadPrintDesignerImages()`.
- `pages/print-designer.html`: ورود به طراحی و انتخاب پروژه منبع برای مشاهده فرم‌های قابل افزودن.
- `pages/print-output.html`: افزودن انتخابگر قالب نام‌دار در کنار انتخاب پروژه/کد.
- `css/project-print-designer.css`: ظاهر حالت‌های پیش‌نمایش، placeholder فرم‌های بدون پاسخ و چاپ A4.
- `index.html`: cache-busting نسخه جدید ماژول و CSS.
- `tests/project-print-designer.test.js`: قراردادهای ذخیره نام‌دار، شناسه پایدار فرم، انتخاب قالب، placeholder و چاپ.
- `js/core/api.js`: استفاده از متدهای `get/getCached/post/put` موجود؛ قرارداد کش باید بعد از ذخیره/ویرایش invalidate شود.

### Backend — قرارداد ذخیره قالب
- `DatabaseSetup.js`: تعریف شیت افزایشی `36_PrintTemplates` با ستون‌های `ID,TenantID,Name,Version,TemplateJSON,Status,CreatedBy,CreatedAt,UpdatedBy,UpdatedAt`. سازوکار `setupDatabase()`, `createAllSheets_()`, `ensureHeaders_()` شیت را بدون حذف/جابجایی داده‌های موجود ایجاد می‌کند.
- `PrintTemplateRepository.js` (جدید): دسترسی tenant-scoped به شیت، فهرست، خواندن، درج و به‌روزرسانی.
- `PrintTemplateService.js` (جدید): اعتبارسنجی نام و payload، JSON نسخه‌دار، محدودیت حجم/تعداد المان، یکتایی نام در tenant، مالکیت tenant، و پاسخ استاندارد.
- `Router.js`:
  - `GET /print-templates`: فهرست قالب‌های فعال tenant.
  - `GET /print-templates/:templateId`: دریافت جزئیات قالب.
  - `POST /print-templates`: ذخیره قالب نام‌دار جدید.
  - `PUT /print-templates/:templateId`: ویرایش/به‌روزرسانی قالب موجود.
- مجوز خواندن با `PROJECT_VIEW` و ذخیره/ویرایش با `PROJECT_EDIT` یا `SYSTEM_SETTINGS` اعمال شود؛ همه عملیات tenant-scoped و اعتبارسنجی سمت سرور باشند.
- `FormService.getEventResponses(eventId, params)` مرجع پاسخ رویدادها و snapshot فرم است؛ مسیرهای فرم فعلی حفظ شوند.
- هیچ endpoint یا داده فرم/رویداد فعلی شکسته یا بازنویسی نشود.

### جریان داده هدف
1. در طراحی، المان فرم به `FormID` و المان فیلد به `FormID + FieldID/InformationTypeID` متصل می‌شود؛ snapshot کامل Definition شامل ترتیب، نام، نوع داده، ستون‌ها و Cardinality داخل TemplateJSON ذخیره می‌شود.
2. با ذخیره، نام قالب و ساختار نسخه‌دار شامل عناصر و تمام تنظیمات ظاهری به API ارسال و در شیت مستقل ذخیره می‌شود؛ دیگر وابسته به localStorage یا شناسه پروژه منبع نیست.
3. در چاپ، کاربر پروژه/کد و قالب را انتخاب می‌کند. فرانت‌اند اطلاعات پروژه و پاسخ‌های ثبت‌شده را می‌گیرد و پاسخ‌ها را بر اساس FormID/InformationTypeID به snapshot قالب نگاشت می‌کند.
4. اگر یک فرم/فیلد در پروژه پاسخ ندارد، تعریف و جایگاه آن از snapshot قالب رندر می‌شود و به‌جای حذف/خالی شدن، «اطلاعات وارد نشده» نمایش داده می‌شود.
5. مقادیر چندردیفی، جدول‌ها، تصاویر و چیدمان `innerLayout/tableLayout` دقیقاً با تنظیمات ذخیره‌شده حفظ می‌شوند. اطلاعات پروژه دیگر نباید در طراحی به‌عنوان منبع ثابت ذخیره شود؛ عناصر پویا هنگام خروجی با پروژه انتخابی جایگزین می‌شوند.

### قراردادهای ایمنی و سازگاری
- TenantID فقط از کاربر احراز هویت‌شده سمت سرور گرفته شود؛ هرگز به ورودی کلاینت اعتماد نشود.
- JSON ورودی validate شود؛ فقط نوع‌ها و ویژگی‌های مجاز عناصر قالب ذخیره شوند و محتوای HTML دلخواه اجرا نشود.
- قالب‌ها مستقل از پروژه و در دسترس پروژه‌های همان tenant باشند.
- snapshot فرم برای حفظ ظاهر است؛ مقادیر چاپ همیشه از پروژه انتخابی خوانده شوند، نه از پروژه‌ای که قالب ابتدا در آن طراحی شده است.
- اگر پاسخ فرم وجود ندارد، نمایش فرم خالی با placeholder الزامی است؛ اگر تعریف snapshot ناقص باشد، خطای روشن داده شود و فرم بی‌صدا حذف نشود.
- قالب‌های localStorage نسخه ۱ پاک یا دستکاری نشوند؛ در صورت امکان مسیر قدیمی فقط برای سازگاری باقی بماند.
- خروجی چاپ A4، PDF، RTL، تم و تصاویر فعلی حفظ شود.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف معماری ذخیره قالب، داده‌های فرم و مسیر خروجی چاپ.
  - *Log:* `TODO.md` و `ARCHITECTURE.md` فرانت‌اند و بک‌اند، و فایل‌های `js/modules/project-detail.js`, `pages/print-designer.html`, `pages/print-output.html`, `css/project-print-designer.css`, `tests/project-print-designer.test.js`, `DatabaseSetup.js`, `Router.js`, `FormService.js`, `FormRepository.js` بررسی شدند. ذخیره فعلی فقط localStorage و کلید پروژه‌محور است؛ عناصر فرم به sourceIndex موقت وابسته‌اند؛ خروجی فقط همان قالب محلی پروژه را می‌خواند و renderer در نبود پاسخ فرم محتوایی نمایش نمی‌دهد. قراردادهای پاسخ فرم شامل FormID، Values و Definition snapshot است. شاخه `feat/named-reusable-print-templates` در هر دو مخزن از main ساخته شد.
- [ ] تسک ۲ — پیاده‌سازی ذخیره‌سازی مرکزی قالب‌های نام‌دار و اتصال پایدار فرم‌ها: شیت و API امن tenant-scoped، ذخیره/ویرایش قالب با نام، snapshot تعریف فرم و حفظ کامل تنظیمات ظاهری.
- [ ] تسک ۳ — تکمیل تجربه چاپ اسناد: انتخاب پروژه/کد و قالب نام‌دار، نگاشت داده‌های پروژه انتخابی به فرم‌های قالب، نمایش فرم‌های ثبت‌نشده با پیام «اطلاعات وارد نشده» و حفظ دقیق چیدمان A4/تصاویر/جداول.
- [ ] تسک ۴ — آزمون رگرسیون و یکپارچگی: آزمون‌های بک‌اند و فرانت‌اند برای tenant isolation، نام تکراری، قالب چندپروژه‌ای، فرم ناقص/ثبت‌نشده، مقادیر چندردیفی، تصاویر و حفظ تنظیمات چاپ؛ بررسی CI و آماده‌سازی PRها.
