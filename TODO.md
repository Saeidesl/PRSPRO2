## 🎯 Current Objective

لغو کامل قابلیت واردسازی فایل Word و تبدیل محیط طراحی داخلی قالب/فرم به ویرایشگری حرفه‌ای و ساده شبیه Word؛ با نوار ابزار آشنا، صفحه‌بندی واقعی، ابزارهای کامل متن و جدول، درج تصویر و اشکال، تنظیمات دقیق و حفظ اتصال به اطلاعات مرکزی، پروژه‌ها، رویدادها و چاپ موجود.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### Frontend — مخزن `Saeidesl/PRSPRO2`، شاخه `feature/wordless-word-like-form-designer`

- `pages/print-designer.html`
  - صفحه فعلی قالب‌ساز مرکزی؛ ریشه `.pt-page`.
  - دکمه شروع قالب: `#pt-template-reset`.
  - فهرست قالب‌ها: `#pt-template-list`.
  - فضای ویرایش: `#pt-editor-workspace`.
  - بوم فعلی: `#pt-design-canvas`.
  - نوار ابزار فعلی با `[data-pt-action]` شامل undo/redo/preview و افزودن متن، فیلد داده، جدول، تصویر، خط، جداکننده، مستطیل و بیضی.
  - تنظیمات صفحه: `#pt-page-size` و `#pt-page-orientation`.
  - پنل خصوصیات: `#pt-inspector-fields` و کنترل‌های `#pt-prop-*` برای متن، اتصال داده، موقعیت، اندازه، فونت، تراز، رنگ، زمینه و تنظیمات جدول.
  - پنل منابع داده: `#pt-editor-source-list`، `#pt-source-list` و `#pt-binding-list`.
  - لایه‌ها: `#pt-layer-list`.
  - فرم ذخیره قالب: `#pt-template-form`، `#pt-template-code`، `#pt-template-name`، `#pt-template-description`.
  - ورودی‌های Word فعلی `#pt-word-import` و `#pt-word-import-file` باید حذف شوند.
- `js/modules/print-designer.js`
  - ماژول `PMS.Modules.PrintDesigner` و initializerهای `init()`، `initLibrary()` و `initOutput()`.
  - داده و ساختار: `blankDefinition()`، `pageDimensions()`، `syncPageControls()`، `createElement()`، `getSelectedOrById()`.
  - تعامل و تاریخچه: `bindEditor()`، `handleEditorAction()`، `selectElement()`، `applyInspectorChange()`، `commitHistory()`، `undo()`، `redo()`.
  - نمایش: `renderEditor()`، `renderCanvas()`، `renderInspector()`، `renderLayers()`، `renderSources()`.
  - داده و ذخیره: `loadLibrary()`، `saveTemplate()`، `editTemplate()`، `extract()`، `list()`.
  - خروجی: `renderOutputDocument()` و `resolveOutput()`.
  - مسیرهای واردسازی Word شامل `importWordDocument()`، `ensureWordLibraries()`، `loadWordScript()`، `sanitizeImportedHtml()` و `sanitizeWordCss()` باید حذف و وابستگی‌های بلااستفاده پاک شوند.
- `css/print-template-library.css`
  - استایل محیط فعلی قالب‌ساز، بوم، عناصر انتخاب‌شده، پنل خصوصیات، ابزارها، خروجی چاپ و breakpointهای واکنش‌گرا.
  - استایل‌های اختصاصی Word پس از حذف مسیر واردسازی پاک شوند؛ استایل‌های عمومی چاپ/بوم حفظ و برای ویرایشگر جدید توسعه یابند.
- `index.html`
  - بارگذاری `js/modules/print-designer.js` و `css/print-template-library.css` با cache-busting.
  - وابستگی‌های JSZip و docx-preview که فقط برای Word import هستند باید حذف شوند؛ وابستگی‌های لازم چاپ حفظ شوند.
- تست‌های موجود:
  - `tests/print-template-library.test.js`
  - `tests/project-print-designer.test.js`
  - تست‌های مربوط به Word import باید با تست‌های حذف کامل آن جایگزین شوند؛ تست‌های قالب، منابع، اتصال داده، چاپ و صفحه‌بندی حفظ شوند.

### Backend — مخزن `Saeidesl/PRSPRO2BACKEND`، شاخه `main` (بدون تغییر در این فاز مگر کشف ضرورت)

- `Router.js`: مسیرهای موجود قالب‌ساز و resolve.
- `PrintTemplateService.js`: `list(params)`، `sources(params)` و عملیات CRUD/resolve موجود.
- `PrintTemplateRepository.js`: شیت `36_PrintTemplates`.
- `PrintTemplateValidator.js`: اعتبارسنجی Definition با سقف فعلی ۴۵۰۰۰ نویسه؛ ساختار ذخیره‌سازی باید در فاز فرانت‌اند با payload فعلی سازگار بماند.
- APIهای موجود:
  - `GET /print-templates`
  - `GET /print-templates/sources`
  - `POST /print-templates`
  - APIهای فعلی ویرایش/حذف/resolve قالب که در ماژول موجود استفاده می‌شوند.
- پاسخ منابع: `projectFields`، `informationTypes` و `forms` همراه فیلدهای فرم.
- جریان داده: انتخاب منابع → ایجاد binding پایدار در Definition → ذخیره با API فعلی → انتخاب پروژه و resolve → تولید سند/چاپ.

### یافته‌های کشف و تصمیم‌های معماری

