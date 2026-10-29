# TODO1 — فضای کاری فعال: یکپارچه‌سازی و استانداردسازی ظاهر بخش پروژه‌ها

> تاریخ شروع: 2026-10-29  
> مخزن فرانت‌اند: `Saeidesl/PRSPRO2`، شاخه `main`.  
> مخزن بک‌اند مرتبط: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.  
> هدف این فاز، یکپارچه‌سازی بصری مرحله‌به‌مرحله بخش پروژه‌هاست؛ ابتدا صفحه فهرست پروژه‌ها، سپس فرم‌های ایجاد/ویرایش و بعد زیرصفحات مرتبط.  
> این فایل جایگزین محتوای قبلی TODO1.md شده است؛ فایل‌های کد و ARCHITECTURE.md در مرحله بررسی تغییر نکرده‌اند.  
> نکته مخزن: در ریشه فرانت‌اند `ARCHITECTURE.md` وجود دارد؛ `TODO.md` در فرانت‌اند پیدا نشد. `TODO.md` بک‌اند متعلق به فاز تأمین ملزومات است و در این کار تغییر نمی‌کند.

## وضعیت اجرا

- [x] تسک ۱ — بررسی معماری و کدهای مرتبط و تهیه نقشه فنی
  - *Log:* فایل‌های `ARCHITECTURE.md`، `AGENTS.md` و `TODO1.md` فرانت‌اند، دستورالعمل `AGENTS.md` و `TODO.md` بک‌اند، صفحه پروژه‌ها، داشبورد، جزئیات پروژه، ماژول‌های پروژه، API/router، CSS مشترک و مسیرهای API سمت سرور بررسی شدند. نقشه فنی، قراردادهای موجود و تسک‌های مرحله‌ای در همین فایل ثبت شد. هیچ فایل کد یا API تغییر نکرد.
- [x] تسک ۲ — استانداردسازی صفحه اصلی «پروژه‌ها»
  - *Log:* فایل `pages/projects.html` با پوسته معنایی صفحه، سربرگ و نوار فیلتر استاندارد شد و شناسه‌های سازگار با ماژول فعلی حفظ شدند؛ فایل جدید `css/projects-page.css` برای صفحه فهرست، جست‌وجو/فیلتر، کارت‌ها، حالت‌های واکنش‌گرا و کاهش حرکت اضافه شد؛ `index.html` برای بارگذاری CSS جدید با نسخه cache-busting به‌روزرسانی شد. `js/modules/projects.js` و APIهای بک‌اند تغییر نکردند. بررسی ایستا تأیید کرد شناسه‌های حیاتی هرکدام یک‌بار در صفحه وجود دارند و لینک CSS در `index.html` ثبت شده است؛ آزمون واقعی مرورگر انجام نشده است.
- [ ] تسک ۳ — یکپارچه‌سازی فرم ایجاد پروژه و فرم ویرایش پروژه (IN PROGRESS)
- [ ] تسک ۴ — استانداردسازی پنجره‌ها و فرم‌های جانبی مرتبط با پروژه (تنظیمات، رنگ‌بندی/سایزبندی، ملزومات و فایل‌ها)
- [ ] تسک ۵ — استانداردسازی صفحه جزئیات پروژه
- [ ] تسک ۶ — همسان‌سازی کارت‌های پروژه و نمایش مرتبط در داشبورد
- [ ] تسک ۷ — یکپارچه‌سازی حالت‌های مشترک رابط کاربری (بارگذاری، خطا، خالی، وضعیت، دکمه‌ها، فیلترها و پیام‌ها)
- [ ] تسک ۸ — بازبینی واکنش‌گرایی موبایل/دسکتاپ، RTL فارسی، تم روشن/تیره و دسترس‌پذیری در کل بخش پروژه‌ها
- [ ] تسک ۹ — آزمون رگرسیون و کنترل نهایی ظاهر و رفتار؛ ثبت نتایج و فهرست موارد باقی‌مانده

---

# Technical Spec & Architecture Map

## 1. محدوده و اصول اجرا

