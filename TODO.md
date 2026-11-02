## 🎯 Current Objective

بازطراحی کامل «طراحی قالب» و «چاپ اسناد» به یک سیستم قالب‌ساز عمومی، مستقل از پروژه و قابل استفاده مجدد در تمام PMS؛ با معماری ترکیبی شامل طراحی آزاد و بلوک‌های ساختاریافته، اتصال پویا به اطلاعات مرکزی و پاسخ فرم‌های ثبت‌شده، مدیریت مرکزی قالب‌ها و موتور خروجی استاندارد چندصفحه‌ای. اصل اجرایی: انتقال تمیز، حفظ قابلیت‌های معتبر فعلی، حذف مسیرها و کدهای چاپی منسوخ پس از جایگزینی و جلوگیری از باقی‌ماندن دو سیستم موازی.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### 1. وضعیت فعلی فرانت‌اند و مسیرهای موجود

- مخزن فرانت‌اند: `Saeidesl/PRSPRO2`، شاخه بررسی‌شده: `main`.
- `pages/print-designer.html`:
  - صفحه فعلی قبل از ورود به طراحی، انتخاب پروژه را اجباری می‌کند.
  - دکمه `print-designer-launch` و وضعیت بارگذاری پروژه دارد.
- `pages/print-output.html`:
  - انتخاب پروژه و سپس نمایش سند بر اساس قالب ذخیره‌شده همان پروژه.
  - دکمه‌های `print-output-launch` و `print-output-open-design`.
- `js/modules/project-detail.js`:
  - `ProjectDetail.init()`: بر اساس route، صفحات فعلی طراحی و چاپ را نیز راه‌اندازی می‌کند؛ این اتصال باید پس از انتقال به ماژول مستقل حذف شود.
  - `initPrintDesignerPage()`: انتخاب پروژه و شروع طراحی.
  - `initPrintOutputPage()`: انتخاب پروژه و آماده‌سازی خروجی.
  - `loadStandalonePrintProject(projectId)`: دریافت پروژه و timeline.
  - `waitForProjectForms(version)`: انتظار برای تکمیل بارگذاری پاسخ فرم‌ها.
  - `loadProjectForms(events, version, forceRefresh)`: دریافت پاسخ فرم‌ها از `GET /events/:eventId/forms`؛ این تابع و داده‌های مرتبط در جزئیات پروژه نیز مصرف می‌شوند و نباید بدون بررسی وابستگی حذف شوند.
  - `openPrintDesigner(standalone)`, `bindPrintDesigner(overlay)`, `renderPrintDesigner(overlay)`, `renderPrintDesignerElement(item)`, `renderPrintDesignerTable(tableId, columns, rows)`: محیط و رندر فعلی طراح.
  - `loadPrintDesignerTemplate()`, `savePrintDesignerTemplate()`: ذخیره/بازیابی قالب با کلید محلی `pms-print-template-<projectId>` و ساختار نسخه ۱؛ این ذخیره‌سازی پروژه‌محور و فقط در مرورگر است و باید با کتابخانه مرکزی جایگزین شود.
  - `openPrintOutput()`: نمایش فقط‌خواندنی قالب و چاپ مرورگر.
  - توابع کمکی تصاویر فرم، انتخاب تصویر داخلی، تنظیم عرض جدول و ستون‌ها در همین ماژول فعلی قرار دارند؛ منطق لازم باید به ماژول مستقل منتقل شود و فقط پس از بررسی referenceها از فایل قدیمی حذف شود.
- `css/project-print-designer.css`:
  - تمام استایل‌های فعلی overlay، workspace، A4، پنل‌ها، تصاویر داخلی، جدول‌ها، خروجی فقط‌خواندنی و media print را در خود دارد؛ پس از انتقال، استایل‌های جدید باید در فایل مستقل قالب‌ساز قرار گیرند و فایل قبلی بدون reference باقی نماند.
- `js/core/router.js`:
  - routeهای `print-designer`، `print-design` و `print-output` به صفحات فعلی متصل‌اند.
  - هر سه route فعلاً به ماژول `ProjectDetail` نگاشت شده‌اند.
  - مجوز هر سه route فعلاً `PROJECT_VIEW` است؛ دسترسی مدیریت کتابخانه قالب باید از دسترسی تولید سند تفکیک و در بک‌اند نیز enforce شود.
