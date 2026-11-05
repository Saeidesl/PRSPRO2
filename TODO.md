## 🎯 Current Objective

بازطراحی محیط داخلی قالب‌ساز به یک ویرایشگر حرفه‌ای، ساده و فارسی شبیه Word؛ با حفظ قالب‌های فعلی، منابع اطلاعاتی، ذخیره‌سازی موجود و خروجی دقیق چاپ A4. واردسازی Word به‌طور کامل لغو شده و دیگر بخشی از محصول نیست.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### Frontend — مخزن `Saeidesl/PRSPRO2`، شاخه `feature/wordless-word-like-form-designer`

- `pages/print-designer.html`
  - صفحه اصلی قالب‌ساز؛ ریشه `.pt-page`.
  - فهرست قالب‌ها: `#pt-template-list`؛ شروع قالب جدید: `#pt-template-reset`.
  - فضای ویرایش: `#pt-editor-workspace` و `#pt-design-canvas`.
  - نوار ابزار فعلی از `[data-pt-action]` استفاده می‌کند؛ اقدامات موجود شامل undo/redo/preview و افزودن متن، فیلد داده، جدول، تصویر، خط، جداکننده، مستطیل و بیضی است.
  - تنظیمات صفحه: `#pt-page-size` و `#pt-page-orientation`.
  - پنل خصوصیات: `#pt-inspector-fields` و کنترل‌های `#pt-prop-*`.
  - منابع داده: `#pt-editor-source-list`، `#pt-source-list` و `#pt-binding-list`.
  - لایه‌ها: `#pt-layer-list`.
  - ذخیره قالب: `#pt-template-form`، `#pt-template-code`، `#pt-template-name` و `#pt-template-description`.
  - کنترل و ورودی واردسازی Word قبلاً حذف شده‌اند و نباید دوباره اضافه شوند.
- `js/modules/print-designer.js`
  - ماژول `PMS.Modules.PrintDesigner`؛ راه‌اندازی با `init()`، `initLibrary()` و `initOutput()`.
  - ساختار و صفحه: `blankDefinition()`، `pageDimensions()`، `syncPageControls()`، `createElement()`.
  - تعامل: `bindEditor()`، `handleEditorAction()`، `selectElement()`، `applyInspectorChange()`.
  - تاریخچه: `commitHistory()`، `undo()`، `redo()`.
  - رندر: `renderEditor()`، `renderCanvas()`، `renderInspector()`، `renderLayers()`، `renderSources()`.
  - ذخیره و کتابخانه: `loadLibrary()`، `saveTemplate()`، `editTemplate()`، `extract()`، `list()`.
  - خروجی: `renderOutputDocument()` و `resolveOutput()`.
- `css/print-template-library.css`
  - استایل صفحه قالب‌ساز، بوم، عناصر، پنل خصوصیات، خروجی/چاپ و breakpointهای واکنش‌گرا؛ توسعه ظاهر Ribbon و ویرایشگر صفحه‌محور در همین فایل انجام شود.
- `index.html`
  - بارگذاری ماژول قالب‌ساز و stylesheet با cache-busting.
  - وابستگی‌های اختصاصی واردسازی Word قبلاً حذف شده‌اند.
- تست‌های موجود:
  - `tests/print-template-library.test.js`
  - `tests/project-print-designer.test.js`
  - تست‌های مرتبط باید با رفتار جدید و حذف کامل Word import همگام بمانند.

### Backend — مخزن `Saeidesl/PRSPRO2BACKEND`، شاخه `main` (بدون تغییر مگر ضرورت اثبات‌شده)

- `Router.js`: مسیرهای موجود قالب‌ساز و resolve.
- `PrintTemplateService.js`: عملیات فهرست، منابع، CRUD و resolve.
- `PrintTemplateRepository.js`: شیت `36_PrintTemplates`.
- `PrintTemplateValidator.js`: اعتبارسنجی Definition؛ سقف فعلی ۴۵۰۰۰ نویسه.
- APIهای موجود:
  - `GET /print-templates`
  - `GET /print-templates/sources`
  - `POST /print-templates`
  - مسیرهای فعلی ویرایش، حذف و resolve قالب.
- منابع پاسخ API شامل `projectFields`، `informationTypes` و `forms` است.
- جریان داده: انتخاب منابع ← ثبت binding در Definition ← ذخیره از API فعلی ← انتخاب پروژه و resolve ← تولید سند و چاپ.
- هر تغییر احتمالی Backend باید با دلیل فنی و آزمون ثبت شود؛ ایجاد API، شیت یا ذخیره‌سازی موازی ممنوع است.

### نقشه داده و تصمیم‌های معماری

