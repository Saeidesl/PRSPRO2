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
- جست‌وجوی فایل‌های پیاده‌سازی سرویس‌های بک‌اند در این بررسی از طریق جست‌وجوی فایل GitHub نتیجه قابل اتکایی نداد؛ پیش از هر تغییر بک‌اند، مسیر دقیق فایل‌های سرویس و قراردادهای نوع پیوست باید از درخت/کد مخزن تأیید شود.
- نوع پیوست برای «عکس پروفایل»، «شناسنامه دوخت» و «شناسنامه برش» هنوز قرارداد مستقلی در فرانت‌اند تأیید نشده است؛ تسک مربوطه باید ابتدا راه موجود برای metadata/category/type را بررسی کند و از فرض‌کردن نام فیلد API خودداری کند.

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

## فهرست تسک‌ها

- [x] **تسک ۱ — بررسی ساختار و تهیه نقشه فنی**: بررسی فرانت‌اند و بک‌اند، شناسایی فایل‌ها/توابع/APIها، ثبت محدودیت‌ها و وابستگی‌ها در بخش بالا.
- [ ] **تسک ۲ — نهایی‌سازی قرارداد نوع پیوست و رفتار منوی سه‌نقطه (IN PROGRESS)**: تعیین منبع حقیقت برای نوع عکس‌ها و مشخص‌کردن اینکه منو در کارت‌های صفحه پروژه‌ها و داشبورد چگونه یکپارچه شود؛ تأیید مسیرهای دقیق سرویس‌های پیوست در بک‌اند پیش از کدنویسی.
- [ ] **تسک ۳ — تکمیل UI منوی عملیات پروژه**: هشت گزینه با آیکون، رفتار صفحه‌کلید، کلیک بیرون/Escape، واکنش‌گرایی و دسترسی‌پذیری.
- [ ] **تسک ۴ — انتقال عملیات موجود به منو**: حذف دکمه‌های مصرف ملزومات و رنگ‌بندی/سایزبندی از کارت‌ها و اتصال منو به فرم‌های موجود بدون شکستن جریان ایجاد پروژه.
- [ ] **تسک ۵ — بازطراحی بارگذاری و طبقه‌بندی تصاویر پروژه**: افزودن/انتخاب عکس پروفایل، شناسنامه دوخت و شناسنامه برش؛ حفظ مجوزها، کش، حذف و به‌روزرسانی تصویر کارت.
- [ ] **تسک ۶ — نمایش تصاویر شناسنامه در مشاهده پروژه**: افزودن بخش‌های جداگانه و مدیریت حالت بارگذاری/خالی/خطا/پیش‌نمایش.
- [ ] **تسک ۷ — انتقال تنظیمات فرم ایجاد پروژه**: حذف دکمه سربرگ فعلی و اتصال کنترل تنظیمات به همان منطق مشترک؛ تفکیک تنظیمات پیش‌فرض کاربر از تنظیمات پروژه ذخیره‌شده.
- [ ] **تسک ۸ — اشتراک‌گذاری استاندارد پروژه**: آماده‌سازی متن ساختاریافته از اطلاعات مجاز پروژه، استفاده از Web Share API و fallback کپی.
- [ ] **تسک ۹ — قالب ذخیره و چاپ A4/PDF**: طراحی قالب چاپی RTL، انتخاب فیلدهای مناسب، کنترل page-break و حذف عناصر غیرچاپی.
- [ ] **تسک ۱۰ — تست یکپارچه و اصلاح خطاها**: تست مسیرهای موفق/ناموفق API، مجوزها، تصاویر هر نوع، کش، فرم‌ها، موبایل، چاپ و اشتراک‌گذاری؛ ثبت نتیجه در همین فایل.
- [ ] **تسک ۱۱ — گزارش نهایی و آماده‌سازی برای تست کاربر**: مرور diff، بررسی عدم حذف قابلیت قبلی، گزارش دقیق تغییرات و لینک کامیت‌ها؛ تا تأیید نقشه توسط کاربر، تسک‌های پیاده‌سازی آغاز نشوند.

## Implementation Logs

- هنوز هیچ تسک پیاده‌سازی کد انجام نشده است. تنها تغییر این مرحله ایجاد همین فایل TODO1.md است.