- فقط بخش پروژه‌ها و اجزای مشترکی که واقعاً در نمایش این بخش استفاده می‌شوند در محدوده‌اند؛ بازطراحی بخش‌های نامرتبط ممنوع است.
- اجرای تغییرات به ترتیب تسک‌ها انجام می‌شود. تسک ۲ فقط صفحه فهرست پروژه‌ها را هدف می‌گیرد؛ فرم‌ها و زیرصفحات در تسک‌های بعدی تغییر خواهند کرد.
- قبل از هر تغییر کد در هر تسک، فایل‌ها و قراردادهای همان محدوده دوباره بررسی می‌شوند. پس از هر تسک، تغییرات و نتیجه تست برای تأیید گزارش می‌شود؛ تا پیش از تأیید کاربر، وضعیت TODO به تسک بعدی منتقل نمی‌شود.
- حفظ رفتار و قرارداد API فعلی، دسترسی‌ها، اطلاعات پروژه، منوی عملیات، تصاویر، فیلتر و جست‌وجو، وضعیت‌های قابل تنظیم، تاریخ شمسی، RTL و تم روشن/تیره الزامی است.
- الگوی طراحی موجود در `css/unified-theme.css`، توکن‌های معنایی و سبک GitHub Primer-inspired مبنای مشترک است. از تعریف رنگ، فاصله، شعاع یا استایل موازی بدون ضرورت خودداری شود.
- فرانت‌اند از HTML/CSS/JavaScript ساده استفاده می‌کند؛ ماژول‌ها از طریق `window.PMS` با هم ارتباط دارند و صفحات را `js/core/router.js` بارگذاری می‌کند.
- بک‌اند Google Apps Script V8 و Google Sheets است. ظاهر جدید نباید به تغییر API یا schema منجر شود مگر اینکه ضرورت فنی اثبات و جداگانه تأیید شود.

## 2. فایل‌های فرانت‌اند — صفحه اصلی و کارت پروژه‌ها

### `pages/projects.html`
- صفحه فعلی فهرست پروژه‌ها.
- عناصر کلیدی: `.page-section`, `.page-header`, `#project-create-button`, `#project-status-filter`, `#project-search`, `#projects-loading`, `#projects-error`, `#projects-table-container`, `#projects-empty`.
- صفحه یک پوسته HTML دارد و محتوای کارت‌ها در ماژول جاوااسکریپت رندر می‌شود.

### `js/modules/projects.js`
- ماژول اصلی فهرست پروژه‌ها؛ فایل نسبتاً بزرگ و شامل منطق UI و فرم‌هاست، بنابراین تغییرات باید محدود و هدفمند باشند.
- `Projects.init()`: استایل اختصاصی، رویدادها و کنترل مجوزها را آماده می‌کند؛ بارگذاری فهرست را فقط برای کاربر دارای `PROJECT_VIEW` انجام می‌دهد و دکمه ایجاد را بر اساس `PROJECT_CREATE` کنترل می‌کند.
- `Projects.ensureProjectStyles()`: تعدادی استایل کارت/منو/فرم را به‌صورت پویا به DOM اضافه می‌کند. این استایل‌های inline/runtime منبع احتمالی تفاوت با CSS مشترک هستند و باید در تسک صفحه اصلی بررسی شوند؛ انتقال یا حذف آن‌ها فقط پس از تعیین وابستگی انجام شود.
- `Projects.bindEvents()`: رویدادهای فیلتر وضعیت، جست‌وجو، ایجاد پروژه، منوی کارت و عملیات کارت را متصل می‌کند.
- `Projects.applyFilters()`: فیلتر وضعیت و متن جست‌وجو را اعمال می‌کند.
- رندر کارت‌ها در همین ماژول انجام می‌شود؛ کارت‌ها از کلاس‌های `.project-list-card`، `.project-list-card-main` و اجزای منوی `.project-list-card-menu` استفاده می‌کنند.
- رویداد سفارشی `pms:project-menu-action` برای اتصال عملیات منو استفاده می‌شود؛ قرارداد آن نباید در استانداردسازی ظاهری شکسته شود.
- منوی سه‌نقطه کارت شامل عملیات موجود پروژه است؛ رفتار صفحه‌کلید، Escape، کلیک بیرون، ARIA و بازشدن منو در فضای مناسب باید حفظ شود.
- توابع مرتبط با فرم/عملیات که در تسک‌های بعدی بررسی می‌شوند: `openCreateForm(project, options)`, `openProjectEditForm(projectId, options)`, `shareProject(projectId)`, `printProject(projectId)` و جریان عملیات منو.
- کارت می‌تواند تصویر پروفایل داشته باشد؛ فقط پیوست نوع `PROFILE` یا داده قدیمی سازگار باید تصویر بندانگشتی کارت باشد.

