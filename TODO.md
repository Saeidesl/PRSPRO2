## 🎯 Current Objective

یکپارچه‌سازی کامل چرخه ایجاد پروژه و ثبت رویداد؛ پروژه باید از همان مسیر استاندارد پروژه‌ها قابل ایجاد با اطلاعات ناقص باشد و تکمیل اطلاعات از طریق همان رویدادها و فرم‌های reusable انجام شود. هیچ دکمه، فرم، endpoint یا موجودیت موازی برای «ثبت اولیه طرح» ایجاد نشود. رکورد پروژه، شناسه آن و مسیر اصلی ثبت رویداد در تمام چرخه ثابت می‌مانند.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`، شاخه مرجع `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه مرجع `main`.
- فایل `TODO.md` در فرانت‌اند وجود نداشت؛ این فایل workspace همین فاز است.
- `Saeidesl/PRSPRO2BACKEND/TODO.md` متعلق به فاز مستقل استانداردسازی تأمین ملزومات است؛ در این فاز نباید تغییر یا بازنویسی شود.
- `ARCHITECTURE.md` هر دو مخزن بررسی شد. تصمیم‌های قبلی درباره پیش‌نویس، رویداد روی پیش‌نویس و فرم reusable در معماری فرانت‌اند ثبت شده‌اند.
- PRهای فرانت‌اند #121، #122 و #123 و بک‌اند #78 ادغام شده‌اند. PR #123 مسیر دسترسی فرانت‌اند برای انتخاب پروژه/نوع رویداد با مجوز `PROJECT_CREATE` را اصلاح کرده است.

### یافته معماری فعلی و مسئله‌ای که باید رفع شود
- در `js/modules/projects.js` تابع `Projects.openCreateForm` همان فرم ایجاد/ویرایش را می‌سازد؛ اما دکمه جداگانه `#project-create-draft` و گزینه `draftOnly` در `Projects.createProject(modal, options)` یک شاخه دوم برای ثبت اولیه ایجاد کرده‌اند.
- مسیر ثبت کامل و ثبت اولیه هر دو به `POST /projects` می‌رسند، اما payload و اعتبارسنجی متفاوت‌اند: ثبت اولیه `RecordState='DRAFT'` و فیلدهای اصلی خالی می‌فرستد؛ ثبت کامل `RecordState='ACTIVE'` می‌سازد. وجود دو اقدام مجزا در UI همان تجربه موازی و گیج‌کننده‌ای است که باید حذف شود.
- در بک‌اند `ProjectService.create(project, params)` در `ProjectService.js` بر اساس `RecordState` دو شاخه ساخت رکورد دارد؛ هر دو باید پشت همان قرارداد استاندارد ایجاد پروژه باقی بمانند، بدون endpoint یا موجودیت جدید.
- `ProjectService.update(id, data, params)` پیش‌نویس را با همان شناسه به پروژه فعال تبدیل می‌کند؛ کد و گردش‌کار پس از تکمیل هویت پروژه ثابت می‌شوند.
- `ProjectService.list(params)` برای کاربر فاقد `PROJECT_VIEW` فقط پیش‌نویس‌های متعلق به خودش را در کنار کنترل tenant برمی‌گرداند.
- `js/modules/events.js` صفحه اصلی ثبت رویداد است. `Events.loadProjects` داده پروژه‌ها را از مسیر موجود دریافت می‌کند؛ بارگذاری گزینه پروژه و نوع رویداد برای مجوزهای `PROJECT_VIEW` یا `PROJECT_CREATE` مجاز شده است. فیلتر نوع رویداد، `AllowOnDraft` را کنترل می‌کند.
- `Events.createEvent` پاسخ فرم‌های متصل را با `collectConfiguredFormResponses(projectId)` جمع می‌کند و از همان `POST /events` با payload شامل `ProjectID`، `EventTypeID`، داده‌های رویداد، `FormResponses` و `IdempotencyKey` استفاده می‌کند. برای رویداد مستقل `ProjectID` خالی است.
- `js/modules/project-detail.js` در وضعیت فعلی ثبت رویداد مستقیم از جزئیات پروژه را برای پیش‌نویس غیرفعال می‌کند؛ مسیر استاندارد ثبت رویداد در صفحه رویدادهاست. در اصلاح UX نباید مسیر موازی جدیدی در جزئیات پروژه ساخته شود.
- `EventService._createUnlocked_(event, params)` در `EventService.js` مالک اعتبارسنجی سروری نوع رویداد، پروژه، دسترسی tenant/project، واحد/کاربر و گزینه `AllowOnDraft` است. `_getConfiguredChanges_` برای پیش‌نویس تغییر وضعیت/گردش‌کار را اعمال نمی‌کند.
- `FormService.validateEventResponses` و `FormService.saveEventResponses` در `FormService.js` پاسخ فرم را اعتبارسنجی و ذخیره می‌کنند. فیلد مرکزی با کد `PROJECT_CODE` از طریق `ProjectService.validateDraftProjectCodeFromEvent` و `assignDraftProjectCodeFromEvent` کد اصلی همان پروژه را با کنترل یکتایی Tenant ثبت می‌کند؛ سایر مقادیر به `ProjectInformationService.save` با `SourceEventID` متصل می‌شوند.
- فرم‌های reusable از صفحه `pages/forms.html` و ماژول `js/modules/forms.js` مدیریت می‌شوند؛ طراحی فرم از اتصال فرم به نوع رویداد جدا شده است. مسیرهای فعلی فرم حفظ می‌شوند.
- اطلاعات پویای پروژه در بک‌اند توسط `ProjectInformationService.js` و مخزن‌های مرتبط در شیت‌های `30_ProjectInformation` و `31_ProjectInformationHistory` نگهداری می‌شوند؛ snapshot پاسخ فرم رویداد در `34_EventFormData` است.
- فایل‌ها و تصاویر پروژه از `POST /projects/:projectId/attachments` و `AttachmentService.js` عبور می‌کنند؛ فایل در Drive و metadata در `15_Attachments` ذخیره می‌شود.

