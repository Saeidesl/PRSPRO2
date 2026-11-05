## 🎯 Current Objective

افزودن قابلیت واردسازی قالب‌های DOCX ساخته‌شده در Microsoft Word به قالب‌ساز مرکزی PMS، تبدیل آن‌ها به سند قابل ویرایش داخل برنامه، اتصال جایگاه‌های داده به اطلاعات مرکزی و پاسخ فرم‌ها و حفظ خروجی استاندارد نمایش/چاپ؛ بدون ایجاد فرم‌ساز یا مسیر چاپ موازی. ویرایش متن، جدول، تصویر، فونت، رنگ، تراز و چیدمان پس از ورود فایل باید در خود PMS ممکن باشد.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### 1. مخازن و شاخه اجرایی

- فرانت‌اند: `Saeidesl/PRSPRO2`
- بک‌اند: `Saeidesl/PRSPRO2BACKEND`
- شاخه مجاز این فاز: `feature/design-case-preproduction`؛ هرگز روی `main` تغییر ایجاد نشود.
- این فاز ادامه قالب‌ساز مرکزی موجود است؛ مسیر و API موازی برای فرم یا چاپ ایجاد نشود.

### 2. معماری موجود فرانت‌اند

- `pages/print-designer.html`: صفحه کتابخانه قالب‌ها و محیط طراحی؛ بوم فعلی `#pt-design-canvas`، پنل ویژگی‌ها `#pt-inspector-fields`، فهرست لایه‌ها `#pt-layer-list` و فرم ذخیره `#pt-template-form`.
- `js/modules/print-designer.js`:
  - `PrintDesigner.init()`, `initLibrary()`, `loadLibrary()`: راه‌اندازی کتابخانه و دریافت قالب‌ها/منابع.
  - `blankDefinition()`: ساخت تعریف قالب فعلی با `schemaVersion:1,page,elements,bindings`.
  - `bindEditor()`, `createElement()`, `handleEditorAction()`, `renderCanvas()`, `renderInspector()`, `renderLayers()`: ایجاد و نمایش المان‌ها و ویرایش بوم.
  - `applyInspectorChange()`, `commitHistory()`, `restoreHistory()`, `undo()`, `redo()`: ویرایش مشخصات و تاریخچه.
  - `addBinding()`, `renderSources()`, `renderBindings()`: اتصال منابع پایدار داده.
  - `editTemplate()`, `saveTemplate()`: بازیابی و ذخیره قالب از API مرکزی.
  - `initOutput()`, `resolveOutput()`, `printOutput()`: تولید خروجی قالب برای پروژه.
- `css/print-template-library.css`: استایل کتابخانه، بوم، پنل‌ها، صفحه و خروجی چاپ.
- `pages/print-output.html`: انتخاب قالب/پروژه و پیش‌نمایش خروجی.
- `js/core/api.js`: تنها مسیر مجاز درخواست‌های فرانت‌اند.
- `js/core/router.js`: routeهای `print-designer` و `print-output` به `PrintDesigner` متصل هستند.
- `index.html`: محل بارگذاری اسکریپت‌ها و CSS؛ نسخه cache-busting پس از تغییر به‌روزرسانی شود.
- آزمون‌های فرانت‌اند: `tests/print-template-library.test.js` و `tests/project-print-designer.test.js`.

### 3. معماری موجود بک‌اند و قرارداد ذخیره‌سازی

- `PRSPRO2BACKEND/PrintTemplateValidator.js`: اعتبارسنجی Definition قالب؛ ساختار فعلی شامل `schemaVersion`, `page`, `elements`, `bindings` است و سقف فعلی JSON برابر ۴۵۰۰۰ نویسه است.
- `PRSPRO2BACKEND/PrintTemplateService.js`: توابع `list`, `get`, `sources`, `create`, `update`, `deactivate`, `resolve`؛ قالب‌ها tenant-scoped هستند.
- `PRSPRO2BACKEND/PrintTemplateRepository.js`: ذخیره قالب در شیت `36_PrintTemplates`.
- `PRSPRO2BACKEND/Router.js`: APIهای فعلی:
  - `GET /print-templates`
  - `GET /print-templates/sources`
  - `GET /print-templates/:templateId`
  - `POST /print-templates`
  - `PUT /print-templates/:templateId`
  - `DELETE /print-templates/:templateId`
  - `POST /print-templates/:templateId/resolve` با payload شامل `ProjectID`.