### `js/modules/dashboard-redesign.js`
- صفحه داشبورد پروژه‌ها، مستقل از فهرست `projects.html`، اما دارای کارت و منوی عملیات مشابه.
- توابع مهم: `Dashboard.init()`, `restoreState()`, `saveState()`, `renderShell()`, `bindEvents()`, `renderProjectCard(project)` و بارگذاری داده‌ها.
- وضعیت جست‌وجو، مرتب‌سازی، فیلترها، کارت‌های بازشده و اسکرول در `sessionStorage` با کلید `pms-dashboard-project-explorer-v2` حفظ می‌شود.
- در تسک ۶ ظاهر کارت‌ها و قرارداد منو با صفحه اصلی همسان می‌شود؛ منطق جست‌وجوی رویداد و حفظ وضعیت نباید ناخواسته تغییر کند.

### `pages/dashboard.html`
- پوسته داشبورد پروژه‌ها و بارگذاری `js/modules/dashboard-redesign.js`.
- نسخه‌گذاری فایل ماژول در انتهای صفحه انجام می‌شود؛ پس از تغییر فایل، cache-busting باید با الگوی فعلی هماهنگ شود.

## 3. فرم‌ها و زیرصفحات پروژه

### فرم ایجاد/ویرایش — `js/modules/projects.js` و `css/project-form.css`
- ایجاد و ویرایش در ماژول `Projects` پیاده شده و فرم‌ها/مودال‌ها در زمان اجرا ساخته می‌شوند؛ شناسه‌های فعلی شامل `#project-create-modal`, `#project-edit-modal`, `#project-color-size-modal`, `#project-draft-material-specs-modal` و `#project-create-form` هستند.
- `css/project-form.css` استایل‌های اختصاصی مودال، فیلدها، گروه‌های تنظیمات، کنترل‌های فرم و حالت واکنش‌گرا را دارد.
- تنظیمات پروژه و تنظیمات پیش‌فرض کاربر باید از هم جدا بمانند؛ رفتار حالت `settingsOnly` در `openProjectEditForm(projectId, options)` نباید تغییر کند.
- `js/modules/project-workflow-settings.js`: تنظیم گردش‌کار پیش‌فرض برای پروژه جدید را مدیریت می‌کند؛ ویرایش پروژه باید گردش‌کار موجود را حفظ کند. انتخاب گردش‌کار از فرم پروژه طبق تصمیم‌های قبلی کاربر در مسیر تنظیمات مربوطه مدیریت شده و نباید با تغییر ظاهر به فرم اصلی برگردد.
- `js/modules/material-planning.js`: پنجره مصرف/ملزومات پروژه؛ عملیات چندردیفی تعریف ملزومات باید کار کند.
- `js/modules/project-images.js`: فرم تصویر/فایل مرتبط با پروژه و اتصال عملیات منوی کارت.
- تغییرات این محدوده باید حفظ‌کننده اعتبارسنجی، پیام‌های فارسی، دکمه‌های ذخیره/لغو، وضعیت ذخیره و جلوگیری از ثبت تکراری باشد.

### جزئیات پروژه — `pages/project-detail.html` و `js/modules/project-detail.js`
- `ProjectDetail.init()`, `getProjectId()`, `bindEvents()`, `loadAuditHistory(forceRefresh)`, `loadProjectPassportImages(forceRefresh)` و توابع بارگذاری/نمایش اطلاعات و رویدادها.
- عناصر کلیدی: `#project-detail-loading`, `#project-detail-error`, `#project-detail-content`, `#project-detail-title`, `#project-detail-code`, `#project-detail-status`, `#project-detail-info`, `#project-detail-events`, `#project-detail-sewing-passport`, `#project-detail-cutting-passport` و بخش تاریخچه مدیریتی.
- صفحه دارای کارت مشخصات، شاخص‌ها، شناسنامه دوخت، شناسنامه برش، آخرین رویدادها و تغییرات مدیریتی است. ساختار معنایی و ترتیب اطلاعات باید در تسک ۵ یکدست شود.
- دکمه بازگشت به `#projects` و دکمه ثبت رویداد با مجوز `EVENT_CREATE` کار می‌کنند.