- `js/components/layout.js`: آیتم‌های منوی «طراحی قالب» و «چاپ اسناد»؛ باید به مسیرهای جدید متصل بمانند.
- `index.html`: فایل فعلی `css/project-print-designer.css` و `js/modules/project-detail.js` را بارگذاری و cache-bust می‌کند؛ پس از انتقال، فایل‌های مستقل جدید اضافه و referenceهای قدیمی حذف می‌شوند.
- `tests/project-print-designer.test.js`: تست‌های ساختاری فعلی برای route، فرم‌ها، تصاویر، جابه‌جایی، جدول، ذخیره محلی، A4 و چاپ دارد؛ این تست‌ها باید به قراردادهای معماری جدید بازنویسی شوند، نه اینکه صرفاً برای عبور از تست قدیمی کد جدید با ساختار قبلی حفظ شود.

### 2. APIها و منابع داده فعلی

- `GET /projects`: فهرست پروژه‌ها.
- `GET /projects/:projectId`: مشخصات اصلی پروژه.
- `GET /projects/:projectId/information` → `ProjectInformationService.list(projectId, params)`: اطلاعات مرکزی و ستون‌های فعال هر نوع اطلاعات؛ مقادیر جاری از `30_ProjectInformation.ValueJSON` و تعریف‌ها از `28_InformationTypes` و `29_InformationTypeColumns`.
- `GET /projects/:projectId/details` → `EventService.getProjectDetails(projectId, params)`: timeline و داده‌های تکمیلی رویدادهای پروژه.
- `GET /events/:eventId/forms` → `FormService.getEventResponses(eventId, params)`: snapshot پاسخ فرم‌های ثبت‌شده؛ تعریف snapshot و پاسخ در `35_EventFormData.DefinitionSnapshotJSON` و `ResponseJSON` نگهداری می‌شود.
- `GET /forms` و `GET /forms/:formId` → `FormService.list/get`: تعریف فرم‌های reusable و فیلدهای آن‌ها؛ برای طراحی منبع/فهرست فرم‌ها، نه جایگزین پاسخ ثبت‌شده.
- `GET /information-types` و `GET /information-types/:id` → `InformationTypeService.list/get`: تعریف اطلاعات مرکزی و ستون‌ها.
- `GET /attachments/:attachmentId/download`: دریافت امن فایل/تصویر پیوست؛ مالکیت و tenant باید از مسیر سرویس پیوست کنترل شود.
- `js/core/api.js`: wrapper درخواست‌ها، نشست، خطا و cache؛ تمام فراخوانی‌های فرانت‌اند باید از این لایه انجام شوند.

### 3. نقشه بک‌اند و پایگاه داده

- مخزن بک‌اند: `Saeidesl/PRSPRO2BACKEND`، شاخه بررسی‌شده: `main`.
- `Router.js`: routeهای پروژه، اطلاعات، فرم، رویداد و پیوست؛ محل افزودن APIهای کتابخانه قالب و resolve داده سند.
- `DatabaseSetup.js`: شیت‌های فعلی تا `35_EventFormData` تعریف شده‌اند؛ شماره/نام شیت جدید باید با فهرست کامل موجود تطبیق داده شود. نام پیشنهادی اولیه: `36_PrintTemplates`.
- `FormService.js`: `list`, `get`, `getEventResponses`؛ snapshot فرم ثبت‌شده را ارائه می‌کند.
- `InformationTypeService.js`: `list`, `get`, `listColumns`.
- `ProjectInformationService.js`: `list(projectId, params)`, `get(projectId, typeId, params)`؛ داده جاری پروژه را با کنترل tenant و تعریف اطلاعات ارائه می‌کند.
- `EventService.js`: `getProjectDetails(projectId, params)`؛ داده timeline پروژه و رویدادها را تجمیع می‌کند.
- `AttachmentService.js`: مسیر کنترل‌شده دانلود و اعتبارسنجی مالکیت پیوست.
- `PermissionService.js`, `PermissionRepository.js`, `Constants.js`, `DatabaseSetup.js`: محل بررسی و تعریف مجوزهای اختصاصی مدیریت/استفاده از قالب، در صورت نیاز.
- الگوی الزامی بک‌اند: Repository/Service/Validator/Router، tenant isolation، اعتبارسنجی سمت سرور، audit log و آزمون Node.
- APIهای پیشنهادی جدید (قرارداد نهایی در تسک بک‌اند تثبیت می‌شود):
  - `GET /print-templates`: فهرست قالب‌های tenant.
  - `POST /print-templates`: ایجاد قالب.
  - `GET /print-templates/:templateId`: دریافت تعریف قالب.
  - `PUT /print-templates/:templateId`: ویرایش/نسخه جدید قالب.
  - `DELETE /print-templates/:templateId` یا غیرفعال‌سازی امن: حذف منطقی، بدون حذف تاریخچه موردنیاز.
  - `POST /print-templates/:templateId/resolve`: دریافت `ProjectID` و تنظیمات انتخاب داده؛ resolve کردن منابع قالب با رعایت tenant و مجوزها و برگرداندن context نرمال‌شده برای رندر.