- محیط فعلی یک بوم مبتنی بر مختصات میلی‌متری دارد و عناصر را با pointer جابه‌جا و resize می‌کند؛ undo/redo، پنل خصوصیات، لایه‌ها، جدول قابل تنظیم، اشکال و خروجی چاپ نیز وجود دارند.
- UI فعلی ابزارها را به‌صورت چند دکمه پراکنده و پنل‌های مرحله‌ای نمایش می‌دهد؛ برای کاربری شبیه Word باید به نوار ابزار گروه‌بندی‌شده (Ribbon)، بوم صفحه‌محور، نوار وضعیت/بزرگ‌نمایی و پنل تنظیمات زمینه‌ای تبدیل شود.
- ساختار Definition فعلی `schemaVersion`، `page`، `elements` و `bindings` دارد؛ توسعه باید تا حد امکان همین مدل و شناسه‌های binding را حفظ کند تا قالب‌های ذخیره‌شده فعلی از کار نیفتند.
- خروجی چاپ در `renderOutputDocument()` و `resolveOutput()` قرار دارد؛ ظاهر و رفتار ویرایشگر نباید renderer چاپ را از بین ببرد یا منطق داده را دوگانه کند.
- تصمیم قطعی محصول: واردسازی Word لغو شود؛ دکمه/ورودی و کتابخانه‌های مختص آن از UI و کد حذف شوند. ایجاد فرم/قالب فقط از داخل محیط طراحی برنامه انجام می‌شود.
- مخزن بک‌اند و قرارداد API فعلی در مرحله اول بدون تغییر می‌مانند؛ اگر توسعه Definition به تغییر validator یا قرارداد ذخیره نیاز پیدا کرد، آن را با دلیل و آزمون در همین نقشه ثبت می‌کنیم.
- شاخه اصلی `main` دست‌نخورده می‌ماند؛ کار توسعه در شاخه مستقل اعلام‌شده انجام می‌شود.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف معماری فعلی و طراحی نقشه بازطراحی**
  - *Log:* `TODO.md` و `ARCHITECTURE.md` فرانت‌اند، وضعیت قبلی واردسازی Word، صفحه `pages/print-designer.html`، ماژول `js/modules/print-designer.js`، stylesheet و تست‌های قالب‌ساز بررسی شدند. ساختار فعلی بوم، Definition، تعاملات، APIهای منابع/ذخیره/resolve و خروجی چاپ ثبت شد. شاخه مستقل `feature/wordless-word-like-form-designer` از `main` ساخته شد. هیچ فایل برنامه‌ای تغییر نکرده است.

- [ ] **تسک ۲ — حذف Word Import و ساخت محیط ویرایشگر شبیه Word (IN PROGRESS)**
  - محدوده: حذف کامل کنترل‌ها، توابع، CDNها و تست‌های واردسازی Word؛ طراحی نوار ابزار Ribbon با گروه‌بندی منطقی؛ ابزارهای متن و پاراگراف (فونت، اندازه، ضخیم، مورب، زیرخط، رنگ، تراز، فاصله و فهرست‌ها)؛ ابزارهای صفحه و چیدمان (A4/A5/Letter، عمودی/افقی، حاشیه‌ها، راهنما/خط‌کش، zoom، صفحه‌بندی و page break)؛ ابزارهای جدول (درج، حذف/افزودن ردیف و ستون، ادغام در حد پشتیبانی مدل، عرض ستون و حاشیه/زمینه سلول)؛ تصویر و اشکال (درج، جابه‌جایی، اندازه، برش/تناسب، حاشیه و ترتیب لایه)؛ انتخاب چندگانه در صورت سازگاری، کپی/چسباندن/تکثیر، میانبرهای صفحه‌کلید، undo/redo، پنل تنظیمات زمینه‌ای و UX واکنش‌گرا.
  - اصول اجرا: تعاملات قابل فهم و نزدیک به Word؛ عملیات رایج با یک کلیک؛ حفظ ساختار Definition و سازگاری قالب‌های قبلی؛ عدم ایجاد مسیر ذخیره‌سازی یا فرم‌ساز موازی؛ نمایش پیش‌نمایش واقعی صفحه و چاپ.
  - معیار پذیرش: کاربر بتواند بدون واردکردن Word یک فرم چندبخشی را بسازد، متن و جدول را قالب‌بندی کند، تصاویر/اشکال اضافه و تنظیم کند، عناصر را جابه‌جا کند و تغییرات را ذخیره کند؛ محیط در دسکتاپ و موبایل قابل استفاده باشد.

- [ ] **تسک ۳ — یکپارچه‌سازی داده، ذخیره، چاپ و آزمون رگرسیون**
  - محدوده: اتصال تمام ابزارهای جدید به Definition و APIهای فعلی؛ حفظ منابع پروژه/اطلاعات مرکزی/فرم‌ها و bindingها؛ اطمینان از بازشدن و ویرایش قالب‌های قبلی؛ بررسی خروجی resolve و چاپ A4 چندصفحه‌ای؛ اصلاح cache-busting؛ جایگزینی تست‌های Word با تست حذف وابستگی و پوشش ابزارهای ویرایشگر؛ اجرای تست‌های Node و بررسی syntax/diff.
  - معیار پذیرش: قالب جدید و قدیمی ذخیره و بازیابی شوند؛ bindingها در انتخاب پروژه درست resolve شوند؛ خروجی چاپ با بوم هم‌خوان باشد؛ هیچ مسیر یا وابستگی Word import باقی نماند؛ تست‌های خودکار مرتبط موفق باشند.
