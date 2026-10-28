# TODO1 — منوی عملیات کارت پروژه، پیوست‌های تصویری و خروجی پروژه

> محدوده: مخزن فرانت‌اند `Saeidesl/PRSPRO2`، شاخه `main`. این فایل فضای کاری فعال همین قابلیت است. در این مرحله فقط بررسی و نقشه فنی انجام شده؛ هیچ فایل اصلی کد تغییر نکرده است.

## Technical Spec & Architecture Map

### 1) مخازن و اسناد بررسی‌شده

- Frontend: `Saeidesl/PRSPRO2`، شاخه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- `ARCHITECTURE.md`: در ریشه هر دو مخزن بررسی شد؛ در هیچ‌کدام موجود نیست.
- `TODO1.md`: در ریشه فرانت‌اند موجود نبود؛ این فایل برای همین قابلیت ایجاد شده است.
- Backend `TODO.md` وجود دارد اما عنوان و دامنه آن «استانداردسازی توسعه‌پذیر تأمین ملزومات» است؛ برای جلوگیری از بازنویسی کارهای قبلی، آن فایل دست‌نخورده می‌ماند.
- Backend `Router.js` بررسی شد تا مسیرهای موجود و کنترل دسترسی مشخص شوند.
- هنوز هیچ فایل اصلی فرانت‌اند یا بک‌اند برای این قابلیت تغییر نکرده است.

### 2) نقشه فرانت‌اند: کارت‌ها و عملیات پروژه

#### `js/modules/projects.js`

ماژول فهرست پروژه‌ها و فرم ایجاد/ویرایش پروژه.

توابع/متغیرهای مرتبط:
- `Projects.init()`: راه‌اندازی ماژول، کنترل مجوزهای `PROJECT_VIEW` و `PROJECT_CREATE`، بارگذاری پروژه‌ها و وضعیت‌ها.
- `Projects.render()`: ساخت کارت‌های پروژه و اتصال رویدادهای دکمه‌ها.
- `Projects.openProjectEditForm(projectId)`: دریافت اطلاعات پروژه از `GET /projects/:id` و آماده‌سازی فرم ویرایش.
- `Projects.openProjectColorSizeForm(projectId)`: دریافت پروژه از `GET /projects/:id` و استخراج `ColorSizeJSON` برای فرم رنگ‌بندی/سایزبندی.
- `Projects.openDraftMaterialSpecsForm(projectModal)`: فرم مصرف ملزومات هنگام ایجاد پروژه؛ داده‌های پیش‌نویس را از `projectModal.dataset.projectMaterialSpecs` می‌خواند.
- `Projects.openColorSizeForm(projectModal)`: فرم رنگ‌بندی و سایزبندی؛ داده‌ها را از `projectModal.dataset.colorSizeJson` می‌خواند.
- `Projects.openCreateForm()`: فرم ایجاد/ویرایش پروژه؛ شامل کنترل تنظیمات و دکمه‌های فعلی مصرف ملزومات و رنگ‌بندی/سایزبندی.
- `Projects.createProject(modal)`: آماده‌سازی payload پروژه. فیلدهای مرتبط شامل `ProjectCode`, `Title`, `Quantity`, `WorkflowID`, `Description`, `CreatedAt`, `ColorSizeJSON`, `AvailableDepartmentIDs`, `AllowedUserIDs`, `NotifyEnabled`, `Status` هستند.
- `Projects.loadProjectEditAttachments(modal, projectId)`: خواندن پیوست‌های پروژه از `GET /projects/:id/attachments` و نمایش فهرست؛ حذف با `DELETE /attachments/:attachmentId?reason=...`.
- `Projects.deleteProjectEditAttachment(modal, attachmentId, button)`: حذف پیوست با درخواست دلیل، پاک‌سازی کش و بارگذاری مجدد.
- `Projects.getProjectCardAttachments()`: دریافت فراداده تصاویر کارت از `GET /project-card-images` با کش پنج‌دقیقه‌ای.
- `Projects.loadProjectCardImages(projects)`, `loadOneProjectCardImage(projectId, attachment)`, `applyProjectCardImagesToCards()`: انتخاب/بارگذاری تصویر کارت و نمایش lazy-load؛ این منطق باید با دسته‌بندی جدید نوع تصویر هماهنگ شود.
- `Projects.projectCardImages`, `projectCardImageStates`, `projectCardImageAttachments`, `projectCardImageInflight`: وضعیت و کش‌های تصویر کارت.
- `projectSettingsStorageKey()`: کلید تنظیمات پیش‌فرض ایجاد پروژه را بر اساس کاربر می‌سازد.
- `bindProjectModalKeyboard(overlay, onClose)`: مدیریت صفحه‌کلید و فوکوس مودال‌ها.