- ساختار ذخیره قالب باید نسخه‌دار و JSON-based باشد و حداقل شناسه، tenant، کد/نام، توضیح، وضعیت، نسخه، تنظیمات صفحه، صفحات، المان‌ها، bindingهای داده، قوانین نمایش، تنظیمات چاپ، سازنده/ویرایشگر و زمان‌ها را نگه دارد.
- bindingها باید بر شناسه پایدار منبع متکی باشند، نه متن عنوان یا index آرایه. برای فرم‌های ثبت‌شده، snapshot همان پاسخ/نسخه مبناست. انتخاب پاسخ در صورت چند بار ثبت‌شدن یک فرم باید قابل تعریف باشد (آخرین پاسخ، پاسخ مشخص یا مجموعه پاسخ‌ها).
- قالب فقط تعریف چیدمان و binding را نگه می‌دارد؛ هرگز داده یک پروژه را داخل قالب عمومی ذخیره نمی‌کند. داده پروژه فقط هنگام resolve/preview/output خوانده می‌شود.

### 3.1 قرارداد اجرایی پیاده‌سازی‌شده در تسک ۲

- بک‌اند:
  - `PrintTemplateRepository.js`: شیت `36_PrintTemplates` را در صورت نبود، به‌صورت افزایشی ایجاد می‌کند؛ ستون‌های موجود را جابه‌جا یا حذف نمی‌کند. عملیات فهرست/خواندن/ایجاد/ویرایش از `GoogleSheetsRepository` عبور می‌کند.
  - `PrintTemplateValidator.js`: نسخه ساختار، اندازه/جهت صفحه، شناسه یکتای bindingها، نوع منبع، allow-list فیلدهای پروژه، شناسه فرم/فیلد و روش انتخاب پاسخ را اعتبارسنجی می‌کند؛ سقف JSON برابر ۴۵۰۰۰ نویسه است.
  - `PrintTemplateService.js`: `list`, `get`, `sources`, `create`, `update`, `deactivate`, `resolve`. قالب‌ها tenant-scoped هستند؛ حذف منطقی و audit ثبت می‌شود؛ Version با هر ویرایش افزایش می‌یابد.
  - `Router.js`:
    - `GET /print-templates`: فهرست قالب‌های tenant؛ مجوز `SYSTEM_SETTINGS` یا `PROJECT_VIEW`.
    - `GET /print-templates/sources`: فهرست منابع قابل اتصال؛ مجوز `SYSTEM_SETTINGS`.
    - `GET /print-templates/:templateId`: دریافت قالب؛ مجوز `SYSTEM_SETTINGS` یا `PROJECT_VIEW`.
    - `POST /print-templates`: ایجاد؛ مجوز `SYSTEM_SETTINGS`.
    - `PUT /print-templates/:templateId`: ویرایش و افزایش نسخه؛ مجوز `SYSTEM_SETTINGS`.
    - `DELETE /print-templates/:templateId`: غیرفعال‌سازی منطقی؛ مجوز `SYSTEM_SETTINGS`.
    - `POST /print-templates/:templateId/resolve` با payload `{ ProjectID }`: بازیابی داده برای پروژه مجاز؛ مجوز `PROJECT_VIEW`.
  - ساختار ذخیره‌سازی شیت: `ID,TenantID,Code,Name,Description,Status,Version,DefinitionJSON,CreatedBy,CreatedAt,UpdatedBy,UpdatedAt`.
  - ساختار Definition: `{schemaVersion:1,page:{size,orientation},elements:[],bindings:[]}`. bindingهای فعلی: `PROJECT_FIELD`، `PROJECT_INFORMATION`، `EVENT_FORM_FIELD` و `EVENT_FORM_RESPONSE`. انتخاب پاسخ فرم: `LATEST`، `ALL`، `EVENT` یا `RESPONSE`.
  - خروجی resolve شامل `template`، خلاصه `project`، نگاشت `data` بر اساس شناسه binding و `resolvedAt` است. داده پروژه داخل Definition ذخیره نمی‌شود.
  - شیت در اولین استفاده به‌صورت افزایشی ساخته می‌شود؛ اجرای دستی setup برای ساخت شیت جدید الزامی نیست. تعریف آن در `DatabaseSetup.js` نیز ثبت شده تا در بررسی سلامت دیتابیس حضور داشته باشد.