### فایل‌های اصلی فرانت‌اند
- `js/modules/projects.js`: `Projects.openCreateForm`, `Projects.createProject`, `Projects.loadProjects`; فرم و چرخه ایجاد/تکمیل پروژه.
- `js/modules/events.js`: `Events.init`, بارگذاری پروژه‌ها/نوع رویدادها، `collectConfiguredFormResponses`, `createEvent`; مسیر واحد ثبت رویداد.
- `js/modules/project-detail.js`: نمایش وضعیت و اطلاعات پرونده؛ نباید فرم/endpoint موازی ثبت رویداد اضافه شود.
- `js/modules/forms.js`, `pages/forms.html`, `css/reusable-forms.css`: طراحی فرم و اتصال آن به نوع رویداد.
- `js/core/api.js`: درخواست‌های API از طریق `PMS.Api.get/post/put`.
- `index.html`: نسخه‌گذاری cache-busting ماژول‌های تغییرکرده.
- تست‌های موجود: `tests/single-project-entry.test.js`, `tests/project-draft-information-flow.test.js`, `tests/draft-event-type-visibility.test.js`, `tests/reusable-forms.test.js`, `tests/project-information-dossier.test.js`.

### فایل‌های اصلی بک‌اند و API
- `Router.js`: `POST /projects` → `ProjectService.create`; `PUT /projects/:id` → `ProjectService.update`; `GET /projects` و `GET /projects/:id`; `POST /events` → `EventService.create`.
- `ProjectService.js`: ایجاد/فهرست/دریافت/تکمیل پروژه و اعتبارسنجی کد پروژه.
- `EventService.js`: ثبت رویداد، `AllowOnDraft`، عدم انتقال چرخه عمر/گردش‌کار برای DRAFT و idempotency.
- `EventTypeService.js`, `EventTypeValidator.js`, `EventTypeRepository.js`: تعریف و نگهداری `AllowOnDraft` با پیش‌فرض خاموش.
- `FormService.js`: اتصال فرم reusable، اعتبارسنجی پاسخ‌ها، snapshot و همگام‌سازی اطلاعات پروژه.
- `ProjectInformationService.js`: مقادیر جاری و تاریخچه اطلاعات پویا.
- `AttachmentService.js`: پیوست‌های پروژه.
- `DatabaseSetup.js`: ساختار شیت‌ها و ستون‌های افزایشی.
- آزمون بک‌اند با `node --test tests/*.test.js` و workflow بررسی بک‌اند انجام می‌شود؛ انتشار Apps Script از workflow همگام‌سازی مستقل است.