مشاهدات فعلی:
- در کارت‌های ماژول پروژه‌ها دکمه‌های «مصرف ملزومات» و «رنگ‌بندی و سایز» در `Projects.render()` رندر می‌شوند؛ تسک انتقال باید همین دکمه‌ها را از کارت حذف و رویداد منوی سه‌نقطه را به توابع موجود وصل کند.
- دکمه `#project-settings-open` در سربرگ فرم ایجاد/ویرایش وجود دارد. پنجره `#project-create-settings-modal` و توابع باز/بسته‌کردن/ذخیره تنظیمات در همان `openCreateForm()` ساخته شده‌اند.
- داده رنگ و سایز در فیلد پروژه `ColorSizeJSON` به شکل JSON با ساختار `{ colors: [], sizes: [] }` ارسال/خوانده می‌شود.
- برای فرم ایجاد پروژه هنوز شناسه پروژه وجود ندارد؛ منوی پروژه ذخیره‌شده و تنظیمات فرم ایجاد باید از نظر زمینه (context) جدا بمانند ولی تا جای ممکن از منطق مشترک استفاده کنند.

#### `js/modules/dashboard-redesign.js`

ماژول داشبورد/کاوشگر پروژه و کارت‌های دارای تاریخچه:
- `Dashboard.renderProjectList()`, `Dashboard.renderProjectCard(project)`: رندر کارت‌ها در داشبورد.
- `Dashboard.bindEvents()`: رویدادهای کارت، فرم نیازمندی‌های پروژه و رویدادهای تایم‌لاین.
- `Dashboard.openProjectNeedsForm(projectId)`: فرم ثبت نیازمندی‌های تأمین؛ مسیر `POST /procurement/needs`.
- منوی سه‌نقطه قبلاً در این فایل اضافه شده است: `.dash-project-menu-button`, `[data-project-menu-toggle]`, `[data-project-menu]`. در وضعیت فعلی پنل منو فقط پیام placeholder دارد و هنوز به عملیات موردنظر متصل نشده است.
- CSS در `Dashboard.ensureStyles()` تعریف می‌شود.
- باید مشخص شود هر گزینه روی کارت‌های این ماژول، کارت‌های صفحه پروژه‌ها یا هر دو نمایش داده شود؛ منوی موجود داشبورد نباید با منوی صفحه پروژه‌ها دو پیاده‌سازی ناسازگار بسازد.

### 3) صفحه مشاهده پروژه

#### `pages/project-detail.html`
- صفحه جزئیات پروژه.
- محفظه اطلاعات اصلی: `#project-detail-content`.
- عنوان/کد: `#project-detail-title`, `#project-detail-code`.
- اطلاعات مشخصات: `#project-detail-info`.
- وضعیت و آمار: `#project-detail-status`, `#project-detail-step`, `#project-detail-events-count`, `#project-detail-created`, `#project-detail-updated`.
- بخش رویدادها: `#project-detail-events`.
- این صفحه محل مناسب نمایش تصاویر شناسنامه دوخت و شناسنامه برش است.

#### `js/modules/project-detail.js`
- `ProjectDetail.init()`, `getProjectId()`, `load()`: بارگذاری پروژه و رویدادها.
- `renderProject(project)`: رندر مشخصات پروژه؛ در حال حاضر `ColorSizeJSON` نیز در اطلاعات پروژه پردازش می‌شود.
- `loadSharedData()`, `loadWorkflowSteps()`, `renderEvents()`: داده‌های وابسته و رویدادها.
- دریافت پروژه از `GET /projects/:id` (با کش `window.PMS.Cache`).
- برای پیوست‌ها می‌توان از قرارداد موجود `GET /projects/:id/attachments` استفاده کرد و بر اساس نوع پیوست، عکس‌های شناسنامه را در بخش جزئیات نمایش داد.

### 4) فرم مصرف ملزومات