- فرانت‌اند:
  - `js/modules/print-designer.js`: ماژول مستقل کتابخانه قالب و صفحه آماده‌سازی داده؛ عملیات CRUD، نمایش منابع، افزودن/حذف binding و resolve.
  - `css/print-template-library.css`: استایل مستقل کتابخانه و خروجی داده.
  - `pages/print-designer.html`: کتابخانه مرکزی و فرم ایجاد/ویرایش قالب، بدون انتخاب پروژه.
  - `pages/print-output.html`: انتخاب قالب و پروژه و نمایش داده resolveشده.
  - `js/core/router.js`: routeهای طراحی به `PrintDesigner` و مجوز `SYSTEM_SETTINGS`؛ route چاپ به همین ماژول با مجوز `PROJECT_VIEW`.
  - `js/components/layout.js`: منوی طراحی قالب فقط برای `SYSTEM_SETTINGS`؛ چاپ اسناد برای کاربران دارای `PROJECT_VIEW`.
  - `index.html`: بارگذاری ماژول و CSS جدید با cache-busting.
  - `tests/print-template-library.test.js` و به‌روزرسانی قراردادهای route در `tests/project-print-designer.test.js`.
- آزمون بک‌اند: `tests/print-templates.test.js` برای اعتبارسنجی binding، یکتایی tenant، نسخه‌دهی، resolve اطلاعات مرکزی و snapshot پاسخ فرم، مرز دسترسی و حذف منطقی افزوده شده است.
- منطق قدیمی محیط طراحی در `ProjectDetail` و CSS قبلی عمداً تا پایان انتقال باقی است؛ routeهای جدید دیگر آن را اجرا نمی‌کنند. حذف کامل legacy در تسک ۴ انجام می‌شود تا پیش از جایگزینی کامل قابلیت‌های ویرایش، عملکرد فعلی از دست نرود.

### 3.2 وضعیت پیاده‌سازی محیط طراحی در تسک ۳ (در حال اجرا)

- `pages/print-designer.html`: محیط طراحی به صفحه کتابخانه افزوده شده است؛ شناسه‌های اصلی شامل `pt-editor-workspace`، `pt-design-canvas`، `pt-inspector-fields`، `pt-layer-list` و کنترل‌های صفحه/جدول/ظاهر هستند.
- `js/modules/print-designer.js`:
  - `pageDimensions()` و `syncPageControls()` اندازه و جهت صفحه A4/A5/Letter را مدیریت می‌کنند.
  - `bindEditor()` تعامل‌های بوم، drag، resize، کنترل‌های پنل، میانبرهای undo/redo و تغییر اندازه صفحه را متصل می‌کند.
  - `createElement()` و `handleEditorAction()` المان‌های متن، فیلد داده، جدول و جایگاه تصویر را ایجاد می‌کنند؛ تکثیر، حذف، ترتیب لایه و پیش‌نمایش نمونه نیز پشتیبانی می‌شوند.
  - `applyInspectorChange()` و `renderInspector()` متن، binding، انتخاب پاسخ فرم (LATEST/ALL/EVENT/RESPONSE)، موقعیت، ابعاد، قلم، تراز، رنگ و ساختار چندردیفی جدول را مدیریت می‌کنند.
  - `renderCanvas()` و `renderLayers()` بوم و فهرست لایه‌ها را نمایش می‌دهند.
  - `commitHistory()`، `restoreHistory()`، `undo()` و `redo()` تاریخچه ویرایش را تا ۶۰ وضعیت نگه می‌دارند.
  - تعریف صفحه، عناصر، اندازه/موقعیت، سبک‌ها، binding و جدول‌ها در همان `Definition` نسخه‌دار قالب ذخیره می‌شود؛ API جدید موازی ایجاد نشده است.
