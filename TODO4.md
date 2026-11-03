## 🎯 Current Objective

رفع مشکل انتقال اطلاعات انتخاب‌شده از پروژه مرجع هنگام ایجاد پروژه تکراری؛ اطلاعات مرکزی منتخب، از جمله اطلاعات چندردیفی ملزومات طراح، نمونه‌دوز و الگو‌ساز، باید بدون وابستگی به تأیید دستی به پروژه جدید منتقل شوند. رویدادها، سفارش‌ها، دریافت‌ها و مقادیر اجرایی پروژه جدید مستقل باقی بمانند.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه مجاز
- Frontend: `Saeidesl/PRSPRO2`، شاخه مجاز `feature/design-case-preproduction`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه مجاز `feature/design-case-preproduction`.
- `main` نباید مستقیماً تغییر کند.
- در زمان کشف، شاخه Frontend دارای ۲ commit جلو و ۴۲۴ commit عقب و شاخه Backend دارای ۱۲۴ commit عقب بود. اکنون هر دو شاخه با `main` همگام‌اند؛ Frontend شامل merge commit `b9f75de0b9d81ce23a206cea0b9a2cffc4bb8edd` و Backend شامل merge commit `4ebfe4445405b5e9e78364a754715931d9352d72` است. `main` تغییر نکرده است.
- `ARCHITECTURE.md` فرانت‌اند موجود است؛ `TODO4.md` در شاخه مجاز وجود نداشت و این فایل برای فاز حاضر ایجاد شد.

### مدل داده و جریان مورد انتظار
- پروژه تکراری از همان مسیر ایجاد پروژه استفاده می‌کند: `POST /projects`.
- پروژه جدید با `SourceProjectID` به پروژه مرجع متصل می‌شود و `ReferencePolicyJSON` سیاست هر نوع اطلاعات مرکزی را نگه می‌دارد.
- گروه‌های اطلاعات مرکزی در شیت‌های `28_InformationTypes` و `29_InformationTypeColumns` تعریف می‌شوند.
- مقادیر هر پروژه در `30_ProjectInformation` با `ProjectID`, `InformationTypeID`, `ValueJSON`, `Revision`, `Status` ذخیره می‌شوند؛ ساختار JSON باید آرایه‌ها و ردیف‌های چندگانه را بدون تخت‌سازی حفظ کند.
- تاریخچه اطلاعات در `31_ProjectInformationHistory` ثبت می‌شود.
- گزارش همگام‌سازی زنده در `38_ProjectReferenceSyncLog` ثبت می‌شود.
- اطلاعات ملزومات طراحی/نمونه‌دوز/الگو‌ساز و مصرف هر واحد که در اطلاعات مرکزی تعریف شده‌اند، از همین مدل اطلاعات مرکزی کپی می‌شوند؛ مسیر قدیمی ثبت ملزومات در فرم ایجاد پروژه نباید مبنای کپی باشد.
- داده‌های اجرایی پروژه جدید شامل رویدادها، سفارش‌ها، دریافت‌ها، نیازهای محاسبه‌شده و گزارش‌های تاریخی از پروژه مرجع کپی نمی‌شوند.

### فایل‌ها و توابع Frontend
- `js/modules/projects.js`
  - `Projects.openCreateForm(project, options)`: فرم موجود ایجاد پروژه.
  - فرم گردش‌کار REPEAT، انتخاب پروژه مرجع با `#new-project-reference` و انتخاب سیاست هر نوع اطلاعات با `[data-reference-override]`.
  - payload ایجاد پروژه شامل `WorkflowID`, `SourceProjectID`, `ReferencePolicyJSON` و سایر فیلدهای پروژه است.
- `js/modules/project-detail.js`
  - نمایش اطلاعات مرکزی پروژه از API اطلاعات پروژه؛ وضعیت همگام‌سازی و تعارض‌های مرجع در همین صفحه نمایش داده می‌شوند. اقدام دستی «تأیید نسخه مرجع» حذف شده؛ حل تعارض فقط بین استفاده از مقدار جاری منبع یا حفظ مقدار محلی انجام می‌شود.
- `js/modules/projects.js`
  - پس از ایجاد پروژه، تعداد اطلاعات مرکزی منتقل‌شده و تعداد فایل/تصویرهای منتقل‌نشده از `ReferenceCopySummary` به کاربر اعلام می‌شود.
- `js/modules/information-types.js`
  - تعریف انواع اطلاعات مرکزی و ستون‌های چندردیفی/پویا.
- `index.html`
  - بارگذاری ماژول‌ها و cache-busting فایل‌های تغییرکرده.
- `.github/workflows/deploy-pages-staging.yml`
  - root تولید از `main` حفظ می‌شود؛ مسیر `/staging/` فرانت‌اند شاخه `feature/design-case-preproduction` را با API آزمایشی منتشر می‌کند.