#### `js/modules/material-planning.js`
- توابع کمکی `escape()`, `unwrap()`, `canEdit()`, `open()`, `showError()`, `resetForm()`, `renderSpecs()`, `renderHistory()`.
- خواندن مشخصات: `GET /projects/:projectId/material-specifications`.
- خواندن تاریخچه محاسبات: `GET /projects/:projectId/material-calculations`.
- ایجاد مشخصات: `POST /projects/:projectId/material-specifications`.
- ویرایش/ثبت نسخه: `PUT /material-specifications/:specId`.
- پس از ذخیره، مشخصات و تاریخچه محاسبات دوباره دریافت و رندر می‌شوند.
- این فرم برای پروژه ذخیره‌شده از مسیر API استفاده می‌کند؛ فرم پیش‌نویس در زمان ایجاد پروژه در `Projects.openDraftMaterialSpecsForm()` مسیر جداگانه دارد و باید هر دو رفتار حفظ شوند.

### 5) هسته API و مسیریابی فرانت‌اند

#### `js/core/api.js`
- `Api.request(method, path, options)`, `get()`, `post()`, `put()`, `delete()`, `getCached()`, `getFresh()`, `extractData()`, `invalidate()`, `invalidateMany()`.
- مسیرها از طریق پارامتر `path` به endpoint Apps Script ارسال می‌شوند.
- برای عملیات پیوست باید از همین لایه API استفاده شود، نه `fetch()` خام؛ در نتیجه توکن، مدیریت خطا و وضعیت همگام‌سازی موجود حفظ می‌شود.

#### `js/core/router.js`
- `Router.pages`, `loadPage()`, `initPageModule()`, `navigate()`, `hasRouteAccess()`, `getUser()`, `isAdmin()`.
- مسیر مشاهده پروژه با hash از نوع `#project-detail/:id` استفاده می‌شود.
- مجوزها از `Router.permissions` خوانده می‌شوند؛ منوی جدید نباید جای کنترل دسترسی بک‌اند را بگیرد.

### 6) قراردادهای API و ساختار داده تأییدشده

| عملیات | روش و مسیر | ورودی/خروجی شناخته‌شده |
|---|---|---|
| دریافت پروژه | `GET /projects/:projectId` | خروجی شامل شیء پروژه؛ فرانت‌اند wrapperهای `data` و `project` را normalize می‌کند. |
| فهرست پیوست‌های پروژه | `GET /projects/:projectId/attachments` | فهرست پیوست‌ها؛ فیلدهای مورد استفاده شامل `ID`, `EntityType`, `EntityID`, `FileName`, `FileSize`, `MimeType`, `Status` هستند. |
| فهرست تصاویر کارت | `GET /project-card-images` | فراداده تصاویر پروژه؛ نیازمند `PROJECT_VIEW` و `ATTACHMENT_VIEW`. |
| بارگذاری پیوست پروژه | `POST /projects/:projectId/attachments` | payload موجود در ابزار تست: `{ FileName, MimeType, Base64 }`. |
| دانلود پیوست | `GET /attachments/:attachmentId/download` | برای دریافت فایل موجود. |
| دریافت جزئیات پیوست | `GET /attachments/:attachmentId` | در ماژول داشبورد استفاده شده است. |
| حذف پیوست | `DELETE /attachments/:attachmentId?reason=...` | دلیل حذف به‌عنوان query ارسال می‌شود. |
| مشخصات مصرف ملزومات | `GET /projects/:projectId/material-specifications` | فهرست مشخصات مصرف. |
| ثبت مشخصات مصرف | `POST /projects/:projectId/material-specifications` | payload مشخصات فرم مصرف ملزومات. |
| ویرایش/ثبت نسخه مشخصات | `PUT /material-specifications/:specId` | payload فرم مشخصات. |
| تاریخچه محاسبات ملزومات | `GET /projects/:projectId/material-calculations` | تاریخچه محاسبات. |
| رنگ‌بندی/سایزبندی | `GET /projects/:projectId` و فیلد `ColorSizeJSON` | JSON با `colors` و `sizes`؛ ذخیره پروژه از جریان موجود ایجاد/ویرایش انجام می‌شود. |