- `css/print-template-library.css`: استایل بوم با واحد میلی‌متر، المان انتخاب‌شده و دستگیره resize، پنل ویژگی‌ها، لایه‌ها، حالت پیش‌نمایش و چیدمان واکنش‌گرا افزوده شده است.
- `index.html`: نسخه assetها به `20261102-template-editor-5` و `20261102-template-editor-2` تغییر یافته است.
- `tests/print-template-library.test.js`: تست‌های regression برای parse ماژول، کنترل‌های بوم، جدول چندردیفی، انتخاب پاسخ، رنگ‌ها، ترتیب لایه و پیش‌نمایش افزوده شده‌اند.
- اصلاح اتصال داده پس از بازخورد کاربر:
  - `pages/print-designer.html`: فهرست منابع به داخل پنل طراح منتقل شد و خارج از بخش ویژگی‌های المان قرار گرفت تا حتی پیش از انتخاب المان نیز در دسترس باشد.
  - `js/modules/print-designer.js`: `renderSources()` فهرست منابع را هم در پنل اصلی و هم در محیط طراحی نمایش می‌دهد؛ اتصال منبع از همان پنل انجام می‌شود. `loadLibrary()` درخواست کتابخانه و منابع را مستقل مدیریت می‌کند تا شکست یک درخواست مانع نمایش دیگری نشود و خطای دریافت منابع به‌جای وضعیت بارگذاری بی‌پایان نمایش داده شود.
  - `css/print-template-library.css`: ظاهر پنل اتصال منابع در کنار ویژگی‌های طراحی افزوده شد.
  - `index.html`: cache-busting به `template-editor-6` و `template-editor-3` به‌روزرسانی شد.
  - `tests/print-template-library.test.js`: بررسی‌های رگرسیون برای پنل اتصال منبع و مدیریت خطای دریافت منابع افزوده شد.
  - CI commit `dd6ea3560600511a8513a09d507167c5774026e2`: «Frontend checks» و «PMS cross-repository QA» هر دو موفق شدند؛ build و انتشار GitHub Pages هنوز در حال اجراست.
- اعتبارسنجی CI روی commit `09d4ec5e923e56769107bf34307a5721d3300e5e`: workflow «Frontend checks» موفق؛ workflow «PMS cross-repository QA» موفق. یک نقص مستقل در resolve بک‌اند (عدم bind شدن context حلقه bindingها) کشف و در `PRSPRO2BACKEND/PrintTemplateService.js` اصلاح شد؛ آزمون‌های بک‌اند و اعتبارسنجی source در اجرای QA بعدی موفق شدند. انتشار Web App بک‌اند هنوز در حال اجراست و تا تکمیل workflow موفق اعلام نمی‌شود.
 
### 4. معماری هدف و معیارهای پاک‌سازی