### فایل‌ها و توابع Backend
- `ProjectService.js`
  - `projectFormLookups(params)`: ارائه `referenceProjects` و `informationTypes` متناسب با Tenant و دسترسی کاربر.
  - `create(project, params)`: اعتبارسنجی Workflow از نوع REPEAT، کنترل مالکیت/دسترسی پروژه مرجع، ادغام سیاست‌ها، ایجاد پروژه جدید و کپی اطلاعات مرکزی منتخب.
  - `create(project, params)` اکنون برای سیاست‌های `INITIAL_COPY` و `LIVE_SYNC` مقدار جاری فعال `ValueJSON` را بدون وابستگی به سابقه `APPROVED` کپی می‌کند؛ آرایه‌ها/ردیف‌های چندگانه بدون تغییر حفظ می‌شوند. برای `LIVE_SYNC` رکورد اولیه `SYNCED` در `38_ProjectReferenceSyncLog` ایجاد می‌شود تا همگام‌سازی‌های بعدی idempotent باشند. نتیجه کپی در `created.ReferenceCopySummary` برمی‌گردد.
- `ProjectInformationService.js`
  - `list`, `get`, `save`, `approve` (legacy API), `_syncLiveReference_`, `_isFileBased_`.
  - مقدار جاری در `ValueJSON` ذخیره می‌شود؛ تاریخچه در `ProjectInformationRepository` ثبت می‌شود. `save` پس از ثبت موفق، `_syncLiveReference_` را برای همگام‌سازی زنده فرزندان فراخوانی می‌کند؛ تعارض با مقایسه revision جاری منبع/مقصد کنترل می‌شود و دیگر به تأیید دستی وابسته نیست.
  - اطلاعاتی که نوع داده یا ستون فعال آن `image`/`file` باشد فعلاً با وضعیت `SKIPPED_FILE` گزارش می‌شود؛ انتقال امن پیوست‌ها در محدوده فعلی پیاده‌سازی نشده و نباید metadata پیوست پروژه مرجع به مقصد کپی شود.
- `ProjectInformationRepository.js`
  - شیت‌های `30_ProjectInformation`, `31_ProjectInformationHistory`, `38_ProjectReferenceSyncLog`.
  - توابع `findByProject`, `findAnyByProjectAndType`, `findByProjectAndType`, `insert`, `update`, `findHistory`, `insertHistory`, `getAllSyncLogs`, `insertSyncLog`.
- `InformationTypeRepository.js`: دریافت انواع اطلاعات مرکزی و ستون‌های هر نوع.
- `DatabaseSetup.js`: تعریف schema شیت‌ها؛ هر تغییر باید افزایشی و idempotent باشد.
- `.github/workflows/sync-apps-script-staging.yml`: همگام‌سازی و انتشار دستی شاخه feature به پروژه Apps Script آزمایشی؛ ورودی‌ها `phase=push_only|push_and_deploy` و `confirm_staging_action=true` هستند. این مسیر به پروژه تولید وصل نیست.
- `Router.js`
  - `GET /project-form/lookups`
  - `POST /projects`
  - `GET /projects/:projectId/information`
  - `GET /projects/:projectId/information/:typeId`
  - `POST /projects/:projectId/information/:typeId`
  - `POST /projects/:projectId/information/:typeId/approve`
  - `POST /projects/:projectId/information/:typeId/resolve-reference`
  - مسیر اصلی ایجاد پروژه و ذخیره اطلاعات مرکزی باید حفظ شود؛ endpoint موازی ایجاد پروژه ساخته نشود.
- تمام عملیات باید Tenant-scoped، دسترسی‌محور، idempotent و دارای Audit/History باشند.

### قواعد قطعی محصول و ایمنی داده
- کپی اولیه بر اساس سیاست انتخاب‌شده برای هر نوع اطلاعات مرکزی انجام شود؛ انتخاب `INITIAL_COPY` باید مقدار جاری فعال را کپی کند و نباید به ثبت `APPROVED` وابسته باشد.
- ساختار `ValueJSON` عیناً حفظ شود تا تمام ردیف‌های چندردیفی و فیلدهای هر ردیف منتقل شوند.
- برای هر اطلاعات کپی‌شده در پروژه مقصد، شناسه و تاریخچه مستقل ساخته شود؛ `ProjectID` مقصد و `SourceEventID` خالی باشد.
- داده‌های مستقل پروژه جدید نباید با اطلاعات مرجع مخلوط یا جایگزین شوند.
- فایل/تصویر فقط پس از پیاده‌سازی انتقال امن Attachment و اصلاح شناسه‌های پیوست قابل کپی است؛ در غیر این صورت باید وضعیت روشن و قابل مشاهده ارائه شود، نه موفقیت کاذب.
- هیچ داده واقعی حذف یا بازنویسی نشود. آزمون‌ها فقط در محیط آزمایشی اجرا شوند.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف معماری و تشخیص علت**
  - *Log:* در شاخه مجاز Frontend فایل‌های `js/modules/projects.js`, `js/modules/workflows.js`, `js/modules/project-detail.js` و در Backend فایل‌های `ProjectService.js`, `ProjectRepository.js`, `ProjectValidator.js`, `MaterialPlanningService.js`, `Router.js` بررسی شدند. در نسخه `main`، فرم فرانت‌اند `SourceProjectID` و `ReferencePolicyJSON` را به `POST /projects` می‌فرستد؛ `ProjectService.create` اطلاعات مرکزی منتخب را فقط وقتی کپی می‌کند که سابقه `APPROVED` وجود داشته باشد. چون تأیید دستی بخشی از گردش کار واقعی کاربر نبوده، ردیف‌های بدون این سابقه بی‌صدا رد می‌شوند. کپی فایل/تصویر نیز صریحاً مستثنا شده است. شاخه مجاز فعلی فاقد بخش عمده این قابلیت است: Frontend نسبت به main، ۲ جلو/۴۲۴ عقب و Backend، ۱۲۴ عقب است. هیچ کد اجرایی یا داده‌ای تغییر نکرده است؛ فقط این فایل برنامه‌ریزی ایجاد شد.