- منابع اتصال موجود: مشخصات پروژه، اطلاعات مرکزی از `ProjectInformationService)، پاسخ snapshot فرم از `FormService) و فایل‌ها/تصاویر از مسیرهای امن پیوست.
- تست بک‌اند: `PRSPRO2BACKEND/tests/print-templates.test.js`.
- قالب عمومی نباید داده واقعی پروژه را در خود نگه دارد؛ فقط تعریف سند و شناسه bindingها ذخیره شود و مقادیر هنگام resolve خروجی بازیابی شوند.
- پیش از انتخاب محل ذخیره HTML و تصاویر واردشده، محدودیت ۴۵۰۰۰ نویسه و قرارداد فعلی پیوست‌ها بررسی شود؛ فایل‌های باینری یا HTML حجیم نباید بدون کنترل حجم داخل یک سلول Google Sheets قرار گیرند.

### 4. قرارداد قابلیت Word Import

- ورودی اصلی: فایل `.docx`؛ فایل‌های قدیمی `.doc` در صورت نیاز باید ابتدا در Word به DOCX تبدیل شوند.
- مسیر کاربر: انتخاب/بارگذاری DOCX در همان صفحه قالب‌ساز → استخراج ساختار و رسانه‌ها → نمایش در محیط ویرایش PMS → اتصال نشانه‌های داده → ذخیره در همان کتابخانه قالب.
- محتوای واردشده باید در PMS قابل ویرایش باشد؛ حداقل متن و پاراگراف، تیترها، جدول و سلول‌ها، تصویر، فونت/اندازه، رنگ، تراز، راست‌چین، فاصله و حاشیه‌های پایه.
- جایگاه‌های داده با نشانه‌های صریح مانند `{{PROJECT_CODE}}` یا انتخاب متن و اتصال از پنل منابع قابل تبدیل به binding پایدار شوند؛ عنوان نمایشی binding نباید شناسه منبع باشد.
- جدول‌های تکرارشونده باید بتوانند از داده‌های چندردیفی اطلاعات مرکزی/فرم تغذیه شوند.
- پس از ویرایش، ذخیره، بازکردن مجدد، پیش‌نمایش، چاپ A4 و PDF باید از همان Definition و همان موتور خروجی قالب‌ساز استفاده کنند.
- تبدیل Word به ساختار قابل ویرایش باید به‌صورت کنترل‌شده و امن انجام شود؛ HTML/استایل/URLهای واردشده sanitize شوند و فایل‌های رسانه‌ای با دسترسی tenant ذخیره شوند.
- محدودیت‌های Word مانند SmartArt، اشکال شناور پیچیده و Text Boxهای تو در تو باید شناسایی شوند و در صورت عدم پشتیبانی، هشدار روشن داده شود؛ نباید ادعای حفظ صددرصدی تمام قابلیت‌های Word شود.

### 5. تصمیم‌های معماری و معیار پذیرش

- قابلیت واردسازی و ویرایش داخل PMS بخشی از همان قالب‌ساز مرکزی است؛ سیستم موازی ساخته نشود.
- مدل سند واردشده باید نسخه‌دار و قابل توسعه باشد و با قالب‌های ساخته‌شده فعلی سازگار بماند.
- تعریف قالب از داده‌های پروژه مستقل بماند؛ داده فقط در زمان خروجی resolve شود.
- فایل اصلی DOCX در صورت نگهداری، به‌عنوان منبع/نسخه مرجع باشد؛ سند قابل ویرایش PMS و دارایی‌های تصویری آن نیز باید قابل بازیابی باشند.
- آزمون‌های رگرسیون برای قالب‌های قدیمی، واردسازی DOCX، حفظ متن/جدول/تصویر، ویرایش و ذخیره مجدد، binding، چندردیفی و چاپ چندصفحه‌ای لازم است.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف معماری قالب‌ساز، قراردادهای ذخیره‌سازی و تعیین محدوده واردسازی Word**
  - *Log:* بررسی `TODO.md`، `ARCHITECTURE.md`، شاخه `feature/design-case-preproduction` و فایل‌های `pages/print-designer.html`، `js/modules/print-designer.js`، `css/print-template-library.css`، `js/core/router.js`، `index.html`، `PrintTemplateValidator.js`، `PrintTemplateService.js`، `PrintTemplateRepository.js` و تست‌های قالب‌ساز انجام شد. مسیر API و منابع داده فعلی ثبت شد. محدودیت ۴۵۰۰۰ نویسه Definition و نیاز به ذخیره امن رسانه‌ها مشخص شد. تصمیم محصول: سند پس از واردسازی باید داخل PMS قابل ویرایش باشد.
- [ ] **تسک ۲ — واردسازی DOCX و تبدیل به سند ساختاریافته قابل ویرایش داخل PMS (IN PROGRESS)**
  - *Log:* هنوز اجرا نشده است.
- [ ] **تسک ۳ — اتصال جایگاه‌های داده، ذخیره امن رسانه‌ها، سازگاری خروجی/چاپ و آزمون کامل**
  - *Log:* پس از تکمیل تسک ۲ اجرا می‌شود.