نکات بک‌اند:
- در `Saeidesl/PRSPRO2BACKEND/Router.js` مسیر `GET /project-card-images` به `AttachmentService.listProjectImages(params)` وصل است و `PROJECT_VIEW` و `ATTACHMENT_VIEW` می‌خواهد.
- مسیر `GET /projects/:projectId/attachments` به `AttachmentService.listByEntity('PROJECT', projectId, params)` وصل است و `ATTACHMENT_VIEW` می‌خواهد.
- مسیرهای `/projects/:projectId/material-specifications` و `/projects/:projectId/material-calculations` به `MaterialPlanningService` وصل هستند.
- مسیر دقیق سرویس‌ها اکنون از روی فایل‌های مخزن تأیید شده است: `AttachmentService.js` و `AttachmentRepository.js` در ریشه مخزن بک‌اند؛ تعریف سرستون شیت پیوست‌ها در `DatabaseSetup.js` و بخش `ATTACHMENTS` قرار دارد.
- شیت فعلی `15_Attachments` این سرستون‌ها را دارد: `ID`, `TenantID`, `EntityType`, `EntityID`, `FileName`, `MimeType`, `FileSize`, `StorageProvider`, `StorageKey`, `UploadedBy`, `UploadedAt`, `Status`. هیچ فیلد `AttachmentType` یا `Category` در قرارداد ذخیره فعلی وجود ندارد؛ بنابراین نوع تصویر را نباید صرفاً از نام فایل یا ترتیب تاریخ آپلود استنباط کرد.

### 7) نیازمندی‌های رفتاری و معیار پذیرش

- منوی سه‌نقطه شامل هشت گزینه با آیکون و عنوان فارسی باشد: عکس پروفایل، عکس شناسنامه دوخت، عکس شناسنامه برش، مصرف ملزومات، رنگ‌بندی و سایزبندی، اشتراک‌گذاری، ذخیره و چاپ، تنظیمات.
- منو با صفحه‌کلید قابل استفاده باشد، فوکوس مشخص داشته باشد، با کلیک بیرون/Escape بسته شود و در موبایل از قاب صفحه بیرون نزند.
- عکس پروفایل تنها تصویر کارت پروژه باشد؛ دو تصویر شناسنامه فقط در جزئیات پروژه دیده شوند.
- بارگذاری/حذف تصویر، کش و پیش‌نمایش را به‌روز کند و به مجوزهای پیوست احترام بگذارد.
- دکمه‌های مصرف ملزومات و رنگ‌بندی/سایزبندی از کارت‌های صفحه پروژه‌ها حذف شوند؛ منو همان فرم‌ها و داده‌های قبلی را باز کند.
- تنظیمات فرم ایجاد پروژه از مسیر دکمه فعلی قابل دسترسی نباشد و کنترل تنظیمات در محل توافق‌شده به همان منطق موجود متصل شود؛ تنظیمات پیش‌فرض کاربر و تنظیمات یک پروژه با یکدیگر اشتباه نشوند.
- اشتراک‌گذاری با Web Share API در صورت پشتیبانی و در غیر این صورت با امکان کپی متن استاندارد کار کند؛ خطای لغو اشتراک‌گذاری نباید به‌عنوان خطای برنامه گزارش شود.
- چاپ از قالب اختصاصی فارسی/RTL با ابعاد A4، حاشیه مناسب، بدون کنترل‌های رابط کاربری و با امکان چاپ یا Save as PDF انجام شود.
- هیچ اطلاعات پروژه یا پیوستی بدون مجوز نمایش داده نشود و خطاهای API قابل فهم نمایش داده شوند.
- آزمون‌های ایستا/DOM و بررسی مرورگر برای منو، فرم‌ها، بارگذاری فایل، چاپ، اشتراک‌گذاری و حالت موبایل انجام شود.

### 8) تصمیم‌های نهایی تسک ۲ — قرارداد پیوست و یکپارچگی منو

#### قرارداد نوع تصویر (Source of Truth)
- منبع حقیقت نوع تصویر باید فیلد صریح و پایدار `AttachmentType` در رکورد پیوست باشد؛ مقدارهای مجاز برای این قابلیت:
  - `PROFILE`: تنها نوع مجاز برای تصویر کارت پروژه.
  - `SEWING_PASSPORT`: تصویر شناسنامه دوخت؛ فقط در جزئیات پروژه نمایش داده شود.
  - `CUTTING_PASSPORT`: تصویر شناسنامه برش؛ فقط در جزئیات پروژه نمایش داده شود.
