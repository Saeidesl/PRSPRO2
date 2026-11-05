## 🎯 Current Objective

رفع ایرادهای دریافت اطلاعات در صفحه طراحی قالب و آماده‌سازی کامل مسیر واردسازی DOCX؛ سپس اجرای آزمون‌های ساختاری و تحویل برای تست واقعی واردسازی Word.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### Frontend — مخزن `Saeidesl/PRSPRO2`، شاخه `main`
- `pages/print-designer.html`
  - کنترل واردسازی: `#pt-word-import` و `#pt-word-import-file`.
  - نمایش وضعیت: `#pt-library-status` و `#pt-editor-status`.
  - فهرست منابع: `#pt-source-list` و `#pt-editor-source-list`.
  - بوم: `#pt-design-canvas`.
- `js/modules/print-designer.js`
  - `init()`: انتخاب مسیر طراحی/خروجی.
  - `initLibrary()`: اتصال کنترل‌ها و شروع بارگذاری داده‌ها.
  - `loadLibrary()`: دریافت هم‌زمان قالب‌ها و منابع.
  - `renderSources()`: نمایش فیلدهای پروژه، اطلاعات مرکزی و فیلدهای فرم.
  - `extract()` و `list()`: استخراج پاسخ API.
  - `importWordDocument(file)`: تبدیل DOCX با `window.docx.renderAsync`.
  - `sanitizeImportedHtml()` و `sanitizeWordCss()`: پاک‌سازی خروجی Word.
  - `renderCanvas()` و `renderOutputDocument()`: نمایش و چاپ.
  - `saveTemplate()` و `editTemplate()`: ذخیره و بازیابی قالب.
- `js/core/api.js`
  - `PMS.Api.get()` و `PMS.Api.extractData()`: درخواست و استخراج پاسخ استاندارد `{success:true,data:...}`.
- `js/core/router.js`
  - مسیرهای `print-design` و `print-designer` به `PrintDesigner`؛ مجوز صفحه `SYSTEM_SETTINGS`.
- `index.html`
  - بارگذاری `docx-preview@0.3.6` و CSS آن؛ cache-busting فایل‌های قالب‌ساز.
- `css/print-template-library.css`
  - استایل بوم، منابع، صفحات Word و خروجی چاپ.
- تست‌ها: `tests/print-template-library.test.js` و `tests/project-print-designer.test.js`.

### Backend — مخزن `Saeidesl/PRSPRO2BACKEND`، شاخه `main`
- `Router.js`: مسیرهای `GET /print-templates` و `GET /print-templates/sources`؛ مسیر منابع در حال حاضر مجوز `SYSTEM_SETTINGS` دارد.
- `PrintTemplateService.js`
  - `list(params)`: قالب‌های فعال tenant.
  - `sources(params)`: `projectFields`، `informationTypes` و `forms` همراه `Fields`.
  - پاسخ منابع: `Response.success({projectFields, informationTypes, forms})`.
- `PrintTemplateRepository.js`: خواندن و نوشتن شیت `36_PrintTemplates`.
- `PrintTemplateValidator.js`: اعتبارسنجی Definition؛ سقف ۴۵۰۰۰ نویسه.
- APIهای CRUD و resolve فعلی حفظ می‌شوند؛ هیچ مسیر ذخیره‌سازی موازی ایجاد نشود.