## 4. سیستم طراحی و پوسته مشترک

### `index.html`
- بارگذاری استایل‌ها به ترتیب فعلی: `css/variables.css`, `css/main.css`, `css/forms.css`, `css/layout.css`, `css/components.css`, `css/tables.css`, `css/responsive.css`, استایل‌های حوزه‌ای و در انتها `css/unified-theme.css`.
- ماژول‌های اصلی از جمله `js/core/api.js`, `js/core/theme.js`, `js/components/layout.js`, `js/core/router.js`, `js/modules/projects.js`, `js/modules/project-images.js`, `js/modules/material-planning.js` و `js/modules/project-detail.js` بارگذاری می‌شوند.
- هر تغییر در ترتیب یا نسخه فایل باید با وابستگی‌های موجود سازگار باشد.

### CSS
- `css/variables.css`: متغیرهای پایه فاصله و اندازه کنترل‌ها مانند `--space-4` تا `--space-32`, `--control-height`, `--control-radius`.
- `css/unified-theme.css`: توکن‌های معنایی رنگ، پس‌زمینه، متن، مرز، سایه، شعاع و تم روشن/تیره؛ این فایل آخر بارگذاری می‌شود و برای همسان‌سازی اولویت دارد.
- `css/main.css`: پایه عمومی، کارت‌ها، کارت آماری و ساختارهای داشبورد.
- `css/layout.css`: پوسته برنامه، نوار کناری، سربرگ، ناوبری و اجزای layout.
- `css/components.css`: اجزای مشترک مانند دکمه، badge، alert و کنترل‌های UI.
- `css/forms.css`: فرم‌های عمومی.
- `css/project-form.css`: فرم‌های خاص پروژه.
- `css/responsive.css`: قواعد واکنش‌گرایی عمومی در عرض‌های مختلف.
- `css/dark-theme.css`: قواعد قدیمی/تکمیلی تم تاریک؛ اثر متقابل آن با `unified-theme.css` هنگام تغییرات بررسی شود.
- `css/tables.css`: جدول‌ها و حالت خالی.
- نکته فنی: بخشی از استایل کارت‌ها و فرم پروژه در `ensureProjectStyles()` به‌صورت رشته CSS تزریق می‌شود؛ CSSهای صفحه‌ای هم ممکن است بر همان عناصر override داشته باشند. پیش از ساخت استایل مشترک جدید باید اولویت cascade و ترتیب بارگذاری روشن شود.

### پوسته و مسیریابی
- `js/components/layout.js`: `Layout.navItems`, `getVisibleNavItems()`, `hasPermission()`, `renderNav()` و ساخت پوسته/ناوبری.
- `js/core/router.js`: نگاشت `Router.pages`، `routePermissions`, `loadPage()`, `initPageModule()`, `navigate()`, `hasRouteAccess()`; صفحه `projects` به `pages/projects.html` و `project-detail` به `pages/project-detail.html` متصل است.
- `js/core/theme.js`: `apply(theme, persist)`, `toggle()`, `updateControl()`, `init()`; تم با `data-theme` روی ریشه و کلید `pms-theme` در localStorage نگهداری می‌شود.

## 5. لایه API فرانت‌اند و قراردادهای پروژه

### `js/core/api.js`
- لایه مرکزی درخواست‌ها: `request(method, path, options)`, `get(path, options)`, `post(path, body, options)`, `put(path, body, options)`, `delete(path, options)`, `getCached(path, cacheKey, options)`, `getFresh(path, cacheKey, options)`, `extractData(response)`, `invalidate(cacheKey)`, `invalidateMany(cacheKeys)`.
- GETهای هم‌زمان با کلید درخواست شامل token/path/query و گزینه‌های retry/tracking ادغام می‌شوند؛ تغییر ظاهر نباید درخواست مستقیم موازی خارج از `PMS.Api` ایجاد کند.
- قرارداد کلی بک‌اند از `Response.success(data, meta?)` استفاده می‌کند و فرانت‌اند `extractData` برای استخراج داده دارد. بعضی کدهای قدیمی مستقیماً `response.success` و `response.data` را بررسی می‌کنند؛ هنگام تغییرات باید با شکل واقعی پاسخ همان مسیر سازگار ماند.
- کش‌ها در `js/core/cache.js` تعریف شده‌اند؛ پس از ایجاد/ویرایش باید invalidation موجود حفظ شود.