- این فیلد در نسخه فعلی قرارداد ذخیره/پاسخ وجود ندارد. پیاده‌سازی باید آن را به شیت `15_Attachments` و مسیرهای upload/list اضافه کند؛ تا آن زمان، هیچ نوعی را از روی اسم فایل یا زمان آپلود تشخیص ندهیم.
- برای سازگاری با تصاویر قدیمی، در مرحله پیاده‌سازی باید رفتار legacy صریح باشد: پیوست تصویری قدیمی فاقد `AttachmentType` فقط با یک قاعده سازگاری مشخص به `PROFILE` نگاشت شود؛ نگاشت باید در بک‌اند واحد باشد و در فرانت‌اند تکرار نشود. پیش از فعال‌کردن آن، تست شود که یک تصویر قدیمی به اشتباه به‌عنوان شناسنامه نمایش داده نمی‌شود.
- payload بارگذاری فعلی `{ FileName, MimeType, Base64 }` است و Router مقدارهای `EntityType='PROJECT'` و `EntityID` را اضافه می‌کند. قرارداد جدید باید `AttachmentType` را نیز از فرانت‌اند بپذیرد و اعتبارسنجی سمت بک‌اند انجام دهد.
- `GET /project-card-images` باید فقط پیوست‌های `AttachmentType='PROFILE'` را برگرداند؛ انتخاب آخرین تصویر از میان همه تصاویر پروژه بدون تفکیک نوع، دیگر معتبر نیست.
- `GET /projects/:projectId/attachments` برای فهرست کامل پیوست‌های پروژه باقی می‌ماند و باید `AttachmentType` را در metadata بازگرداند. دانلود/حذف از مسیرهای فعلی استفاده می‌کنند و مجوزهای فعلی همچنان اجباری‌اند.

#### مسیرها و فایل‌های بک‌اند تأییدشده
- `Router.js`: `GET /project-card-images` به `AttachmentService.listProjectImages(params)` وصل است؛ `GET /projects/:projectId/attachments` به `AttachmentService.listByEntity('PROJECT', projectId, params)` وصل است؛ `POST /projects/:projectId/attachments` با قراردادن `EntityType='PROJECT'` و `EntityID`، `AttachmentService.upload(body, params)` را فراخوانی می‌کند؛ `GET /attachments/:attachmentId/download` به `AttachmentService.download` و حذف به `AttachmentService.delete` می‌رسد.
- `AttachmentService.js`: `listProjectImages`, `upload`, `listByEntity`, `download`, `delete`; کنترل tenant و دسترسی پروژه در سرویس انجام می‌شود.
- `AttachmentRepository.js`: `SHEET_NAME='15_Attachments'`, توابع `getAll`, `findById`, `findByEntity`, `insert`, `update`.
- `DatabaseSetup.js`: تعریف `ATTACHMENTS.headers`؛ برای اضافه‌کردن `AttachmentType` باید مسیر ارتقای سرستون‌های موجود بررسی شود تا داده‌های قبلی/ترتیب ستون‌ها خراب نشود.
- `AttachmentValidator.js` (مسیر ریشه باید در تسک پیاده‌سازی بررسی شود): `AttachmentService.upload` ابتدا `AttachmentValidator.validateCreate(data)` را اجرا می‌کند؛ اعتبارسنجی نوع جدید باید آنجا یا در یک لایه دامنه واحد اضافه شود. مسیر دقیق این فایل در این بررسی هنوز fetch نشده است.

#### تصمیم یکپارچگی منوی سه‌نقطه
- منو باید از نظر هشت گزینه، عنوان‌ها، مجوزهای نمایش، قرارداد `data-action` و رفتار دسترس‌پذیری یکسان باشد؛ اما دو نقطه رندر فعلی جدا هستند: `Projects.render()` در `js/modules/projects.js` و `Dashboard.renderProjectCard(project)` در `js/modules/dashboard-redesign.js`.
- در تسک ۳، منطق مشترک منو تا حد امکان در helper/module مشترک پیاده می‌شود و هر دو کارت آن را مصرف می‌کنند؛ از کپی‌کردن دو مجموعه handler مستقل و ناسازگار خودداری می‌شود. اگر ساختار بارگذاری ماژول‌ها اجازه helper مشترک ندهد، قرارداد markup/attribute و handlerها دقیقاً همسان می‌مانند و محدودیت در log ثبت می‌شود.
- هر منو باید به شناسه پروژه خودش متصل باشد، در هر لحظه فقط یک منو باز بماند، با کلیک بیرون و Escape بسته شود، `aria-expanded` و `aria-controls` را به‌روز کند و در صفحه‌کلید قابل استفاده باشد.
- منوی داشبورد فعلی placeholder است؛ منوی صفحه پروژه‌ها نیز باید به همان قرارداد وصل شود. عملیات فعلی «مصرف ملزومات» و «رنگ‌بندی و سایز» باید به توابع موجود منتقل شوند، نه اینکه منطق فرم دوباره‌نویسی شود.
- این تسک صرفاً قرارداد و نقشه را نهایی می‌کند؛ هنوز هیچ فایل کد اصلی تغییر نمی‌کند. پیاده‌سازی از تسک ۳ به بعد انجام می‌شود.