### یافته‌های کشف
- علت ریشه‌ای توقف هر دو صفحه شناسایی شد: سه عبارت منظم در `js/modules/print-designer.js` با escape اضافی نوشته شده بودند و کل فایل در مرورگر SyntaxError می‌داد؛ بنابراین `PMS.Modules.PrintDesigner` اصلاً ثبت نمی‌شد و نه بارگذاری اطلاعات و نه دکمه «قالب جدید» اجرا نمی‌شد. اصلاح نحو انجام شد و آزمون parse برای جلوگیری از بازگشت اضافه شد. همچنین تشخیص initializer بر اساس عناصر واقعی صفحه و بارگذاری مستقل قالب‌ها/پروژه‌ها اعمال شد.
- مسیر دریافت منابع در فرانت‌اند و بک‌اند وجود دارد و نام کلیدهای اصلی در حالت عادی هم‌خوان است؛ خطای هر درخواست باید مستقل، واضح و قابل تشخیص نمایش داده شود و پاسخ‌های خالی با خطا اشتباه نشوند.
- مسیر منابع بک‌اند فقط `SYSTEM_SETTINGS` می‌پذیرد؛ مجوز صفحه نیز همین است. این قرارداد باید یکپارچه و قابل مشاهده باقی بماند.
- ورودی فایل مخفی است و دکمه فقط `input.click()` را اجرا می‌کند؛ برای سازگاری موبایل/مرورگر باید انتخاب فایل با تعامل مستقیم کاربر و fallback امن انجام شود.
- در `index.html` خط متصل‌کننده CSS قالب‌ساز شامل نویسه‌های لفظی `\\n` است؛ باید به newline واقعی تبدیل شود.
- واردسازی فعلی به A4 عمودی به‌صورت پیش‌فرض محدود شده و تشخیص تعداد صفحه/حفظ مشخصات بخش‌ها باید از ساختار واقعی خروجی DOCX استخراج شود؛ ابعاد و جهت سند نباید بدون دلیل بازنویسی شوند.
- علت خطای واردسازی `Cannot read properties of undefined (reading 'loadAsync')` مشخص شد: `docx-preview` برای بازکردن فایل DOCX به JSZip نیاز دارد اما فایل `jszip.min.js` در صفحه بارگذاری نشده بود. JSZip نسخه 3.10.1 پیش از `docx-preview` به `index.html` اضافه شد و آزمون ترتیب بارگذاری وابستگی ثبت شد.
- محدودیت واقعی حفظ Word تابع امکانات `docx-preview` است؛ تست واقعی مرورگر و فایل DOCX همچنان معیار نهایی است.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف مسیر دریافت اطلاعات و واردسازی Word**
  - *Log:* `TODO.md`، `ARCHITECTURE.md`، `pages/print-designer.html`، `js/modules/print-designer.js`، `js/core/api.js`، `js/core/router.js`، `index.html`، `css/print-template-library.css` و تست‌های فرانت‌اند بررسی شدند. مسیرهای بک‌اند در `Router.js` و `PrintTemplateService.js` و قرارداد پاسخ `Response.success` تأیید شد. نقاط نیازمند اصلاح: گزارش خطای مستقل و نرمال‌سازی داده منابع، انتخاب فایل در موبایل، پاک‌سازی نویسه‌های لفظی newline و حفظ تنظیمات صفحه Word.
- [ ] **تسک ۲ — رفع دریافت اطلاعات و پایدارسازی واردسازی DOCX (IN PROGRESS)**
  - محدوده: اصلاح چرخه بارگذاری و استخراج پاسخ؛ نمایش وضعیت مستقل قالب‌ها و منابع؛ حفظ خطای واقعی مجوز/سرور؛ سازگاری شکل پاسخ و فهرست فیلدها؛ فعال‌سازی مطمئن انتخاب فایل؛ حفظ ابعاد/جهت/تعداد صفحات و CSS مجاز سند؛ به‌روزرسانی cache-busting؛ عدم تغییر API و ساختار ذخیره‌سازی مرکزی.
  - معیار پذیرش: صفحه منابع را با وضعیت درست نمایش دهد؛ خطای یک endpoint باعث پنهان شدن نتیجه endpoint دیگر نشود؛ دکمه Word پنجره انتخاب فایل را باز کند؛ DOCX معتبر به بوم منتقل شود و متن/جدول‌ها قابل مشاهده و ویرایش باشند.
- [ ] **تسک ۳ — آزمون رگرسیون و تحویل برای تست واقعی Word**
  - محدوده: اجرای تست‌های Node موجود، افزودن تست‌های لازم برای دریافت منابع و کنترل انتخاب فایل، بررسی syntax و سازگاری route/asset؛ کنترل diff و commit روی `main`.
  - معیار پذیرش: تست‌های خودکار مرتبط موفق باشند و کاربر بتواند یک فایل DOCX واقعی را وارد کند، پیش‌نمایش بگیرد و نتیجه را گزارش کند.