### قرارداد داده و جریان هدف
1. ایجاد پروژه فقط از فرم استاندارد و endpoint موجود `POST /projects` انجام می‌شود؛ در صورت ناقص‌بودن اطلاعات لازم، همان submit یک رکورد DRAFT می‌سازد و در صورت کامل‌بودن، همان submit رکورد ACTIVE می‌سازد. تشخیص وضعیت باید در منطق واحد و بدون دکمه/فرم/endpoint جدا باشد.
2. هر دو حالت از همان شناسه پروژه و فهرست پروژه‌ها استفاده می‌کنند. تکمیل اطلاعات با `PUT /projects/:id` روی همان رکورد انجام می‌شود.
3. ثبت رویداد فقط از مسیر عمومی `POST /events` است. رویداد پروژه‌ای payload دارای `ProjectID` و `EventTypeID` است؛ فرم‌های متصل در `FormResponses` ارسال می‌شوند. نوع رویداد فقط با `AllowOnDraft=true` روی DRAFT مجاز است.
4. پاسخ فرم باید در همان پرونده پروژه و تاریخچه ذخیره شود؛ رویداد روی DRAFT نباید وضعیت پروژه یا گردش‌کار را فعال/جابجا کند.
5. پس از تکمیل اطلاعات، همان پروژه ACTIVE می‌شود؛ رویدادها، فایل‌ها، تاریخچه، پیوندها و شناسه پروژه حفظ می‌شوند. هیچ انتقال یا کپی به پرونده/موجودیت جدید انجام نمی‌شود.
6. مجوزها، TenantID، مالکیت پیش‌نویس، دسترسی پروژه، واحد/کاربر و اعتبارسنجی فرم همواره در بک‌اند مرجع نهایی هستند.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف و مستندسازی مسیر فعلی ایجاد پروژه، ثبت رویداد و فرم‌های reusable در هر دو مخزن.
  - *Log:* `TODO.md` در ریشه مخزن فرانت‌اند ایجاد شد. `ARCHITECTURE.md` هر دو مخزن و فایل‌های `projects.js`, `events.js`, `project-detail.js`, `ProjectService.js`, `EventService.js`, `FormService.js`, `EventTypeService.js`, `Router.js` بررسی شدند. مشخص شد دکمه `ثبت اولیه طرح` و گزینه `draftOnly` در کنار ثبت کامل، دو شاخه UX برای یک موجودیت ساخته‌اند؛ در عین حال ثبت رویداد و پاسخ فرم از APIهای عمومی موجود استفاده می‌کنند. تناقض مهم: جزئیات پروژه ثبت رویداد را برای DRAFT غیرفعال می‌کند، اما صفحه رویدادها امکان انتخاب پروژه و نوع رویداد مجاز را دارد. PRهای #121/#122/#123 فرانت‌اند و #78 بک‌اند ادغام شده‌اند؛ CI مربوط به merge PR #123 موفق بوده و یک اجرای جدید Pages برای commit بعدی هنگام بررسی در صف بوده است. TODO مستقل تأمین در بک‌اند دست‌نخورده باقی می‌ماند.
- [ ] تسک ۲ — یکپارچه‌سازی ایجاد پروژه در رابط و قرارداد موجود؛ حذف شاخه UX موازی «ثبت اولیه طرح» و تبدیل submit استاندارد به ایجاد خودکار DRAFT یا ACTIVE بر اساس کامل‌بودن اطلاعات، با حفظ `POST /projects` و شناسه واحد.
- [ ] تسک ۳ — یکپارچه‌سازی تجربه ثبت رویداد و تکمیل اطلاعات؛ اطمینان از اینکه پروژه ناقص از همان فهرست و فرم عمومی رویداد انتخاب شود، فرم‌های reusable اطلاعات همان پرونده را کامل کنند و هیچ مسیر ثبت رویداد جداگانه یا محدودیت متناقض در جزئیات پروژه باقی نماند.
- [ ] تسک ۴ — تثبیت امنیت، سازگاری و آزمون سرتاسری؛ آزمون چرخه ایجاد ناقص → ثبت رویداد/فرم → نمایش در کارت و تاریخچه → تکمیل همان پروژه، همراه با کنترل مجوزها، idempotency، عدم تغییر ناخواسته گردش‌کار و بررسی CI/استقرار آزمایشی.
