## 🎯 Current Objective

ساده‌سازی هویت پروژه با حذف وابستگی چرخه کاری به DRAFT و تنظیم AllowOnDraft: کاربر از همان فرم استاندارد، یک کد موقت دلخواه و یکتا وارد می‌کند؛ پروژه با شناسه ثابت و وضعیت عملیاتی عادی ساخته می‌شود؛ رویدادها از مسیر معمول ثبت می‌شوند؛ سپس کاربر هر زمان کد موقت را با کد قطعی جایگزین می‌کند. تمام رویدادها، فرم‌ها، فایل‌ها و تاریخچه به همان شناسه داخلی متصل می‌مانند.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`، شاخه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- این فاز فقط چرخه کدگذاری و ایجاد/ویرایش پروژه را تغییر می‌دهد؛ TODO مستقل تأمین ملزومات در بک‌اند نباید تغییر کند.
- پیش از شروع، TODO فرانت‌اند و بخش‌های مرتبط ARCHITECTURE.md هر دو مخزن بررسی شدند.
- هیچ merge یا انتشار Apps Script/GitHub Pages بدون اجازه صریح کاربر انجام نمی‌شود.

### یافته‌های وضع موجود
- در فرانت‌اند `js/modules/projects.js`، تابع `Projects.openCreateForm` فرم ایجاد/ویرایش را می‌سازد و فیلد `#new-project-code` را دارد؛ در حال حاضر برای DRAFT در زمان ویرایش required است و برای پروژه ACTIVE readonly است.
- تابع `Projects.createProject(modal)` از `POST /projects` برای ایجاد و `PUT /projects/:id` برای ویرایش/تکمیل استفاده می‌کند. payload شامل `ProjectCode` است؛ شاخه فعلی DRAFT کد را در زمان ایجاد خالی نگه می‌دارد.
- `js/modules/project-detail.js` و کارت‌های پروژه، کد نمایشی را از رکورد پروژه دریافت می‌کنند؛ شناسه داخلی `ID` مبنای ارتباط رویدادها و فایل‌هاست.
- در بک‌اند `Router.js`: `POST /projects` به `ProjectService.create`، `PUT /projects/:id` به `ProjectService.update` و `POST /events` به `EventService.create` متصل است. endpoint جدید لازم نیست.
- `ProjectValidator.js`: ایجاد DRAFT فعلاً فقط عنوان را می‌خواهد؛ ایجاد ACTIVE کد پروژه، عنوان، گردش‌کار و واحد مجاز را اعتبارسنجی می‌کند. در ویرایش نیز کد الزامی است و فقط قواعد فعلی اجازه تغییر کد DRAFT را می‌دهند.
- `ProjectService.js`: ساخت DRAFT کد خالی می‌سازد؛ در `update` کد فقط برای DRAFT قابل تغییر است و برای پروژه ACTIVE صریحاً immutable شده است. یکتایی کد در Tenant بررسی می‌شود. منطق قفل/اعتبارسنجی کد و Audit باید برای ویرایش کد در هر وضعیت حفظ و یکپارچه شود.
- `FormService.js`: نوع اطلاعات مرکزی با کد `PROJECT_CODE` در فرم رویداد به `ProjectService.validateProjectCodeFromEvent` و `updateProjectCodeFromEvent` متصل است؛ مقدار فرم رویداد باید روی فیلد اصلی پروژه ذخیره شود.
- `EventService.js`: در وضع موجود ثبت رویداد روی DRAFT به گزینه `AllowOnDraft` وابسته است؛ `EventTypeService.js` و `EventTypeValidator.js` این گزینه را نگه می‌دارند. با حذف چرخه DRAFT، رویدادهای پروژه از مسیر عادی پروژه فعال استفاده خواهند کرد.
- شیت اصلی پروژه `08_Projects` و فیلد `ProjectCode` منبع یگانه کد پروژه باقی می‌مانند. شناسه داخلی `ID` تغییر نمی‌کند. کد در `30_ProjectInformation` کپی نمی‌شود.
- فایل‌ها در Drive و metadata در `15_Attachments`، پاسخ فرم رویداد در `34_EventFormData`، مقدارهای پویا در `30_ProjectInformation` و تاریخچه در `31_ProjectInformationHistory` باقی می‌مانند.