- مدل طراحی تأییدشده: **ترکیبی**؛ بوم آزاد با مختصات واقعی صفحه در کنار بلوک‌های ساختاریافته و تکرارشونده.
- ماژول مستقل پیشنهادی فرانت‌اند: `js/modules/print-designer.js`؛ طراح نباید به چرخه عمر `ProjectDetail` وابسته باشد.
- استایل مستقل پیشنهادی: `css/print-designer.css`؛ پس از انتقال و حذف referenceها، `css/project-print-designer.css` حذف شود.
- صفحه `pages/print-designer.html` به کتابخانه قالب‌ها و ایجاد/ویرایش قالب بدون انتخاب پروژه تبدیل شود.
- صفحه `pages/print-output.html` انتخاب قالب + انتخاب پروژه + پیش‌نمایش خروجی را ارائه کند.
- موتور رندر سند از محیط ویرایش جدا باشد؛ تعریف قالب را با داده resolveشده ترکیب کند و خروجی read-only تولید کند.
- مدل صفحه: اندازه و جهت قابل تنظیم، حاشیه، چندصفحه‌ای، صفحه‌بندی، شماره صفحه، سربرگ/پابرگ و کنترل شکست صفحه.
- مدل المان: متن/عنوان، فیلد داده، تصویر/پیوست، جدول، خط/کادر، بلوک فرم، QR/بارکد در صورت پشتیبانی؛ هر المان موقعیت، ابعاد، استایل، ترتیب/لایه و binding مستقل داشته باشد.
- تعاملات ویرایش: drag/resize، انتخاب چندگانه، تراز، راهنما و snap، لایه‌ها، قفل، کپی/تکثیر/حذف، undo/redo و پنل ویژگی‌ها.
- بلوک ساختاریافته: جدول و تکرار ردیف‌ها، گروه‌بندی فیلدها، نمایش شرطی، مخفی‌سازی مقدار خالی و ادامه محتوا در صفحات بعد.
- خروجی: فارسی/RTL، فونت‌های برنامه، چاپ دقیق A4/A5/سفارشی، چندصفحه‌ای، تکرار سرستون جدول و چاپ/PDF از مرورگر؛ آزمون در مرورگر واقعی و داده‌های با حجم/تعداد ردیف متفاوت.
- حفظ سازگاری با routeها و منوهای موجود؛ مدیریت قالب عمومی از انتخاب پروژه مستقل باشد.
- پاک‌سازی: تمام referenceهای توابع/استایل/routeهای legacy بررسی شوند؛ منطق مورد استفاده جزئیات پروژه حفظ شود؛ توابع چاپی منتقل‌شده از `project-detail.js`، ذخیره‌سازی `pms-print-template-<projectId>` و فایل CSS قدیمی فقط پس از جایگزینی کامل و به‌روزرسانی تست‌ها حذف شوند. کلیدهای localStorage قدیمی بدون مسیر مصرف باقی نمانند؛ در صورت نیاز، ابزار تبدیل/خروجی‌گرفتن از قالب‌های محلی قدیمی به‌عنوان تصمیم سازگاری بررسی شود و حذف داده کاربر بدون تصمیم صریح انجام نشود.
- آزمون‌ها باید شامل CRUD و tenant isolation قالب، مجوزها، binding فیلدهای مرکزی، snapshot فرم، چند پاسخ یک فرم، تصویر/پیوست، داده خالی/اختیاری، جدول چندردیفی، چندصفحه‌ای، خروجی RTL و regression جزئیات پروژه باشند.
- هیچ تستی صرفاً از روی وجود رشته در سورس به‌عنوان تست عملکردی گزارش نشود؛ اجرای واقعی تست‌ها و نتیجه CI جداگانه ثبت شود.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف و نقشه‌برداری کامل معماری فعلی و تعریف معماری مقصد**
  - *Log:* فایل‌های `TODO.md` و `ARCHITECTURE.md` فرانت‌اند، صفحات `pages/print-designer.html` و `pages/print-output.html`، ماژول `js/modules/project-detail.js`، استایل `css/project-print-designer.css`، routeها در `js/core/router.js`، بارگذاری assetها در `index.html` و تست `tests/project-print-designer.test.js` بررسی شدند. وابستگی فعلی طراح به انتخاب پروژه و `ProjectDetail`، ذخیره قالب در localStorage با کلید `pms-print-template-<projectId>` و قالب version 1 شناسایی شد. در بک‌اند، `Router.js`، `DatabaseSetup.js`، `FormService.js`، `InformationTypeService.js`، `ProjectInformationService.js`، `EventService.js` و مسیر پیوست بررسی شدند. منابع موجود شامل `GET /projects/:id/information` و `GET /events/:id/forms` و snapshotهای `35_EventFormData` هستند. شیت جدید `36_PrintTemplates` و APIهای مدیریت قالب/resolve به‌عنوان پیشنهاد معماری ثبت شدند. مدل ترکیبی طراحی آزاد و ساختاریافته طبق انتخاب کاربر مبنای مقصد است. در این مرحله هیچ کد برنامه‌ای تغییر نکرده است.