### APIهای پروژه در بک‌اند — `Saeidesl/PRSPRO2BACKEND`

#### `Router.js`
- `GET /projects`: الزام `PROJECT_VIEW`، سپس `ProjectService.list(params)`.
- `GET /projects/:projectId`: الزام `PROJECT_VIEW`، سپس `ProjectService.get(projectId, params)`.
- `GET /project-form/lookups`: الزام `PROJECT_CREATE`، سپس `ProjectService.projectFormLookups(params)`.
- `GET /project-card-images`: الزام `PROJECT_VIEW` و `ATTACHMENT_VIEW`، سپس `AttachmentService.listProjectImages(params)`.
- `GET /projects/:projectId/events`: الزام `EVENT_VIEW`، سپس `EventService.listByProject(projectId, params)`.
- `GET /projects/:projectId/details` و `GET /projects/:projectId/details/page/...`: الزام `EVENT_VIEW`، سپس سرویس جزئیات/صفحه‌بندی رویداد.
- `GET /projects/:projectId/attachments`: الزام `ATTACHMENT_VIEW`، سپس `AttachmentService.listByEntity('PROJECT', projectId, params)`.
- `GET /projects/:projectId/material-specifications` و `GET /projects/:projectId/material-calculations`: خواندن مشخصات مصرف و تاریخچه محاسبات از `MaterialPlanningService`؛ در Router مجوزهای `PROJECT_VIEW` یا `PROJECT_EDIT` بررسی می‌شوند.
- `POST /projects`: الزام `PROJECT_CREATE`، سپس `ProjectService.create(body, params)`.
- `PUT /projects/:projectId`: الزام `PROJECT_EDIT`، سپس `ProjectService.update(projectId, body, params)`.
- مجوز فرانت‌اند فقط برای نمایش کنترل است؛ کنترل امنیت واقعی در Router و سرویس بک‌اند باقی می‌ماند.

#### `ProjectService.js`, `ProjectRepository.js`, `ProjectValidator.js`
- `ProjectService.list(params)`: فهرست رکوردها را از `ProjectRepository.getAll()` می‌گیرد، سپس با `TenantID` و `_isProjectAvailableToUser_(project, user)` محدود می‌کند و `Response.success(tenantProjects)` می‌دهد.
- `ProjectService.get(id, params)`: پروژه را با `ProjectRepository.findById(id)` می‌خواند، tenant و دسترسی پروژه را کنترل می‌کند و `Response.success(project)` برمی‌گرداند.
- `ProjectService.create(project, params)`: `ProjectValidator.validateCreate(project)` را اجرا می‌کند، tenant را از کاربر جاری تعیین می‌کند، گردش‌کار/مرحله اول/واحدها/کاربران/وضعیت را اعتبارسنجی می‌کند، رکورد می‌سازد، audit ثبت می‌کند و `Response.success(created, {message})` می‌دهد.
- فیلدهای مهم ورودی ایجاد: `ProjectCode`، `Title`، `Quantity` اختیاری و صحیح مثبت، `ColorSizeJSON`، `Description`، `WorkflowID`، `AvailableDepartmentIDs[]` الزامی، `AllowedUserIDs[]` اختیاری، `NotifyEnabled` بولی و `Status` در صورت ارسال. `TenantID` از payload پذیرفته نمی‌شود؛ سرور آن را از نشست تعیین می‌کند.
- `ProjectService.update(id, data, params)`: `ProjectValidator.validateUpdate(data)` را اجرا می‌کند و tenant/دسترسی را کنترل می‌کند. کد پروژه و گردش‌کار پس از ایجاد هویت ثابت هستند. فیلدهای قابل تغییر را طبق منطق فعلی سرویس محدود می‌کند.
- `ProjectRepository.js`: `getAll()`, `findById(id)`, `findByProjectCode(projectCode)`, `insert(project)`, `updateById(id, data)`؛ اتصال به `GoogleSheetsRepository`.
- `ProjectValidator.js`: `validateCreate(data)`, `validateUpdate(data)`; اعتبارسنجی کد/عنوان، تعداد، توضیحات، گردش‌کار و مقادیر تنظیمات مربوطه.
- مدل پروژه شامل فیلدهای مهم `ID`, `TenantID`, `ProjectCode`, `Title`, `Quantity`, `ColorSizeJSON`, `Description`, `AvailableDepartmentIDs`, `AllowedUserIDs`, `NotifyEnabled`, `WorkflowID`, `WorkflowVersion`, `CurrentStepID`, `CurrentStepStatus`, `Status`, `CreatedBy`, `CreatedAt`, `UpdatedAt` است. مقدار برخی فیلدهای آرایه‌ای در شیت به شکل JSON string ذخیره می‌شود.
- APIها در این فاز فقط برای شناخت وابستگی‌ها ثبت شده‌اند؛ تسک استانداردسازی ظاهر نباید قرارداد ورودی/خروجی یا schema را بی‌دلیل تغییر دهد.

