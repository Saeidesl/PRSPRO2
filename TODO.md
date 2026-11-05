## 🎯 Current Objective

اصلاح واردسازی فایل Word در قالب‌ساز مرکزی به‌گونه‌ای که صفحه‌بندی، اندازه صفحه، جدول‌بندی، عرض ستون‌ها، ارتفاع ردیف‌ها، حاشیه‌ها و جایگاه اجزای سند تا حد ممکن مطابق فایل اصلی حفظ شود و محتوای متنی پس از ورود همچنان در PMS قابل ویرایش باشد.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### Frontend
- Repository: `Saeidesl/PRSPRO2`, target branch: `main` (طبق درخواست صریح کاربر).
- `pages/print-designer.html`
  - کنترل واردسازی: `#pt-word-import` و `#pt-word-import-file`.
  - بوم: `#pt-design-canvas`.
- `js/modules/print-designer.js`
  - `initLibrary()`: اتصال ورودی فایل Word.
  - `importWordDocument(file)`: واردسازی فعلی با Mammoth؛ خروجی HTML معنایی را در یک المان `richtext` با اندازه ثابت 180×260mm قرار می‌دهد.
  - `sanitizeImportedHtml(html)`: پاک‌سازی HTML و محدودکردن تگ‌ها/استایل‌ها؛ در وضعیت فعلی بخش زیادی از ساختار صفحه و CSS مخصوص Word را حذف می‌کند.
  - `renderCanvas()`: نمایش المان richtext در بوم.
  - `renderOutputDocument()`: تولید محتوای خروجی چاپ.
  - `saveTemplate()` و `editTemplate()`: ذخیره/بازیابی Definition قالب از API مرکزی.
- `css/print-template-library.css`
  - استایل‌های `.pt-element-richtext`, `.pt-richtext-editor`, `.pt-output-richtext`.
- `index.html`
  - در حال حاضر Mammoth از CDN بارگذاری می‌شود؛ وابستگی فعلی باید پس از جایگزینی، با renderer صفحه‌بندی‌شده هماهنگ شود.
- `tests/project-print-designer.test.js` و `tests/print-template-library.test.js`: محل تست‌های رگرسیون واردسازی، ویرایش، ذخیره و چاپ.

### Backend / APIs
- قالب‌ها در مخزن `Saeidesl/PRSPRO2BACKEND` با سرویس `PrintTemplateService.js` و Repository `PrintTemplateRepository.js` نگهداری می‌شوند.
- APIهای موجود و بدون مسیر موازی:
  - `GET /print-templates`
  - `GET /print-templates/:templateId`
  - `POST /print-templates`
  - `PUT /print-templates/:templateId`
  - `POST /print-templates/:templateId/resolve` با payload فعلی `{ ProjectID }`.
- شیت `36_PrintTemplates` و ستون `DefinitionJSON`؛ اعتبارسنجی فعلی در `PrintTemplateValidator.js` سقف ۴۵۰۰۰ نویسه دارد.
- هر تغییر در ذخیره‌سازی فایل/رسانه باید با الگوی Repository/Service/Validator/Router، tenant isolation و مسیر فایل امن انجام شود؛ هیچ فایل Word حجیمی داخل سلول Sheets ذخیره نشود.

### یافته فنی کلیدی
- Mammoth برای استخراج ساختار معنایی Word طراحی شده و صفحه‌آرایی دقیق Word را بازسازی نمی‌کند؛ تبدیل فعلی تمام سند را به یک بلوک richtext تبدیل می‌کند و ساختار صفحه، ارتفاع‌ها و هندسه جدول را از دست می‌دهد.
- تصاویر کاربر نشان می‌دهند محتوا در بالای بوم فشرده/محدود شده و فضای خالی بزرگ باقی مانده است؛ این مشکل صرفاً با CSS جزئی قابل رفع نیست.
- هدف فنی: renderer مبتنی بر ساختار صفحه Word (به‌جای تبدیل معنایی Mammoth)، با حفظ ابعاد/بخش‌ها/جدول‌ها و امکان ویرایش متن در خود PMS. محدودیت‌های پشتیبانی‌شده باید شفاف و با نمونه‌های Word واقعی آزموده شوند؛ ادعای تطابق کامل با Microsoft Word بدون تست مجاز نیست.
- محتوای واردشده باید پس از ذخیره و بازگشایی همان چیدمان را نگه دارد و موتور چاپ فعلی نیز همان چیدمان را مصرف کند.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف علت به‌هم‌ریختگی و نقشه‌برداری مسیر Word Import**
  - *Log:* فایل‌های `TODO.md` و `ARCHITECTURE.md`، صفحه `pages/print-designer.html`، ماژول `js/modules/print-designer.js`، استایل `css/print-template-library.css`، بارگذاری وابستگی در `index.html` و تست‌های قالب‌ساز بررسی شدند. مشخص شد `importWordDocument()` از `mammoth.convertToHtml()` استفاده می‌کند و کل سند را به یک المان `richtext` با مختصات/ابعاد ثابت تبدیل می‌کند؛ `sanitizeImportedHtml()` نیز بسیاری از ویژگی‌های layout را حذف می‌کند. این روش ذاتاً صفحه‌آرایی Word را حفظ نمی‌کند و با تصاویر ارسالی کاربر هم‌خوان است.