### فایل‌ها، توابع و APIهای درگیر

#### Frontend
- `js/modules/projects.js`: `Projects.openCreateForm`, `Projects.createProject`, `Projects.openProjectEditForm`, `Projects.loadProjects`; فیلد کد باید از لحظه ایجاد اجباری و در فرم ویرایش همیشه قابل تغییر باشد.
- `js/modules/events.js`: انتخاب پروژه و ثبت رویداد با `POST /events` بدون نیاز به شاخه ویژه DRAFT.
- `js/modules/project-detail.js`: نمایش کد فعلی و حذف رفتارهای مختص DRAFT در صورت بی‌نیازشدن.
- `index.html`: cache-busting فایل‌های تغییرکرده.
- تست‌های موجود: `tests/single-project-entry.test.js`, `tests/project-draft-information-flow.test.js`, `tests/draft-event-type-visibility.test.js`, `tests/project-information-dossier.test.js`.

#### Backend
- `Router.js`: قراردادهای موجود `POST /projects`, `PUT /projects/:id`, `GET /projects`, `GET /projects/:id`, `POST /events` حفظ می‌شوند.
- `ProjectValidator.js`: الزام کد موقت ورودی کاربر در ایجاد و اعتبارسنجی تغییر کد در ویرایش.
- `ProjectService.js`: ایجاد پروژه عملیاتی با کد ورودی؛ امکان تغییر کد در تمام وضعیت‌های مجاز؛ کنترل یکتایی در سطح Tenant، قفل برای جلوگیری از رقابت، Audit و حفظ شناسه.
- `FormService.js`: اجازه عبور فیلد `PROJECT_CODE` از پاسخ فرم و هدایت مقدار آن به عملیات امن تغییر کد در `ProjectService`؛ عدم ذخیره آن در `ProjectInformationService`.
- `EventService.js`, `EventTypeService.js`, `EventTypeValidator.js`: حذف وابستگی ثبت رویداد پروژه به `AllowOnDraft` در صورت حذف کامل DRAFT از چرخه عملیاتی؛ بررسی و پاک‌سازی کنترل‌شده فیلد/منطق منسوخ.
- `ProjectRepository.js`, `ProjectInformationService.js`, `DatabaseSetup.js`: فقط در صورت نیاز واقعی تغییر؛ شناسه‌ها و شیت‌های اطلاعات/تاریخچه نباید بازطراحی شوند.
- آزمون بک‌اند: `node --test tests/*.test.js`.

### قرارداد هدف و قواعد ایمنی
1. فرم استاندارد ایجاد پروژه همیشه یک کد موقت دلخواه از کاربر می‌گیرد؛ کد خالی یا تکراری در Tenant پذیرفته نمی‌شود.
2. پروژه از همان ابتدا رکورد عملیاتی عادی است؛ برای شروع کار نیازی به DRAFT یا تنظیم AllowOnDraft نیست.
3. کد موقت و کد قطعی هر دو در همان فیلد `08_Projects.ProjectCode` نگهداری می‌شوند. فیلد در فرم ویرایش برای پروژه‌های ایجادشده نیز قابل تغییر است.
4. تغییر کد فقط مقدار `ProjectCode` را تغییر می‌دهد؛ شناسه داخلی پروژه، رویدادها، پیوست‌ها، فرم‌ها، تاریخچه، گردش‌کار و سایر روابط نباید تغییر کنند.
5. کنترل یکتایی کد به‌صورت case-insensitive و tenant-scoped، در سرور و داخل قفل انجام می‌شود؛ Audit باید کد قبلی و جدید را ثبت کند.
6. پاسخ فرم رویدادِ متصل به پروژه می‌تواند از طریق نوع اطلاعات `PROJECT_CODE` کد پروژه را تغییر دهد؛ این تغییر باید مستقیماً روی `08_Projects.ProjectCode` اعمال شود، با اعتبارسنجی یکتایی tenant-scoped و case-insensitive، قفل و Audit. کد در `30_ProjectInformation` کپی نمی‌شود و شناسه/روابط پروژه ثابت می‌مانند.
7. رویدادهای پروژه از همان `POST /events` ثبت می‌شوند. هیچ endpoint یا موجودیت موازی ایجاد نمی‌شود.
8. حذف/بی‌اثرکردن DRAFT و AllowOnDraft باید با سازگاری داده‌های موجود و بدون حذف رکوردها/تاریخچه انجام شود؛ اگر داده DRAFT موجود باشد، در این فاز نباید بدون مسیر امن به‌صورت مخرب تغییر داده شود. ابتدا باید رفتار سازگار برای رکوردهای موجود تعیین و آزمون شود.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف و مستندسازی مدل کد پروژه، ایجاد/ویرایش، ثبت رویداد و وابستگی‌های DRAFT در فرانت‌اند و بک‌اند.
  - *Log:* `TODO.md` قبلی و `ARCHITECTURE.md` هر دو مخزن بررسی شدند. فایل‌های `js/modules/projects.js`, `ProjectService.js`, `ProjectValidator.js`, `Router.js`, `FormService.js` و تست‌های چرخه پروژه بررسی شدند. مشخص شد فیلد کد در فرم ایجاد موجود اما DRAFT آن را خالی نگه می‌دارد؛ کد پروژه ACTIVE در UI و بک‌اند قفل است؛ و فرم رویداد مسیر ویژه‌ای برای تخصیص کد دارد. قراردادهای موجود API و شیت‌های مرتبط در Technical Spec ثبت شدند. هنوز هیچ فایل کد تغییر نکرده است.