## 6. وابستگی‌ها و محدودیت‌های مهم

- منوی عملیات پروژه بین `js/modules/projects.js` و `js/modules/dashboard-redesign.js` هماهنگ است.
- فایل‌های مرتبط با تصاویر/پیوست‌ها: `js/modules/project-images.js`, `js/modules/attachments.js`, `AttachmentService.js`, `AttachmentRepository.js`, `AttachmentValidator.js` و endpointهای پیوست.
- جزئیات رویداد و تاریخچه به `js/modules/project-detail.js`, `EventService.js` و endpointهای جزئیات/رویداد وابسته است.
- نمایش واحدها، کاربران، گردش‌کار و وضعیت از lookupها و سرویس‌های موجود تغذیه می‌شود؛ برچسب وضعیت پروژه با مرحله گردش‌کار یکی نیست و این دو مفهوم نباید ادغام شوند.
- تاریخ‌ها در UI فارسی/شمسی ارائه می‌شوند؛ از تبدیل نمایشی به قالب میلادی در این فاز خودداری شود.
- از افزودن وابستگی خارجی، تغییر مدل داده، تغییر permission، تغییر منطق تولید/تأمین یا تغییر مسیر انتشار خارج از محدوده خودداری شود.
- `index.html` و `pages/dashboard.html` نسخه‌گذاری cache-busting دارند؛ هر بار تغییر فایل ماژول باید بررسی شود که صفحه واقعاً نسخه جدید را بارگذاری کند.
- `AGENTS.md` فرانت‌اند توصیه می‌کند شاخه ویژگی و PR به‌جای تغییر مستقیم main استفاده شود؛ `AGENTS.md` بک‌اند هشدار می‌دهد merge به main ممکن است workflow همگام‌سازی/انتشار Apps Script را فعال کند. این فاز عمدتاً فرانت‌اند است و انتشار بک‌اند در محدوده نیست.

## 7. معیارهای پذیرش کلی فاز

- صفحه فهرست پروژه‌ها، فرم‌ها، پنجره‌های جانبی، کارت‌های داشبورد و جزئیات پروژه از نظر فاصله‌گذاری، تایپوگرافی، رنگ، border/radius، دکمه، ورودی، badge، حالت‌های بارگذاری/خطا/خالی و رفتار موبایل یکپارچه باشند.
- در تم روشن و تاریک کنتراست کافی باشد و رنگ‌ها از توکن‌های مشترک بیایند.
- رابط در عرض موبایل بدون اسکرول افقی ناخواسته، بریده‌شدن منو یا دکمه‌های خارج از صفحه کار کند.
- RTL، متن فارسی، تاریخ شمسی، منوی صفحه‌کلید، focus-visible و برچسب‌های دسترس‌پذیری حفظ شوند.
- ایجاد/ویرایش، جست‌وجو/فیلتر، بازکردن جزئیات، عملیات منو، نمایش تصاویر، تنظیمات، مصرف ملزومات و ثبت رویداد بدون رگرسیون باقی بمانند.
- فقط تست‌هایی که واقعاً اجرا شده‌اند گزارش شوند؛ بررسی ایستا به‌عنوان تست مرورگر یا end-to-end معرفی نشود.