- [ ] **تسک ۲ — جایگزینی موتور واردسازی با واردسازی صفحه‌محور و حفظ چیدمان**
  - **(IN PROGRESS)**
  - *Log:* در `js/modules/print-designer.js` موتور تک‌بلوک Mammoth با `docx-preview.renderAsync` جایگزین شد؛ خروجی Word به‌صورت صفحه‌های مستقل با ابعاد اصلی، شکست صفحه‌های ذخیره‌شده، هدر/فوتر، جدول‌ها و ستون‌ها ساخته می‌شود. `sanitizeImportedHtml()` برای حفظ کلاس‌ها، هندسه و ساختار جدول توسعه یافت و `sanitizeWordCss()` برای نگهداری امن استایل‌های مجاز اضافه شد. المان `worddocument` در `renderCanvas()` به‌صورت سند چندصفحه‌ای و قابل ویرایش نمایش داده می‌شود و `renderOutputDocument()` همان صفحه‌ها را برای چاپ استفاده می‌کند. `index.html` وابستگی JS/CSS موتور صفحه‌ای را بارگذاری می‌کند؛ `css/print-template-library.css` ظاهر صفحات در ویرایش/چاپ را تنظیم می‌کند. تست‌های `tests/print-template-library.test.js` و `tests/project-print-designer.test.js` با موتور جدید هماهنگ شدند. ذخیره‌سازی همچنان از API و شیت فعلی قالب‌ها استفاده می‌کند و برای Definition بیش از ۴۲هزار نویسه هشدار می‌دهد. تست مرورگر واقعی و تطابق نمونه Word هنوز انجام نشده است.
  - محدوده: جایگزینی تبدیل معنایی تک‌بلوک با renderer صفحه‌محور؛ حفظ A4/A5، جهت، حاشیه‌ها، ابعاد و مرز جدول‌ها، عرض ستون‌ها، ارتفاع ردیف‌ها و جایگاه متن/تصویر؛ حفظ امکان ویرایش متن در PMS؛ پاک‌سازی امن HTML/CSS؛ جلوگیری از تغییر چیدمان پس از ذخیره و بازگشایی؛ عدم ذخیره فایل حجیم در Sheets.
  - معیار پذیرش: فایل نمونه شناسنامه برش پارچه در بوم به‌صورت صفحه A4 کامل و بدون فشردگی/فضای خالی غیرمنتظره نمایش داده شود؛ متن و خانه‌های جدول قابل ویرایش باشند؛ پس از ذخیره و بازگشایی و در پیش‌نمایش چاپ، چیدمان حفظ شود.
- [ ] **تسک ۳ — آزمون رگرسیون و تأیید خروجی Word در مرورگر و چاپ**
  - *Log:* پس از اجرای تسک ۲ تکمیل می‌شود.
  - محدوده: تست ساختاری/اجرایی برای DOCXهای نمونه، ویرایش متن، ذخیره/بازگشایی، اندازه A4، چاپ/PDF و کنترل خطا برای فایل‌های پیچیده/بزرگ؛ اصلاح cache-busting و ثبت محدودیت‌های واقعی پشتیبانی.
  - معیار پذیرش: نمونه کاربر بدون به‌هم‌ریختگی در موبایل و دسکتاپ نمایش داده شود؛ چاپ یک صفحه A4 صحیح باشد؛ تست‌های مرتبط موفق باشند و کاربر خروجی را تأیید کند.