## فهرست تسک‌ها

- [x] **تسک ۱ — بررسی ساختار و تهیه نقشه فنی**: بررسی فرانت‌اند و بک‌اند، شناسایی فایل‌ها/توابع/APIها، ثبت محدودیت‌ها و وابستگی‌ها در بخش بالا.
- [x] **تسک ۲ — نهایی‌سازی قرارداد نوع پیوست و رفتار منوی سه‌نقطه**: تعیین منبع حقیقت برای نوع عکس‌ها و مشخص‌کردن اینکه منو در کارت‌های صفحه پروژه‌ها و داشبورد چگونه یکپارچه شود؛ تأیید مسیرهای دقیق سرویس‌های پیوست در بک‌اند پیش از کدنویسی.
  - *Log:* فقط `TODO1.md` تغییر کرد. در `AttachmentService.js`، `AttachmentRepository.js`، `AttachmentValidator.js` و `DatabaseSetup.js` قرارداد فعلی پیوست بررسی شد؛ مشخص شد شیت `15_Attachments` فعلاً `AttachmentType` ندارد. قرارداد هدف `PROFILE`، `SEWING_PASSPORT` و `CUTTING_PASSPORT` و رفتار endpoint تصویر کارت ثبت شد. برای `Projects.render()` و `Dashboard.renderProjectCard()` قرارداد منوی همسان با بستن بیرون/Escape و ARIA تعریف شد؛ فایل‌های اصلی کد در این تسک تغییر نکردند.
- [x] **تسک ۳ — تکمیل UI منوی عملیات پروژه**: هشت گزینه با آیکون، رفتار صفحه‌کلید، کلیک بیرون/Escape، واکنش‌گرایی و دسترسی‌پذیری.
  - *Log:* با تأیید کاربر پس از تست، مرحله UI بسته شد. در `js/modules/projects.js` منوی ۸ گزینه‌ای، وضعیت باز/بسته، پیمایش صفحه‌کلید، بستن با کلیک بیرون/Escape و بازشدن رو به بالا هنگام کمبود فضای پایین کارت پیاده شد؛ در `js/modules/dashboard-redesign.js` همین قرارداد منو اعمال و clipping کارت با اصلاح `overflow`/`z-index` رفع شد. در `index.html` و `pages/dashboard.html` نسخه‌گذاری cache-busting اسکریپت‌ها به `20261028-project-menu-4` تغییر کرد. کاربر نمایش صحیح منو را تأیید کرد.
- [x] **تسک ۴ — انتقال عملیات موجود به منو**: حذف دکمه‌های مصرف ملزومات و رنگ‌بندی/سایزبندی از کارت‌ها و اتصال منو به فرم‌های موجود بدون شکستن جریان ایجاد پروژه.
  - *Log:* در `js/modules/projects.js` دکمه‌های کارت `.project-material-specs-button` و `.project-color-size-button` حذف شدند و listener رویداد `pms:project-menu-action` گزینه‌های `material-specs` و `color-size` را به فرم‌های موجود متصل کرد. در `js/modules/material-planning.js` تابع `open(projectId)` از طریق `window.PMS.MaterialPlanning.open` منتشر شد؛ منطق فرم و endpointها حفظ شدند. در `index.html` و `pages/dashboard.html` کلیدهای cache-busting به `20261028-project-actions-1` تغییر کرد. بررسی نحوی JavaScript موفق بود و کاربر عملکرد هر دو گزینه در صفحه پروژه‌ها و داشبورد را تأیید کرد.
- [x] **تسک ۵ — بازطراحی بارگذاری و طبقه‌بندی تصاویر پروژه**: افزودن/انتخاب عکس پروفایل، شناسنامه دوخت و شناسنامه برش؛ حفظ مجوزها، کش، حذف و به‌روزرسانی تصویر کارت.
  - *Log:* در فرانت‌اند فایل `js/modules/project-images.js` اضافه شد تا بارگذاری و فهرست‌کردن تصاویر بر اساس `AttachmentType`های `PROFILE`، `SEWING_PASSPORT` و `CUTTING_PASSPORT` انجام شود؛ در `js/modules/projects.js` انتخاب تصویر کارت به نوع `PROFILE` (و داده‌های قدیمیِ بدون نوع) محدود شد و `index.html` برای بارگذاری ماژول نسخه‌گذاری شد. در بک‌اند، `AttachmentValidator.js` نوع‌های مجاز را اعتبارسنجی می‌کند، `AttachmentService.js` نوع تصویر را هنگام آپلود ذخیره می‌کند و `listProjectImages` تصاویر پروفایل/قدیمی را برای کارت برمی‌گرداند؛ `DatabaseSetup.js` نیز `AttachmentType` را بعد از `Status` در سرستون‌های `15_Attachments` تعریف می‌کند. کاربر ستون را دستی اضافه کرد و تأیید کرد اختلاط تصاویر برطرف شده است. بررسی نحوی فایل‌های اصلی قبلاً موفق بود؛ آزمون مستقل مرورگر/API در این مرحله انجام نشده است.