- [x] **تسک ۲ — ایجاد کتابخانه مرکزی قالب‌ها و لایه امن مدیریت/بازیابی داده**
  - *Log:* در بک‌اند، `PrintTemplateRepository.js` برای شیت tenant-scoped نسخه‌دار `36_PrintTemplates`، `PrintTemplateValidator.js` برای اعتبارسنجی تعریف و bindingها، `PrintTemplateService.js` برای `list/get/sources/create/update/deactivate/resolve` و routeهای متناظر در `Router.js` پیاده‌سازی شدند؛ تعریف شیت در `DatabaseSetup.js` ثبت شد. در فرانت‌اند، `pages/print-designer.html` و `js/modules/print-designer.js` کتابخانه مستقل، فهرست منابع، bindingها و CRUD را ارائه می‌کنند؛ `pages/print-output.html` و routeها در `js/core/router.js` آماده‌سازی داده قالب برای پروژه را متصل می‌کنند؛ `css/print-template-library.css` و `index.html` assetها را بارگذاری می‌کنند. خطای نحوی ناشی از تعریف دوباره متغیر `code` در `resetForm()` رفع شد؛ بارگذاری تکراری ماژول در `index.html` حذف و cache-busting به‌روزرسانی شد؛ تست رگرسیون parse و بارگذاری یکتا به `tests/print-template-library.test.js` افزوده شد. کاربر در تست عملی تأیید کرد فهرست قالب‌ها و منابع داده بارگذاری می‌شوند و قالب با کد و نام پس از ذخیره و تازه‌سازی باقی می‌ماند. اجرای خودکار تست‌ها/CI و انتشار GAS در این مرحله ادعا نشده است.
  - محدوده: پیاده‌سازی Repository/Service/Validator و شیت نسخه‌دار قالب‌ها در بک‌اند؛ CRUD امن tenant-scoped، audit، مجوزهای مناسب و API resolve داده؛ اتصال کتابخانه قالب در فرانت‌اند؛ استفاده از اطلاعات مرکزی و پاسخ فرم‌های ثبت‌شده بر مبنای شناسه‌های پایدار و snapshot نسخه فرم؛ تعیین سیاست انتخاب پاسخ در فرم‌هایی که چند بار ثبت شده‌اند.
  - معیار پذیرش: قالب بدون انتخاب پروژه ایجاد/ذخیره/ویرایش/غیرفعال شود؛ یک قالب در چند پروژه قابل استفاده باشد؛ هیچ مقدار پروژه‌ای داخل تعریف قالب ذخیره نشود؛ resolve فقط داده همان tenant و پروژه مجاز را برگرداند؛ پاسخ فرم قدیمی با snapshot زمان ثبت تفسیر شود.
- [ ] **تسک ۳ — ساخت محیط طراحی ترکیبی مستقل و حرفه‌ای**
  - **(IN PROGRESS)**
  - *Log:* (پس از اجرا تکمیل شود)
  - محدوده: ساخت ماژول مستقل `print-designer.js` و صفحه کتابخانه/ویرایش؛ بوم با مختصات واقعی و چندصفحه‌ای؛ پنل منابع داده و المان‌ها؛ طراحی آزاد drag/resize و انتخاب/تراز/لایه‌بندی؛ بلوک‌های ساختاریافته، جدول و ردیف‌های تکرارشونده؛ پنل تنظیمات؛ undo/redo؛ پیش‌نمایش با داده نمونه؛ ذخیره تعریف قالب از طریق API مرکزی.
  - معیار پذیرش: کاربر بدون انتخاب پروژه قالب می‌سازد؛ اطلاعات مرکزی و فیلدهای فرم را به‌صورت binding انتخاب می‌کند؛ ظاهر، اندازه و محل المان‌ها مستقل تنظیم می‌شود؛ جدول‌های چندردیفی و بلوک‌های پویا درست طراحی می‌شوند؛ ویرایش و بازگشایی قالب، چیدمان را بدون تغییر حفظ می‌کند.
- [ ] **تسک ۴ — موتور تولید سند، چاپ/PDF، اتصال سراسری و پاک‌سازی legacy**
  - *Log:* (پس از اجرا تکمیل شود)
  - محدوده: موتور resolve-to-render مستقل از editor؛ انتخاب قالب و پروژه در چاپ اسناد؛ صفحه‌بندی و خروجی RTL؛ تصاویر/پیوست‌ها، سربرگ/پابرگ، شماره صفحه، تکرار سرستون و شکست صفحه؛ تست‌های واحد/قرارداد/رگرسیون و بررسی خروجی واقعی؛ اتصال منوها و routeها؛ حذف توابع چاپ منتقل‌شده از `project-detail.js`، CSS و referenceهای قدیمی و بازنویسی تست‌های legacy؛ تعیین تکلیف امن قالب‌های محلی قبلی بدون حذف ناخواسته داده کاربر.
  - معیار پذیرش: یک قالب واحد برای چند پروژه خروجی مستقل و صحیح بسازد؛ چاپ و PDF چندصفحه‌ای در اندازه‌های پشتیبانی‌شده قابل اتکا باشد؛ جزئیات پروژه و فرم‌های فعلی regression نداشته باشند؛ هیچ route، asset، تابع یا تست منسوخِ بدون مصرف از سیستم قدیمی باقی نماند؛ تست‌های خودکار و CI مرتبط موفق باشند.