- [ ] **تسک ۲ — اصلاح کپی اطلاعات مرکزی و همگام‌سازی زنده (IN PROGRESS)**
  - *Log:* همگام‌سازی baseline هر دو مخزن کامل شد و هر دو شاخه کاری نسبت به `main` بدون عقب‌ماندگی هستند؛ `main` تغییر نکرده است. Backend: `ProjectService.create` در `ProjectService.js` مقدار جاری `ValueJSON` را برای سیاست‌های `INITIAL_COPY` و `LIVE_SYNC` بدون وابستگی به سابقه تأیید کپی می‌کند، ساختار چندردیفی را حفظ می‌کند، برای هر رکورد تاریخچه مستقل می‌سازد و برای LIVE_SYNC لاگ اولیه idempotent ایجاد می‌کند؛ `ReferenceCopySummary` نتیجه و فایل‌های مستثناشده را برمی‌گرداند. `ProjectInformationService.save` پس از ذخیره، `_syncLiveReference_` را اجرا می‌کند؛ تعارض‌ها با revision جاری منبع/مقصد کنترل می‌شوند و انتخاب «حفظ محلی» در همگام‌سازی‌های بعدی بی‌صدا بازنویسی نمی‌شود. `tests/project-repeat-reference-copy.test.js` تست‌های رگرسیون این رفتارها را اضافه می‌کند. Frontend: `js/modules/projects.js` نتیجه کپی را به کاربر اعلام می‌کند؛ `js/modules/project-detail.js` تأیید دستی مرجع را از رابط حذف می‌کند؛ `index.html` cache-busting ماژول‌ها را به‌روز می‌کند؛ `tests/project-repeat-reference-sync.test.js` و تست‌های cache موجود به‌روز شده‌اند. `.github/workflows/deploy-pages-staging.yml` اکنون فرانت‌اند شاخه feature را فقط در مسیر staging منتشر می‌کند و root تولید را از main حفظ می‌کند. فایل/تصویر فعلاً با وضعیت SKIPPED_FILE گزارش می‌شود و metadata پیوست ناامن کپی نمی‌شود. CI فرانت‌اند شامل syntax، ۱۰۳ تست و بررسی assetها در اجرای `41704929939` موفق شد؛ Cross-repo QA و Agent Suite موفق شدند. CI بک‌اند شامل تست‌ها، syntax همه فایل‌ها و manifest در اجرای `41705001131` موفق شد و Agent Suite نیز سبز شد. انتشار فرانت‌اند staging در اجرای `41704920390` موفق شد. انتشار بک‌اند Apps Script به workflow دستی staging نیاز دارد و هنوز انجام نشده؛ اجرای آن فقط با تأیید صریح و روی پروژه آزمایشی انجام می‌شود. این تسک تا آماده‌شدن بک‌اند staging و تست عملی کاربر باز می‌ماند.
- [ ] **تسک ۳ — آزمون یکپارچه و تحویل برای تست کاربر**
  - آزمون پروژه تکراری با چند نوع اطلاعات مرکزی شامل ملزومات طراح، نمونه‌دوز و الگو‌ساز؛ بررسی تعداد و محتوای ردیف‌ها، عدم کپی رویداد/سفارش/دریافت، امنیت Tenant، اجرای مجدد بدون رکورد تکراری و وضعیت فایل/تصویر؛ اصلاح cache-busting و اجرای تست‌های رگرسیون.

> پس از هر تحویل یکپارچه، گزارش کوتاه ارائه می‌شود و برای تست کاربر متوقف می‌شوم. ثبت تیک و Log تکمیل فقط پس از تأیید کاربر انجام می‌شود. تغییر مستقیم روی `main` ممنوع است.