- [x] **تسک ۶ — نمایش تصاویر شناسنامه در مشاهده پروژه**: افزودن بخش‌های جداگانه و مدیریت حالت بارگذاری/خالی/خطا/پیش‌نمایش.
  - *Log:* در `pages/project-detail.html` دو بخش مستقل با شناسه‌های `project-detail-sewing-passport` و `project-detail-cutting-passport` اضافه شد. در `js/modules/project-detail.js` توابع `loadProjectPassportImages(forceRefresh)`, `previewProjectPassportImage(attachmentId, label)`, `bindProjectPassportImageEvents()` و `ensureProjectPassportStyles()` اضافه شدند؛ تصاویر از `GET /projects/:id/attachments` بر اساس `AttachmentType` تفکیک و با `GET /attachments/:id/download` پیش‌نمایش داده می‌شوند. حالت بارگذاری، خالی، خطا/تلاش مجدد، مجوز `ATTACHMENT_VIEW` و نمایش واکنش‌گرا پیاده شد. در `index.html` کلید cache-busting به `20261028-project-passport-images-1` تغییر کرد. بررسی نحوی JS موفق بود و کاربر نمایش تصاویر را تأیید کرد؛ تست مرورگر طبق تأیید کاربر انجام شده است.
- [x] **تسک ۷ — انتقال تنظیمات فرم ایجاد پروژه**: حذف دکمه سربرگ فعلی و اتصال کنترل تنظیمات به همان منطق مشترک؛ تفکیک تنظیمات پیش‌فرض کاربر از تنظیمات پروژه ذخیره‌شده.
  - *Log:* در `js/modules/projects.js` بخش دکمه تنظیمات از فرم ایجاد/ویرایش حذف شد و listener آن در صورت نبود دکمه ایمن شد. مسیر منوی `pms:project-menu-action` برای `settings` با گزینه `{ settingsOnly: true }` به `openProjectEditForm(projectId, options)` وصل شد؛ `openProjectEditForm` پروژه را از `GET /projects/:id` تازه می‌خواند و `openCreateForm(project, options)` را با حالت تنظیمات‌محور باز می‌کند. در این حالت پنجره تنظیمات به‌صورت مستقیم نمایش داده می‌شود، فرم کامل پشت آن مخفی است و ثبت تنظیمات از submit اصلی فرم پروژه عبور می‌کند تا داده‌ها از API پروژه ذخیره شوند؛ بستن پنجره یا Escape نیز مودال موقت را پاک می‌کند. تنظیمات پیش‌فرض کاربر در localStorage در حالت ایجاد پروژه باقی مانده و از تنظیمات پروژه ذخیره‌شده جداست. `index.html` cache-busting به `20261028-project-settings-4` تغییر کرد. بررسی نحوی JavaScript موفق بود و کاربر عملکرد را تأیید کرد؛ تست مرورگر/API مستقل انجام نشده است.
- [x] **تسک ۸ — اشتراک‌گذاری استاندارد پروژه**: آماده‌سازی متن ساختاریافته از اطلاعات مجاز پروژه، استفاده از Web Share API و fallback کپی.
  - *Log:* در `js/modules/projects.js` تابع `shareProject(projectId)` اضافه شد؛ پروژه از `Projects.projects` خوانده می‌شود و در نبود داده، از `GET /projects/:id` دریافت می‌شود. متن اشتراک‌گذاری شامل کد، عنوان، وضعیت، مرحله، تعداد و لینک جزئیات پروژه است و فیلدهای تنظیمات/کاربران مجاز را در بر نمی‌گیرد. Web Share API در صورت وجود اجرا می‌شود؛ در غیر این صورت `navigator.clipboard.writeText` و سپس textarea/`document.execCommand('copy')` و در آخر پنجره کپی دستی استفاده می‌شود. `AbortError` بدون خطای کاربر مدیریت می‌شود. رویداد `pms:project-menu-action` برای `share` به تابع جدید متصل شد تا منوی صفحه پروژه‌ها و داشبورد هر دو از آن استفاده کنند. در `index.html` نسخه `projects.js` به `20261028-project-share-1` و در `pages/dashboard.html` نسخه `dashboard-redesign.js` به `20261028-project-share-1` تغییر کرد. بررسی نحوی JavaScript موفق بود و کاربر عملکرد اشتراک‌گذاری را تأیید کرد؛ اجرای مستقل تست مرورگر در این محیط انجام نشده است.