- ساختار Definition فعلی شامل `schemaVersion`، `page`، `elements` و `bindings` است؛ این ساختار و شناسه‌های binding تا حد امکان حفظ شوند.
- قالب‌های ذخیره‌شده فعلی باید باز شوند و قابل ویرایش باقی بمانند.
- `renderOutputDocument()` و `resolveOutput()` مرجع خروجی نهایی‌اند؛ بوم و خروجی چاپ باید از یک Definition مشترک استفاده کنند.
- تجربه هدف مطابق طرح مفهومی تأییدشده است: نوار ابزار تب‌بندی‌شده شبیه Word، صفحه A4 با خط‌کش و بزرگ‌نمایی، پنل درج عناصر، تنظیمات زمینه‌ای، ابزارهای متن/پاراگراف، جدول، تصویر و اشکال.
- عملیات رایج باید ساده و یک‌مرحله‌ای باشند؛ تنظیمات پیشرفته هنگام انتخاب عنصر نمایش داده شوند و مزاحم کار روزمره نباشند.
- رابط فارسی و RTL، واکنش‌گرا و سازگار با تم روشن/تیره باشد.
- واردسازی Word و وابستگی‌های آن از محدوده محصول خارج شده‌اند؛ قابلیت طراحی بومی داخل برنامه تنها مسیر ایجاد و ویرایش قالب است.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف معماری، پاک‌سازی Word Import و تثبیت طرح محصول**
  - *Log:* معماری قالب‌ساز، Definition، منابع داده، APIهای ذخیره/resolve و خروجی چاپ در Frontend و Backend بررسی شد. شاخه مستقل `feature/wordless-word-like-form-designer` ایجاد شد و `ARCHITECTURE.md` مطالعه شد. مسیر واردسازی Word از `js/modules/print-designer.js` حذف شد؛ کنترل و ورودی آن از `pages/print-designer.html`، وابستگی docx-preview از `index.html` و استایل اختصاصی آن از `css/print-template-library.css` پاک شد؛ تست‌های واردسازی در `tests/print-template-library.test.js` و `tests/project-print-designer.test.js` با آزمون عدم وجود مسیر جایگزین شدند. این پاک‌سازی commit شده است؛ اجرای کامل تست‌ها هنوز ثبت نشده است. طرح بصری ویرایشگر شبیه Word به کاربر ارائه شد و با درخواست ایجاد تسک‌ها، وارد برنامه اجرایی شد.

- [ ] **تسک ۲ — ساخت پوسته ویرایشگر Word-like و ابزارهای متن و صفحه (IN PROGRESS)**
  - محدوده: تبدیل ابزارهای پراکنده به Ribbon تب‌بندی‌شده (خانه، درج، جدول، صفحه و چیدمان، قالب‌بندی و ابزارها)؛ ساخت ناحیه سند صفحه‌محور با خط‌کش، حاشیه‌ها، اندازه و جهت صفحه، zoom و پیمایش صفحه؛ پیاده‌سازی ابزارهای متن و پاراگراف شامل فونت، اندازه، ضخیم/مورب/زیرخط، رنگ، تراز، فاصله خطوط و فهرست‌ها؛ طراحی نوار وضعیت و پنل‌های قابل جمع‌شدن؛ حفظ undo/redo و تعاملات فعلی.
  - معیار پذیرش: کاربر بتواند یک سند را در محیطی منظم و آشنا باز کند، متن را مستقیم ویرایش و قالب‌بندی کند، اندازه/جهت صفحه را تغییر دهد و بدون کار با مختصات، صفحه را مدیریت کند.

- [ ] **تسک ۳ — تکمیل ابزارهای جدول، تصویر، اشکال و تنظیمات زمینه‌ای**
  - محدوده: جدول‌ساز با افزودن/حذف ردیف و ستون، تنظیم عرض ستون‌ها، خطوط و زمینه سلول و ادغام سلول در صورت پشتیبانی مدل؛ درج تصویر و تنظیم اندازه/موقعیت/تناسب/حاشیه؛ درج خطوط، کادرها و اشکال؛ انتخاب، جابه‌جایی، تغییر اندازه، ترتیب لایه‌ها، تکثیر و حذف عناصر؛ نمایش تنظیمات متناسب با عنصر انتخاب‌شده؛ کنترل‌های مناسب موبایل.
  - معیار پذیرش: کاربر بتواند فرم‌های چندبخشی شامل جدول، تصویر و شکل بسازد و عناصر را با کنترل‌های دیداری تنظیم کند؛ عملیات پایه در دسکتاپ و موبایل قابل استفاده باشند.

- [ ] **تسک ۴ — یکپارچه‌سازی داده، ذخیره و بازیابی، چاپ و آزمون رگرسیون**
  - محدوده: اتصال تمام ابزارهای جدید به Definition و APIهای موجود؛ حفظ bindingهای اطلاعات پروژه، اطلاعات مرکزی و فرم‌ها؛ بازکردن و ویرایش قالب‌های قدیمی؛ همسان‌سازی خروجی با بوم؛ رفع صفحه خالی/اضافی و اطمینان از نمایش تصاویر در چاپ A4 چندصفحه‌ای؛ اصلاح cache-busting؛ اجرای تست‌های اختصاصی و رگرسیون و بررسی syntax/diff در هر دو مخزن.
  - معیار پذیرش: قالب جدید و قدیمی ذخیره و بازیابی شوند؛ داده‌های پویا برای پروژه انتخاب‌شده درست resolve شوند؛ پیش‌نمایش و چاپ با طراحی بوم مطابقت داشته باشند؛ هیچ وابستگی Word import باقی نماند و تست‌های مرتبط موفق باشند.