- [x] تسک ۲ — اجرای مدل کد موقت دستی و قابل‌ویرایش: ایجاد پروژه عملیاتی با کد واردشده توسط کاربر، امکان تغییر کد در فرم پروژه و فرم رویداد، حفظ یکتایی Tenant و Audit و حفظ سازگاری DRAFTهای قدیمی؛ همراه با تغییرات یکپارچه فرانت‌اند و بک‌اند.
  - *Log:* در فرانت‌اند، `js/modules/projects.js` با commit `05a7ff8` اصلاح شد تا ایجاد پروژه با کد واردشده و ویرایش کد پروژه‌های فعال ممکن باشد؛ cache-busting در `index.html` با commit `30f471d` به‌روزرسانی شد. در بک‌اند، `ProjectService.js` با commitهای `d421ecc`, `5c54c33` و `9096cbb` امکان تغییر کد پروژه فعال، کنترل یکتایی case-insensitive و tenant-scoped، قفل هم‌زمانی در CREATE/UPDATE، و Audit را پیاده‌سازی کرد. `FormService.js` با commitهای `32c3823` و `51e493c` مقدار `PROJECT_CODE` فرم رویداد را به مسیر امن تغییر کد در ProjectService هدایت می‌کند؛ نام توابع نیز در `9096cbb` با فراخوانی هماهنگ شد. تست‌های `tests/project-draft-information-flow.test.js` با commitهای `fc7598a` و `70f44a1` برای جریان ACTIVE، سازگاری DRAFTهای قدیمی و یکتایی کد هنگام ایجاد اصلاح شدند. CI در runهای `41237155627` و `41237155732` موفق شد؛ مجموعه تست‌های بک‌اند ۱۱۹ تست موفق و بدون خطا گزارش کرد و بررسی syntax/manifest و کنترل‌های ایمنی انتشار نیز موفق بودند. انتشار خودکار آزمایشی بک‌اند در run `41237121098` موفق شد. کاربر در آزمون واقعی برنامه تأیید کرد جریان موردنظر به‌درستی انجام شده است. کد پروژه همچنان فقط در `08_Projects.ProjectCode` ذخیره می‌شود و شناسه داخلی و ارتباط سوابق ثابت می‌مانند.
- [ ] تسک ۳ — (IN PROGRESS) آزمون و تثبیت نهایی سازگاری: تکمیل بررسی‌های رگرسیون برای ایجاد با کد موقت، تغییر به کد نهایی، جلوگیری از کد تکراری، حفظ شناسه و تمام سوابق، ثبت رویداد عادی و رفتار امن رکوردهای DRAFT قدیمی؛ اجرای تست‌های کامل فرانت‌اند و بک‌اند و بررسی CI بدون merge یا انتشار تولید. مواردی که در تسک ۲ با تست خودکار و آزمون کاربر تأیید شده‌اند دوباره‌کاری نشوند؛ تمرکز روی پوشش باقی‌مانده و سازگاری انتها‌به‌انتها باشد.