- [x] **تسک ۹ — قالب ذخیره و چاپ A4/PDF**: طراحی قالب چاپی RTL، انتخاب فیلدهای مناسب، کنترل page-break و حذف عناصر غیرچاپی.
  - *Log:* در `js/modules/projects.js` تابع `printProject(projectId)` اضافه شد؛ اطلاعات پروژه را از کش ماژول یا `GET /projects/:id` می‌گیرد و پنجره چاپ مستقل با قالب فارسی RTL، جدول مشخصات پروژه، حاشیه و اندازه A4، محافظت از ردیف‌ها در page-break، و دکمه‌های چاپ/بستن می‌سازد. عناصر کنترلی در چاپ پنهان می‌شوند و پس از بارگذاری پنجره، `window.print()` اجرا می‌شود تا کاربر بتواند چاپ کند یا Save as PDF را انتخاب کند. رویداد `pms:project-menu-action` برای `print` به تابع متصل شد. در `index.html` و `pages/dashboard.html` نسخه‌گذاری cache-busting به `20261028-project-print-1` تغییر کرد. بررسی نحوی JavaScript با `new Function(content)` موفق بود؛ کاربر پس از تست، عملکرد را تأیید کرد.
- [x] **تسک ۱۰ — تست یکپارچه و اصلاح خطاها**: بررسی ایستا و آزمون کاربر برای مسیرهای اصلی منو، تصاویر، موبایل، چاپ و اشتراک‌گذاری.
  - *Log:* نحو JavaScript در ۹ فایل فرانت‌اند و بک‌اند بررسی‌شده بدون خطا بود. بررسی ایستا وجود گزینه چاپ در کارت پروژه و داشبورد، ارسال `AttachmentType`، تفکیک دو نوع شناسنامه، کنترل مجوز endpoint تصاویر و نسخه‌گذاری cache-busting را تأیید کرد. کاربر اعلام کرد در آزمون نسخه آزمایشی خطایی مشاهده نشده است. آزمون خودکار مستقل end-to-end و همه حالت‌های منفی API در این محیط اجرا نشدند؛ این محدودیت ثبت می‌شود.
- [x] **تسک ۱۱ — گزارش نهایی و آماده‌سازی برای تست کاربر**: مرور تغییرات و سوابق commit، بررسی حفظ قابلیت‌های قبلی و ارائه گزارش نهایی با لینک کامیت‌ها.
  - *Log:* سوابق commitهای تسک‌های اشتراک‌گذاری و چاپ بررسی شد. تغییرات چاپ محدود به افزودن `printProject(projectId)` در `js/modules/projects.js` و به‌روزرسانی cache-busting در `index.html` و `pages/dashboard.html` بود؛ commitهای cache-busting فقط همان ارجاع نسخه اسکریپت را تغییر می‌دهند. commitهای اشتراک‌گذاری و چاپ جداگانه ثبت شده‌اند. در بررسی commitهای مربوط به چاپ/اشتراک‌گذاری، تغییری در فایل‌های بک‌اند یا حذف فایل اصلی مشاهده نشد. کاربر اعلام کرد آزمون نسخه آزمایشی بدون خطا بود. این جمع‌بندی به معنی اجرای تست خودکار end-to-end در محیط حاضر نیست.

## Implementation Logs

- *Log تسک ۱:* فقط `TODO1.md` ایجاد شد؛ نقشه فنی اولیه و فهرست ۱۱ تسک ثبت شد. فایل‌های اصلی کد تغییر نکردند.
- *Log تسک ۲:* فقط `TODO1.md` تکمیل شد؛ قرارداد نوع پیوست و یکپارچگی منوی سه‌نقطه بر اساس بررسی فایل‌های واقعی بک‌اند و فرانت‌اند ثبت شد. فایل‌های اصلی کد تغییر نکردند.
