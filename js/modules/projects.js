(function () {
  'use strict';

  function projectSettingsStorageKey() {
    const router = window.PMS && window.PMS.Router;
    const user = router && typeof router.getUser === 'function'
      ? router.getUser()
      : (window.PMS && window.PMS.Session && window.PMS.Session.getUser
        ? window.PMS.Session.getUser()
        : {});
    const userId = user && (user.ID || user.Id || user.id || user.Username || user.Email);
    if (userId) return 'pms_project_create_settings_v1_user_' + String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');

    const token = String(window.PMS && window.PMS.Api && window.PMS.Api.getToken
      ? window.PMS.Api.getToken() || ''
      : '');
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'pms_project_create_settings_v1_' + (hash >>> 0).toString(36);
  }

  function projectJalaliDateToIso(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const ascii = raw.replace(/[۰-۹٠-٩]/g, function (digit) {
      const persian = '۰۱۲۳۴۵۶۷۸۹';
      const arabic = '٠١٢٣٤٥٦٧٨٩';
      const index = persian.indexOf(digit);
      return String(index >= 0 ? index : arabic.indexOf(digit));
    }).replace(/[.-]/g, '/');
    const match = ascii.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) throw new Error('تاریخ را به شکل شمسی سال/ماه/روز وارد کنید؛ مانند ۱۴۰۵/۰۷/۲۷.');
    const jy = Number(match[1]), jm = Number(match[2]), jd = Number(match[3]);
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) throw new Error('تاریخ شمسی معتبر نیست.');
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
    const start = Date.UTC(jy + 621, 2, 18);
    for (let offset = 0; offset < 371; offset++) {
      const date = new Date(start + offset * 86400000);
      const parts = {};
      formatter.formatToParts(date).forEach(function (part) { if (part.type === 'year' || part.type === 'month' || part.type === 'day') parts[part.type] = Number(part.value); });
      if (parts.year === jy && parts.month === jm && parts.day === jd) return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
    }
    throw new Error('این تاریخ شمسی معتبر نیست.');
  }

  const CACHE_KEY = window.PMS.Cache.keys.PROJECTS;

  const Projects = {
    projects: [],
    workflows: [],
    projectStatuses: [],
    workflowStepsByWorkflow: {},
    stageLookupsLoaded: false,
    modal: null,
    isSaving: false,
    projectCardImages: {},
    projectCardImageStates: {},
    projectCardAttachmentsPromise: null,
    projectCardImageObserver: null,
    projectCardImageAttachments: {},
    projectCardImageInflight: {},
    projectCardImageDbPromise: null,

    init: function () {
      this.ensureProjectStyles();
      this.bindEvents();
      const router = window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const isAdmin = !!(router && typeof router.isAdmin === 'function' && router.isAdmin());
      const canViewProjects = isAdmin || permissions.indexOf('PROJECT_VIEW') !== -1;
      const canCreateProjects = isAdmin || permissions.indexOf('PROJECT_CREATE') !== -1;
      const createButton = document.getElementById('project-create-button');
      if (createButton) createButton.hidden = !canCreateProjects;

      if (canViewProjects) {
        this.loadProjects();
        this.loadProjectStatuses();
      } else {
        // Create-only users should not trigger a forbidden project-list request.
        const card = document.querySelector('.page-section > .card');
        if (card) card.hidden = true;
      }
    },

    ensureProjectStyles: function () {
      if (document.getElementById('projects-card-view-styles')) return;
      const style = document.createElement('style');
      style.id = 'projects-card-view-styles';
      style.textContent = [
        '#projects-page-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}',
        '#projects-page-tools .filter-bar{display:flex;align-items:end;gap:10px;flex:1;min-width:240px;flex-wrap:wrap}',
        '#projects-page-tools .filter-group{flex:1;min-width:180px}',
        '#projects-page-tools .filter-group label{display:block;margin-bottom:6px;color:var(--color-text-secondary);font-size:12px}',
        '#projects-page-tools input,#projects-page-tools select{width:100%;min-height:42px;padding:9px 12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text);font:inherit}',
        '#projects-table-container.projects-card-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:14px;min-width:0}',
        '.project-list-card{position:relative;display:flex;flex-direction:column;min-width:0;min-height:176px;border:1px solid var(--color-border);border-radius:16px;background:var(--color-surface);overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04);transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease}',
        '.project-list-card:hover{border-color:color-mix(in srgb,var(--color-primary) 45%,var(--color-border));box-shadow:0 8px 24px rgba(15,23,42,.09);transform:translateY(-1px)}',
        '.project-list-card-main{display:block;flex:1;min-width:0;position:relative;padding:17px 17px 13px}',
        '.project-list-card-main.has-thumbnail .project-list-card-content{padding-right:112px}',
        '.project-list-card-media{position:absolute;right:16px;top:17px;width:84px;height:96px;overflow:hidden;border-radius:11px;border:1px solid var(--color-border);background:var(--color-surface-hover);box-shadow:0 2px 7px rgba(15,23,42,.08)}',
        '.project-list-card-thumbnail{display:block;width:100%;height:100%;object-fit:cover;object-position:center;cursor:pointer}',
        '.project-list-card-thumbnail[hidden]{display:none}',
        '.project-list-card-thumbnail:focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}',
        '.project-image-lightbox{position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;padding:clamp(12px,3vw,32px);box-sizing:border-box;background:rgba(0,0,0,.88);backdrop-filter:blur(3px);direction:rtl}',
        '.project-image-lightbox[hidden]{display:none}',
        '.project-image-lightbox-content{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-width:0;min-height:0}',
        '.project-image-lightbox-image{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;border-radius:8px;box-shadow:0 12px 48px rgba(0,0,0,.35)}',
        '.project-image-lightbox-close{position:absolute;top:0;right:0;z-index:1;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:rgba(20,20,20,.75);color:#fff;font-size:28px;line-height:1;cursor:pointer}',
        '.project-image-lightbox-close:focus-visible{outline:2px solid #fff;outline-offset:3px}',
        '@media(max-width:620px){.project-image-lightbox{padding:12px}.project-image-lightbox-close{width:42px;height:42px;top:4px;right:4px}}',
        '.project-list-card-image-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:5px;box-sizing:border-box;color:var(--color-text-secondary);background:linear-gradient(145deg,color-mix(in srgb,var(--color-primary) 7%,var(--color-surface)),var(--color-surface-hover));text-align:center}',
        '.project-list-card-image-placeholder[hidden]{display:none}',
        '.project-list-card-image-label{font-size:9px;line-height:1.5;overflow-wrap:anywhere}',
        '.project-list-card-image-empty-icon{font-size:25px;line-height:1;opacity:.55}',
        '.project-list-image-spinner{width:22px;height:22px;border:2px solid color-mix(in srgb,var(--color-primary) 20%,var(--color-border));border-top-color:var(--color-primary);border-radius:50%;animation:project-image-spin .8s linear infinite}',
        '@keyframes project-image-spin{to{transform:rotate(360deg)}}',
        '.project-list-card-indicator{position:absolute;left:18px;top:20px;width:9px;height:9px;border-radius:50%;background:var(--color-text-secondary)}',
        '.project-list-card-indicator.is-active{background:#16a34a}.project-list-card-indicator.is-hold{background:#eab308}.project-list-card-indicator.is-completed{background:#3b82f6}.project-list-card-indicator.is-cancelled{background:#ef4444}',
        '.project-list-card-content{flex:1;min-width:0}',
        '.project-list-card-code{padding-left:18px;font-size:15px;font-weight:800;line-height:1.65;overflow-wrap:anywhere;letter-spacing:.1px;color:var(--color-text)}',
        '.project-list-card-title{margin-top:4px;font-size:13px;font-weight:600;color:var(--color-text-secondary);line-height:1.75;overflow-wrap:anywhere}',
        '.project-list-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px}',
        '.project-list-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-surface-hover);color:var(--color-text-secondary);font-size:11px;line-height:1.6;font-weight:650}',
        '.project-list-badge.is-active{color:#16824a;background:color-mix(in srgb,#16a34a 12%,var(--color-surface));border-color:color-mix(in srgb,#16a34a 25%,transparent)}',
        '.project-list-badge.is-hold{color:#a16207;background:color-mix(in srgb,#eab308 13%,var(--color-surface));border-color:color-mix(in srgb,#eab308 28%,transparent)}',
        '.project-list-badge.is-completed{color:#2563eb;background:color-mix(in srgb,#3b82f6 12%,var(--color-surface));border-color:color-mix(in srgb,#3b82f6 25%,transparent)}',
        '.project-list-badge.is-cancelled{color:#b91c1c;background:color-mix(in srgb,#ef4444 12%,var(--color-surface));border-color:color-mix(in srgb,#ef4444 25%,transparent)}',
        '.project-list-card-activity{font-size:11px;color:var(--color-text-secondary);line-height:1.8;margin-top:10px;padding-top:8px;border-top:1px solid color-mix(in srgb,var(--color-border) 75%,transparent)}',
        '.project-list-card-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 17px 15px;border-top:1px solid color-mix(in srgb,var(--color-border) 72%,transparent);background:color-mix(in srgb,var(--color-surface-hover) 45%,var(--color-surface))}',
        '.project-list-card-actions .btn{min-height:36px;padding-inline:14px;border-radius:9px;font-weight:650}',
        '@media(max-width:900px){#projects-table-container.projects-card-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}',
        '@media(max-width:620px){#projects-table-container.projects-card-list{grid-template-columns:minmax(0,1fr);gap:11px}.project-list-card{min-height:0;border-radius:14px}.project-list-card-main{padding:14px 13px 11px}.project-list-card-main.has-thumbnail .project-list-card-content{padding-right:84px}.project-list-card-media{right:12px;top:14px;width:62px;height:72px;border-radius:9px}.project-list-card-indicator{left:14px;top:17px}.project-list-card-code{font-size:14px;padding-left:14px}.project-list-card-title{font-size:12px}.project-list-card-meta{gap:5px;margin-top:10px}.project-list-badge{font-size:10px;padding:4px 7px}.project-list-card-activity{font-size:10px;margin-top:8px;padding-top:7px}.project-list-card-actions{padding:10px 12px 12px;gap:7px}.project-list-card-actions .btn{flex:1;min-width:0;min-height:40px;padding-inline:8px;font-size:12px}}',
        '.project-create-progress{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(8,15,30,.58);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);direction:rtl;animation:project-progress-backdrop-in .22s ease-out both}',
        '.project-create-progress[hidden]{display:none}',
        '.project-create-progress-card{position:relative;width:min(100%,390px);overflow:hidden;box-sizing:border-box;padding:30px 25px 24px;border:1px solid color-mix(in srgb,var(--color-primary) 28%,var(--color-border));border-radius:24px;background:var(--color-surface);color:var(--color-text);text-align:center;box-shadow:0 28px 90px rgba(0,0,0,.28);animation:project-progress-card-in .42s cubic-bezier(.2,.85,.25,1.15) both}',
        '.project-create-progress-card:before{content:"";position:absolute;top:-90px;left:-65px;width:210px;height:210px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 13%,transparent);filter:blur(2px);pointer-events:none}',
        '.project-create-progress-orbit{position:relative;display:grid;place-items:center;width:94px;height:94px;margin:0 auto 20px;border:1px solid color-mix(in srgb,var(--color-primary) 22%,var(--color-border));border-radius:50%;background:color-mix(in srgb,var(--color-primary) 7%,var(--color-surface));animation:project-progress-float 2.2s ease-in-out infinite}',
        '.project-create-progress-orbit:before,.project-create-progress-orbit:after{content:"";position:absolute;inset:7px;border:1px solid color-mix(in srgb,var(--color-primary) 28%,transparent);border-radius:50%;animation:project-progress-ring 2.4s ease-out infinite}',
        '.project-create-progress-orbit:after{animation-delay:1.2s}',
        '.project-create-progress-spinner{display:block;width:39px;height:39px;border:4px solid color-mix(in srgb,var(--color-primary) 16%,var(--color-border));border-top-color:var(--color-primary);border-right-color:var(--color-primary);border-radius:50%;animation:project-create-spin .78s linear infinite;box-shadow:0 0 22px color-mix(in srgb,var(--color-primary) 18%,transparent)}',
        '.project-create-progress-spark{position:absolute;top:5px;right:7px;color:var(--color-primary);font-size:20px;animation:project-progress-spark 1.8s ease-in-out infinite}',
        '.project-create-progress-heading{position:relative;font-size:19px;font-weight:800;line-height:1.8;margin-bottom:7px}',
        '.project-create-progress-message{position:relative;min-height:48px;color:var(--color-text-secondary);font-size:13px;line-height:2}',
        '.project-create-progress-track{height:5px;overflow:hidden;margin:18px 0 13px;border-radius:99px;background:var(--color-surface-hover,var(--color-border))}',
        '.project-create-progress-track span{display:block;width:38%;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--color-primary),color-mix(in srgb,var(--color-primary) 42%,#a78bfa));animation:project-progress-track 1.45s ease-in-out infinite}',
        '.project-create-progress-footnote{font-size:11px;line-height:1.9;color:var(--color-text-secondary);opacity:.85}',
        '@keyframes project-create-spin{to{transform:rotate(360deg)}}',
        '@keyframes project-progress-backdrop-in{from{opacity:0}to{opacity:1}}',
        '@keyframes project-progress-card-in{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}',
        '@keyframes project-progress-ring{0%{transform:scale(.8);opacity:.75}100%{transform:scale(1.35);opacity:0}}',
        '@keyframes project-progress-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
        '@keyframes project-progress-spark{0%,100%{transform:scale(.8) rotate(0);opacity:.65}50%{transform:scale(1.15) rotate(18deg);opacity:1}}',
        '@keyframes project-progress-track{0%{transform:translateX(280%)}100%{transform:translateX(-280%)}}',
        '@media(prefers-reduced-motion:reduce){.project-create-progress,.project-create-progress-card,.project-create-progress-orbit,.project-create-progress-orbit:before,.project-create-progress-orbit:after,.project-create-progress-spinner,.project-create-progress-spark,.project-create-progress-track span{animation:none!important}}',
        '#project-create-settings-modal{padding:clamp(8px,3vw,20px)!important;align-items:center;overscroll-behavior:contain}',
        '#project-create-settings-modal [role="dialog"]{width:min(100%,680px);max-height:min(88dvh,760px);overflow:auto;overscroll-behavior:contain;padding:clamp(14px,3.5vw,24px)!important;scrollbar-gutter:stable}',
        '#project-create-settings-title{font-size:clamp(16px,2.4vw,20px);line-height:1.7}',
        '#project-create-settings-content{display:flex;flex-direction:column;gap:12px;min-width:0}',
        '#project-create-settings-content>.filter-group{margin:0!important;padding:14px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-surface-hover, var(--color-surface));min-width:0}',
        '#project-create-settings-content>.filter-group>label{display:block;margin:0 0 10px;font-size:13px;font-weight:750;line-height:1.9}',
        '#project-create-settings-content .project-access-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:32vh;overflow:auto;padding:2px;overscroll-behavior:contain}',
        '#project-create-settings-content .project-access-option{display:flex;align-items:center;gap:10px;min-height:48px;min-width:0;padding:10px 12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text);cursor:pointer;transition:border-color .15s ease,background .15s ease;box-sizing:border-box}',
        '#project-create-settings-content .project-access-option:hover{border-color:var(--color-primary)}',
        '#project-create-settings-content .project-access-option:has(input:checked){border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 9%,var(--color-surface))}',
        '#project-create-settings-content .project-access-option:focus-within{outline:2px solid var(--color-primary);outline-offset:2px}',
        '#project-create-settings-content .project-access-option input[type="checkbox"],#project-create-settings-content #new-project-notify{appearance:none;-webkit-appearance:none;flex:0 0 22px;width:22px;height:22px;min-width:22px;min-height:22px;margin:0;border:1.5px solid var(--color-border);border-radius:6px;background:var(--color-surface);display:inline-grid;place-content:center;cursor:pointer;accent-color:var(--color-primary)}',
        '#project-create-settings-content .project-access-option input[type="checkbox"]::before,#project-create-settings-content #new-project-notify::before{content:"";width:10px;height:6px;border:solid #fff;border-width:0 0 2px 2px;transform:rotate(-45deg) scale(0);transition:transform .12s ease}',
        '#project-create-settings-content .project-access-option input[type="checkbox"]:checked,#project-create-settings-content #new-project-notify:checked{background:var(--color-primary);border-color:var(--color-primary)}',
        '#project-create-settings-content .project-access-option input[type="checkbox"]:checked::before,#project-create-settings-content #new-project-notify:checked::before{transform:rotate(-45deg) scale(1)}',
        '#project-create-settings-content .project-access-option span{min-width:0;overflow-wrap:anywhere;line-height:1.8;font-size:13px}',
        '#project-create-settings-content #new-project-users{min-height:130px;padding:8px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text)}',
        '#project-create-settings-content #new-project-status{min-height:44px;padding:9px 12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text)}',
        '#project-create-settings-content #new-project-notify-setting>label{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:0;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);cursor:pointer}',
        '#project-create-settings-content small{font-size:12px;line-height:1.9}',
        '#project-create-settings-modal [data-settings-save],#project-create-settings-modal [data-settings-cancel]{min-height:44px;padding-inline:18px}',
        '@media(max-width:600px){#project-create-settings-modal{align-items:flex-end!important;padding:0!important}#project-create-settings-modal [role="dialog"]{width:100%;max-width:none;max-height:92dvh;border-radius:18px 18px 0 0!important;padding:16px 14px calc(14px + env(safe-area-inset-bottom))!important;border-bottom:0}#project-create-settings-content .project-access-grid{grid-template-columns:minmax(0,1fr);max-height:30dvh;gap:7px}#project-create-settings-content .project-access-option{min-height:50px;padding:11px 12px}#project-create-settings-modal [role="dialog"]>div:last-child{position:sticky;bottom:-1px;background:var(--color-surface);padding-bottom:4px;z-index:1}#project-create-settings-modal [data-settings-save],#project-create-settings-modal [data-settings-cancel]{flex:1;min-width:0}#project-create-settings-title{font-size:16px}#project-create-settings-content>.filter-group{padding:12px}}'
      ].join('');
      document.head.appendChild(style);
    },

    bindEvents: function () {
      const statusFilter = document.getElementById('project-status-filter');
      const searchInput = document.getElementById('project-search');
      const createButton = document.getElementById('project-create-button');

      if (statusFilter) {
        statusFilter.addEventListener('change', () => {
          this.applyFilters();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.applyFilters();
        });
      }

      if (createButton) {
        createButton.addEventListener('click', () => {
          this.openCreateForm();
        });
      }

      const tableContainer = document.getElementById('projects-table-container');
      if (tableContainer) {
        tableContainer.addEventListener('click', (event) => {
          const needsButton = event.target.closest('.project-material-needs-button');
          const editButton = event.target.closest('.project-edit-button');
          const variantsButton = event.target.closest('.project-color-size-button');
          const projectId = (needsButton || editButton || variantsButton) &&
            (needsButton || editButton || variantsButton).getAttribute('data-project-id');
          if (!projectId) return;
          if (needsButton) this.openProjectNeedsForm(projectId);
          else if (editButton) this.openProjectEditForm(projectId);
          else if (variantsButton) this.openProjectColorSizeForm(projectId);
        });
      }
    },

    canEditProjects: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && (
        router.isAdmin() ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('PROJECT_EDIT') !== -1)
      ));
    },

    openProjectEditForm: function (projectId) {
      const project = this.projects.find((item) =>
        String(item.ID || item.Id || item.id) === String(projectId)
      );
      if (!project) {
        alert('اطلاعات پروژه پیدا نشد. فهرست پروژه‌ها را تازه‌سازی کنید.');
        return;
      }
      if (!this.canEditProjects()) {
        alert('دسترسی ویرایش پروژه را ندارید.');
        return;
      }
      // فرم ویرایش عمداً از همان فرم ایجاد پروژه استفاده می‌کند تا ساختار و تجربه کاربری یکسان بماند.
      this.openCreateForm(project);
    },

    openProjectColorSizeForm: function (projectId) {
      const project = this.projects.find((item) =>
        String(item.ID || item.Id || item.id) === String(projectId)
      );
      if (!project) {
        alert('اطلاعات پروژه پیدا نشد. فهرست پروژه‌ها را تازه‌سازی کنید.');
        return;
      }
      if (!this.canEditProjects()) {
        alert('دسترسی ویرایش پروژه را ندارید.');
        return;
      }
      this.openProjectEditForm(projectId);
      const modal = document.getElementById('project-edit-modal');
      if (modal) {
        const button = modal.querySelector('[data-project-edit-color-size]');
        if (button) button.click();
      }
    },

    canManageProcurement: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && (
        router.isAdmin() ||
        (Array.isArray(router.permissions) &&
          router.permissions.indexOf('PROCUREMENT_MANAGE') !== -1)
      ));
    },

    openProjectNeedsForm: function (projectId) {
      const project = this.projects.find((item) =>
        String(item.ID || item.Id || item.id) === String(projectId)
      ) || {};
      const existingModal = document.getElementById('project-needs-modal');
      if (existingModal) existingModal.remove();

      const modal = document.createElement('div');
      modal.id = 'project-needs-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10050;background:var(--color-overlay,rgba(0,0,0,.45));display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;direction:rtl;';
      modal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-needs-title" style="background:var(--color-surface,#fff);color:var(--color-text,#222);width:100%;max-width:900px;max-height:92vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px"><div><h3 id="project-needs-title" style="margin:0 0 6px">ثبت نیازهای ملزومات پروژه</h3><div>' + this.escape(project.ProjectCode || '') + ' — ' + this.escape(project.Title || project.Name || '') + '</div></div><button type="button" class="btn btn-light" data-needs-close>بستن</button></div>' +
        '<div class="alert alert-info">هر ردیف یک نیاز جداگانه است. برای سفارش‌گذاری، بعداً از دکمه «سفارش مرتبط با پروژه» استفاده کنید.</div>' +
        '<form id="project-needs-form"><div id="project-needs-rows"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn btn-secondary" id="project-needs-add-row">+ افزودن ردیف</button><button type="submit" class="btn btn-primary">ثبت نیازها</button></div>' +
        '<div id="project-needs-error" class="alert alert-danger" hidden style="margin-top:12px"></div></form></div>';
      document.body.appendChild(modal);

      const rows = modal.querySelector('#project-needs-rows');
      const form = modal.querySelector('#project-needs-form');
      const errorBox = modal.querySelector('#project-needs-error');
      const close = () => { if (!modal.dataset.saving) modal.remove(); };
      modal.querySelector('[data-needs-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });

      const addRow = () => {
        const index = rows.querySelectorAll('[data-need-row]').length;
        const row = document.createElement('div');
        row.className = 'card';
        row.setAttribute('data-need-row', String(index));
        row.style.cssText = 'margin-top:12px;border:1px solid var(--color-border,#ddd);border-radius:8px;padding:14px;';
        row.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong>نیاز ' + (index + 1) + '</strong><button type="button" class="btn btn-light" data-need-remove>حذف ردیف</button></div>' +
          '<div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">' +
          '<label class="form-group"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required maxlength="100" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>مقدار موردنیاز *</span><input name="RequestedQuantity" type="number" min="0.001" step="any" required style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>تاریخ موردنیاز</span><input name="NeededBy" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۷/۲۷" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>توضیحات</span><input name="Notes" maxlength="500" style="width:100%;box-sizing:border-box"></label></div>';
        rows.appendChild(row);
      };

      modal.querySelector('#project-needs-add-row').addEventListener('click', addRow);
      rows.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-need-remove]');
        if (!remove) return;
        if (rows.querySelectorAll('[data-need-row]').length <= 1) {
          errorBox.textContent = 'حداقل یک ردیف باید باقی بماند.';
          errorBox.hidden = false;
          return;
        }
        remove.closest('[data-need-row]').remove();
      });
      addRow();

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (modal.dataset.saving) return;
        errorBox.hidden = true;
        const dataRows = Array.from(rows.querySelectorAll('[data-need-row]')).map((row) => {
          const get = (name) => row.querySelector('[name="' + name + '"]').value.trim();
          return {
            row,
            payload: {
              ProjectID: String(projectId),
              ItemName: get('ItemName'),
              Unit: get('Unit'),
              RequestedQuantity: Number(get('RequestedQuantity')),
              NeededBy: get('NeededBy'),
              Notes: get('Notes')
            }
          };
        });
        const submit = form.querySelector('[type="submit"]');
        modal.dataset.saving = '1';
        submit.disabled = true;
        submit.textContent = 'در حال ثبت...';
        let saved = 0;
        try {
          dataRows.forEach((entry) => {
            entry.payload.NeededBy = projectJalaliDateToIso(entry.payload.NeededBy);
          });
          for (let i = 0; i < dataRows.length; i++) {
            await window.PMS.Api.post('/procurement/needs', dataRows[i].payload);
            dataRows[i].row.remove();
            saved++;
          }
          modal.remove();
          window.alert('تعداد ' + saved + ' نیاز برای پروژه ثبت شد.');
        } catch (error) {
          delete modal.dataset.saving;
          errorBox.textContent = (error && error.message ? error.message : 'ثبت نیازها ناموفق بود.') +
            (saved ? ' تا پیش از خطا، ' + saved + ' ردیف ثبت شده است؛ فقط ردیف‌های باقی‌مانده را دوباره ثبت کنید.' : '');
          errorBox.hidden = false;
          submit.disabled = false;
          submit.textContent = 'ثبت نیازها';
        }
      });
    },

    loadProjectStatuses: async function () {
      const applyLookups = (rawData) => {
        let data = rawData;
        for (let i = 0; i < 4 && data && !Array.isArray(data); i++) {
          if (data.data !== undefined) { data = data.data; continue; }
          break;
        }
        this.projectStatuses = data && Array.isArray(data.projectStatuses) ? data.projectStatuses : [];
        const select = document.getElementById('project-status-filter');
        if (select && this.projectStatuses.length) {
          const current = select.value;
          select.innerHTML = '<option value="">همه وضعیت‌ها</option>' + this.projectStatuses.map((item) => {
            const code = item.Code || item.ID || '';
            const name = item.Name || item.Code || code;
            return '<option value="' + this.escape(code) + '">' + this.escape(name) + '</option>';
          }).join('');
          if (Array.from(select.options).some((option) => option.value === current)) select.value = current;
          this.applyFilters();
        }
      };

      try {
        const result = await window.PMS.Api.getCached(
          '/project-dashboard/lookups',
          'dashboard_project_lookups_v1',
          {
            onRefresh: (freshData) => applyLookups(freshData)
          }
        );
        applyLookups(result && result.data !== undefined ? result.data : result);
      } catch (error) {
        // در صورت در دسترس نبودن فهرست وضعیت‌های سفارشی، گزینه‌های قبلی حفظ می‌شوند.
      }
    },

    loadStageLookups: async function () {
      const workflowIds = Array.from(new Set((this.projects || [])
        .map((project) => String(project.WorkflowID || project.WorkflowId || ''))
        .filter(Boolean)));
      if (!workflowIds.length) return;

      try {
        const entries = await Promise.all(workflowIds.map(async (workflowId) => {
          const result = await window.PMS.Api.getCached(
            '/workflows/' + encodeURIComponent(workflowId) + '/steps',
            'workflow_steps_' + workflowId
          );
          let data = result && result.data !== undefined ? result.data : result;
          for (let i = 0; i < 5 && data && !Array.isArray(data); i++) {
            if (Array.isArray(data.items)) { data = data.items; break; }
            if (Array.isArray(data.steps)) { data = data.steps; break; }
            if (Array.isArray(data.data)) { data = data.data; break; }
            if (data.data !== undefined) { data = data.data; continue; }
            break;
          }
          return [workflowId, Array.isArray(data) ? data : []];
        }));
        const lookup = {};
        entries.forEach(([workflowId, steps]) => {
          lookup[workflowId] = steps.sort((a, b) =>
            Number(a.StepOrder || a.Order || a.stepOrder || 0) -
            Number(b.StepOrder || b.Order || b.stepOrder || 0)
          );
        });
        this.workflowStepsByWorkflow = lookup;
        this.stageLookupsLoaded = true;
        this.applyFilters();
      } catch (error) {
        console.warn('دریافت نام مراحل پروژه‌ها انجام نشد.', error);
      }
    },

    getProjectStageName: function (project) {
      const explicit = project.CurrentStepName || project.CurrentStepTitle ||
        project.CurrentStageName || project.CurrentStage || project.StageName;
      if (explicit && !this.isLikelyStepCode(explicit)) return String(explicit).trim();

      const workflowId = String(project.WorkflowID || project.WorkflowId || '');
      const steps = this.workflowStepsByWorkflow[workflowId] || [];
      const currentStepId = project.CurrentStepID || project.CurrentStageID ||
        project.CurrentStep || project.CurrentStageCode || '';
      const step = steps.find((item) => {
        const ids = [item.ID, item.Id, item.id, item.Code, item.code];
        return ids.some((value) => value !== null && value !== undefined &&
          String(value).toLowerCase() === String(currentStepId).toLowerCase());
      });

      return String((step && (step.Name || step.Title || step.name || step.title)) ||
        explicit || currentStepId || 'نامشخص').trim();
    },

    isLikelyStepCode: function (value) {
      const text = String(value || '').trim();
      return /^[A-Z0-9_-]+$/.test(text) && /[A-Z]/.test(text);
    },

    // ========================================================
    // بارگذاری پروژه‌ها
    // ========================================================

    loadProjects: async function () {
      const loading = document.getElementById('projects-loading');

      const cached = window.PMS.Cache.get(CACHE_KEY);

      if (cached !== null) {
        this.projects = this.normalizeProjects(cached);
        this.applyFilters();
        this.loadStageLookups();

        if (loading) {
          loading.hidden = true;
        }
      } else if (loading) {
        loading.hidden = false;
      }

      try {
        const result = await window.PMS.Api.getCached(
          '/projects',
          CACHE_KEY,
          {
            onRefresh: (data) => {
              this.projects = this.normalizeProjects(data);
              this.applyFilters();
              this.loadStageLookups();
            },

            onError: (error, isBackground) => {
              if (!isBackground) {
                this.showError(error);
              }
            }
          }
        );

        if (result && result.cached === false) {
          this.projects = this.normalizeProjects(result.data);
          this.applyFilters();
          this.loadStageLookups();
        }

        if (loading) {
          loading.hidden = true;
        }
      } catch (error) {
        if (loading) {
          loading.hidden = true;
        }

        if (cached === null) {
          this.showError(error);
        }
      }
    },

    openProjectImageCache: function () {
      if (this.projectCardImageDbPromise) return this.projectCardImageDbPromise;
      this.projectCardImageDbPromise = new Promise(function (resolve) {
        if (!window.indexedDB) { resolve(null); return; }
        let request;
        try { request = window.indexedDB.open('pms-project-image-cache', 1); }
        catch (error) { resolve(null); return; }
        request.onupgradeneeded = function () {
          const db = request.result;
          if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'key' });
        };
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { resolve(null); };
      });
      return this.projectCardImageDbPromise;
    },

    readProjectImageCache: async function (key) {
      const db = await this.openProjectImageCache();
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          const request = db.transaction('images', 'readonly').objectStore('images').get(String(key));
          request.onsuccess = function () {
            const record = request.result;
            resolve(record && record.src ? record.src : null);
          };
          request.onerror = function () { resolve(null); };
        } catch (error) { resolve(null); }
      });
    },

    writeProjectImageCache: async function (key, src) {
      const db = await this.openProjectImageCache();
      if (!db || !src) return;
      await new Promise(function (resolve) {
        try {
          const request = db.transaction('images', 'readwrite').objectStore('images').put({
            key: String(key), src: String(src), savedAt: Date.now()
          });
          request.onsuccess = request.onerror = function () { resolve(); };
        } catch (error) { resolve(); }
      });
    },

    normalizeProjectAttachments: function (response) {
      let items = window.PMS.Api && typeof window.PMS.Api.extractData === 'function'
        ? window.PMS.Api.extractData(response)
        : response;
      if (items && !Array.isArray(items)) items = items.items || items.attachments || items.data || [];
      return Array.isArray(items) ? items : [];
    },

    invalidateProjectCardAttachmentMetadata: function (projectId) {
      const cache = window.PMS && window.PMS.Cache;
      if (cache) cache.remove('project_card_attachments_v2');
      this.projectCardAttachmentsPromise = null;
      if (projectId !== undefined && projectId !== null && String(projectId)) {
        const id = String(projectId);
        delete this.projectCardImages[id];
        delete this.projectCardImageAttachments[id];
        this.projectCardImageStates[id] = 'loading';
      }
    },

    getProjectCardAttachments: function () {
      const cache = window.PMS && window.PMS.Cache;
      const cacheKey = 'project_card_attachments_v2';
      const cached = cache ? cache.get(cacheKey) : null;
      // A valid five-minute cache avoids a new /attachments request on every
      // search/filter render. Uploads and deletions explicitly invalidate it.
      if (cached !== null && Array.isArray(cached)) return Promise.resolve(cached);
      if (!this.projectCardAttachmentsPromise) {
        this.projectCardAttachmentsPromise = window.PMS.Api.get('/attachments')
          .then((response) => {
            const items = this.normalizeProjectAttachments(response);
            if (cache) cache.set(cacheKey, items, { ttl: 5 * 60 * 1000 });
            return items;
          })
          .finally(() => { this.projectCardAttachmentsPromise = null; });
      }
      return this.projectCardAttachmentsPromise;
    },

    loadProjectCardImages: async function (projects) {
      const projectIds = (projects || []).map(function (project) {
        return String(project.ID || project.Id || project.id || '');
      }).filter(Boolean);
      projectIds.forEach((id) => {
        if (!this.projectCardImageStates[id]) this.projectCardImageStates[id] = 'loading';
      });
      this.applyProjectCardImagesToCards();

      const router = window.PMS && window.PMS.Router;
      const canViewAttachments = !!(router && (
        (typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_VIEW') !== -1)
      ));
      if (!canViewAttachments) {
        projectIds.forEach((id) => { this.projectCardImageStates[id] = 'empty'; });
        this.applyProjectCardImagesToCards();
        return;
      }

      try {
        const attachments = await this.getProjectCardAttachments();
        const visibleProjectIds = new Set(projectIds);
        const latestImageByProject = {};
        attachments.filter(function (item) {
          const type = String(item.EntityType || item.entityType || '').toUpperCase();
          const id = String(item.EntityID || item.entityID || item.EntityId || '');
          const mime = String(item.MimeType || item.mimeType || '').toLowerCase();
          const status = String(item.Status || item.status || 'ACTIVE').toUpperCase();
          return type === 'PROJECT' && visibleProjectIds.has(id) && mime.indexOf('image/') === 0 &&
            status !== 'DELETED' && status !== 'VOID';
        }).sort(function (a, b) {
          return new Date(b.UploadedAt || b.uploadedAt || b.CreatedAt || 0).getTime() -
            new Date(a.UploadedAt || a.uploadedAt || a.CreatedAt || 0).getTime();
        }).forEach((item) => {
          const id = String(item.EntityID || item.entityID || item.EntityId || '');
          if (id && !latestImageByProject[id]) latestImageByProject[id] = item;
        });

        this.projectCardImageAttachments = latestImageByProject;
        projectIds.forEach((id) => {
          if (!latestImageByProject[id] && !this.projectCardImages[id]) this.projectCardImageStates[id] = 'empty';
          else if (latestImageByProject[id] && !this.projectCardImages[id]) this.projectCardImageStates[id] = 'loading';
        });
        this.applyProjectCardImagesToCards();

        const container = document.getElementById('projects-table-container');
        if (!container) return;
        if (this.projectCardImageObserver) this.projectCardImageObserver.disconnect();

        if ('IntersectionObserver' in window) {
          this.projectCardImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const media = entry.target;
              this.projectCardImageObserver.unobserve(media);
              const projectId = String(media.getAttribute('data-project-media') || '');
              const attachment = this.projectCardImageAttachments[projectId];
              if (attachment) this.loadOneProjectCardImage(projectId, attachment);
            });
          }, { rootMargin: '320px 0px', threshold: 0.01 });

          container.querySelectorAll('[data-project-media]').forEach((media) => {
            const id = String(media.getAttribute('data-project-media') || '');
            if (this.projectCardImages[id]) return;
            if (this.projectCardImageAttachments[id]) this.projectCardImageObserver.observe(media);
          });
        } else {
          // Older browsers: load a small first batch, then continue as images finish.
          Object.keys(latestImageByProject).slice(0, 4).forEach((id) => this.loadOneProjectCardImage(id, latestImageByProject[id]));
        }
      } catch (error) {
        console.warn('Project thumbnails are unavailable:', error);
        projectIds.forEach((id) => { if (this.projectCardImageStates[id] === 'loading') this.projectCardImageStates[id] = 'error'; });
        this.applyProjectCardImagesToCards();
      }
    },

    loadOneProjectCardImage: async function (projectId, attachment) {
      if (this.projectCardImages[projectId] || this.projectCardImageInflight[projectId]) return;
      const attachmentId = attachment && (attachment.ID || attachment.Id || attachment.id);
      if (!attachmentId) { this.projectCardImageStates[projectId] = 'empty'; this.applyProjectCardImagesToCards(); return; }
      const cacheKey = 'attachment:' + String(attachmentId);
      this.projectCardImageInflight[projectId] = true;
      this.projectCardImageStates[projectId] = 'loading-image';
      this.applyProjectCardImagesToCards();
      try {
        // IndexedDB persists image data between page refreshes without filling localStorage.
        let src = await this.readProjectImageCache(cacheKey);
        if (!src) {
          const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download');
          const data = window.PMS.Api.extractData
            ? (window.PMS.Api.extractData(response) || {})
            : ((response && response.data) || response || {});
          const base64 = data.Base64 || data.base64;
          const mime = data.MimeType || data.mimeType || attachment.MimeType || attachment.mimeType || 'image/jpeg';
          if (base64) src = 'data:' + mime + ';base64,' + String(base64).replace(/^data:[^,]*;base64,/, '');
          else {
            const url = data.url || data.downloadUrl || data.DownloadUrl;
            if (url && /^https?:\/\//i.test(String(url))) src = String(url);
          }
          if (src && src.indexOf('data:') === 0) this.writeProjectImageCache(cacheKey, src);
        }
        if (src) {
          this.projectCardImages[projectId] = src;
          this.projectCardImageStates[projectId] = 'ready';
        } else this.projectCardImageStates[projectId] = 'empty';
      } catch (error) {
        console.warn('Project thumbnail could not be loaded:', projectId, error);
        this.projectCardImageStates[projectId] = 'error';
      } finally {
        delete this.projectCardImageInflight[projectId];
        this.applyProjectCardImagesToCards();
      }
    },

    applyProjectCardImagesToCards: function () {
      const container = document.getElementById('projects-table-container');
      if (!container) return;
      container.querySelectorAll('[data-project-media]').forEach((media) => {
        const id = String(media.getAttribute('data-project-media') || '');
        const image = media.querySelector('img[data-project-thumbnail]');
        const placeholder = media.querySelector('.project-list-card-image-placeholder');
        const state = this.projectCardImageStates[id] || 'loading';
        const src = this.projectCardImages[id];
        media.dataset.imageState = src ? 'ready' : state;
        if (src && image) {
          if (image.src !== src) image.src = src;
          image.hidden = false;
          image.alt = 'تصویر پروژه';
          if (placeholder) placeholder.hidden = true;
        } else {
          if (image) { image.removeAttribute('src'); image.hidden = true; }
          if (placeholder) {
            placeholder.hidden = false;
            placeholder.innerHTML = state === 'loading' || state === 'loading-image'
              ? '<span class="project-list-image-spinner" aria-hidden="true"></span><span class="project-list-card-image-label">در حال بارگذاری تصویر</span>'
              : state === 'error'
                ? '<span class="project-list-card-image-empty-icon" aria-hidden="true">!</span><span class="project-list-card-image-label">تصویر در دسترس نیست</span>'
                : '<span class="project-list-card-image-empty-icon" aria-hidden="true">▧</span><span class="project-list-card-image-label">بدون تصویر</span>';
          }
        }
      });
    },

    normalizeProjects: function (data) {
      if (Array.isArray(data)) {
        return data;
      }

      if (data && Array.isArray(data.projects)) {
        return data.projects;
      }

      if (data && Array.isArray(data.items)) {
        return data.items;
      }

      if (data && data.data) {
        return this.normalizeProjects(data.data);
      }

      return [];
    },

    // ========================================================
    // فرم ایجاد پروژه
    // ========================================================

    openCreateForm: async function (editProject) {
      if (this.modal) {
        this.modal.remove();
      }

      const modal = document.createElement('div');

      const isEditMode = !!(editProject && (editProject.ID || editProject.Id || editProject.id));
      const editProjectId = isEditMode ? String(editProject.ID || editProject.Id || editProject.id) : '';
      modal.id = isEditMode ? 'project-edit-modal' : 'project-create-modal';
      modal.dataset.editMode = isEditMode ? 'true' : 'false';
      if (isEditMode) modal.dataset.projectId = editProjectId;

      modal.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'background:var(--color-overlay)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:16px',
        'overflow-y:auto'
      ].join(';');

      modal.innerHTML = `
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-create-title"
          style="
            background:var(--color-surface);
            width:100%;
            max-width:760px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:10px;
            padding:24px;
            box-sizing:border-box;
            direction:rtl;
            color:var(--color-text);
          "
        >
          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:20px;
          ">
            <h3 id="project-create-title" style="margin:0;">
              ${isEditMode ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}
            </h3>

            <div style="display:flex;align-items:center;gap:8px">
              <button type="button" id="project-settings-open" class="btn btn-light" aria-label="تنظیمات فرم پروژه" title="تنظیمات فرم" style="display:inline-flex;align-items:center;gap:7px">
                <span aria-hidden="true" style="font-size:18px;line-height:1">⚙</span>
                <span>تنظیمات</span>
              </button>
              <button type="button" id="project-create-close" class="btn btn-light" aria-label="بستن">✕</button>
            </div>
          </div>

          <div
            id="project-create-error"
            class="alert alert-danger"
            hidden
            style="margin-bottom:16px;"
          ></div>
          <div
            id="project-create-progress"
            class="project-create-progress"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            hidden
          >
            <div class="project-create-progress-card">
              <div class="project-create-progress-orbit" aria-hidden="true">
                <span class="project-create-progress-spinner"></span>
                <span class="project-create-progress-spark">✦</span>
              </div>
              <div class="project-create-progress-heading">لطفاً کمی صبر کنید</div>
              <div id="project-create-progress-text" class="project-create-progress-message"></div>
              <div class="project-create-progress-track" aria-hidden="true"><span></span></div>
              <div class="project-create-progress-footnote">اطلاعات شما در حال پردازش است؛ این پنجره را نبندید.</div>
            </div>
          </div>

          <form id="project-create-form">
            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-code">کد پروژه <span style="color:var(--color-danger);">*</span></label>
              <input type="text" id="new-project-code" name="ProjectCode" required maxlength="100" autocomplete="off" placeholder="کد پروژه را وارد کنید" style="width:100%;box-sizing:border-box;" ${isEditMode ? "readonly aria-readonly=\"true\"" : ""}>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">کد را اپراتور وارد می‌کند و پس از ایجاد پروژه قابل تغییر نیست.</small>
            </div>
            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-title">نام پروژه <span style="color:var(--color-danger);">*</span></label>
              <input type="text" id="new-project-title" name="Title" required maxlength="200" autocomplete="off" placeholder="نام پروژه تولید" style="width:100%;box-sizing:border-box;">
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-quantity">
                تعداد پیشنهادی <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span>
              </label>
              <input
                type="number"
                id="new-project-quantity"
                name="Quantity"
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="تعداد پیشنهادی قطعات"
                style="width:100%;box-sizing:border-box;"
              >
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-workflow">
                گردش کار <span style="color:var(--color-danger);">*</span>
              </label>

              <select
                id="new-project-workflow"
                name="WorkflowID"
                required
                style="width:100%;box-sizing:border-box;"
                ${isEditMode ? "disabled aria-disabled=\"true\"" : ""}
              >
                <option value="">در حال دریافت گردش کارها...</option>
              </select>

              <small style="display:block;margin-top:6px;color:var(--color-text-secondary);">
                یک گردش کار را انتخاب کنید. پس از ایجاد پروژه، مسیر گردش کار قابل تغییر نیست.
              </small>
            </div>

            <div class="filter-group" style="margin-bottom:20px;">
              <label for="new-project-description">
                توضیحات
              </label>

              <textarea
                id="new-project-description"
                name="Description"
                rows="3"
                placeholder="توضیحات اختیاری درباره پروژه"
                style="width:100%;box-sizing:border-box;resize:vertical;"
              ></textarea>
            </div>

            <div id="new-project-departments-setting" class="filter-group" style="margin-bottom:18px;">
              <label>واحدهای مجاز برای مشاهده پروژه و ثبت رویداد <span style="color:var(--color-danger);">*</span></label>
              <div id="new-project-departments" class="project-access-grid" role="group" aria-label="انتخاب واحدهای مجاز" aria-describedby="new-project-departments-help"><div class="project-lookup-loading">در حال دریافت واحدها…</div></div>
              <small id="new-project-departments-help" style="display:block;margin-top:6px;color:var(--color-text-secondary);">حداقل یک واحد را انتخاب کنید.</small>
            </div>
            <div id="new-project-users-setting" class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-users">کاربران مجاز <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span></label>
              <select id="new-project-users" name="AllowedUserIDs" multiple size="5" style="width:100%;box-sizing:border-box;min-height:120px;"></select>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">اگر انتخاب نشود، محدودیت اختصاصی کاربر برای پروژه ثبت نمی‌شود.</small>
            </div>
            <div id="new-project-status-setting" class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-status">وضعیت پروژه پس از ایجاد</label>
              <select id="new-project-status" name="Status" style="width:100%;box-sizing:border-box;"><option value="">در حال دریافت وضعیت‌ها...</option></select>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">وضعیتی که انتخاب می‌کنید هنگام ثبت پروژه اعمال می‌شود.</small>
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-file">افزودن فایل <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span></label>
              <input type="file" id="new-project-file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style="width:100%;box-sizing:border-box;">
              <div id="new-project-filename-wrap" class="filter-group" style="margin-top:10px;" hidden>
                <label for="new-project-filename">نام فایل</label>
                <input type="text" id="new-project-filename" maxlength="180" autocomplete="off" placeholder="نام دلخواه فایل را وارد کنید" style="width:100%;box-sizing:border-box;min-height:42px;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text);font:inherit;">
                <small id="new-project-filename-preview" style="display:block;margin-top:5px;color:var(--color-text-secondary);overflow-wrap:anywhere;">نام نهایی فایل با کد پروژه ترکیب می‌شود.</small>
              </div>
              <small id="new-project-file-help" style="display:block;margin-top:5px;color:var(--color-text-secondary);">پس از انتخاب فایل، نام آن را بررسی یا ویرایش کنید. نام نهایی با کد پروژه ترکیب می‌شود.</small>
              <div id="project-edit-attachments" ${isEditMode ? '' : 'hidden'} style="margin-top:14px;padding:12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface-hover, var(--color-surface));">
                <div style="font-weight:700;margin-bottom:8px;">فایل‌های فعلی پروژه</div>
                <div id="project-edit-attachments-list" aria-live="polite" style="display:flex;flex-direction:column;gap:8px;">
                  <div style="color:var(--color-text-secondary);font-size:13px;">در حال دریافت فایل‌ها…</div>
                </div>
                <small style="display:block;margin-top:8px;color:var(--color-text-secondary);">برای جایگزینی فایل، فایل قبلی را حذف و فایل جدیدی انتخاب کنید. حذف فایل فقط با دسترسی حذف پیوست امکان‌پذیر است.</small>
              </div>
            </div>

            <div id="new-project-notify-setting" class="filter-group" style="margin-bottom:16px;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="new-project-notify" checked>
                <span>فعال بودن اطلاع‌رسانی</span>
              </label>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">این گزینه به‌صورت پیش‌فرض فعال است.</small>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;margin:4px 0 16px;">
              ${this.canManageProcurement() ? '<button type="button" id="new-project-needs-button" class="btn btn-secondary">ملزومات موردنیاز</button>' : ''}
              <button type="button" id="new-project-color-size-button" class="btn btn-secondary">تعریف رنگ‌بندی و سایزبندی</button>
            </div>
            <div id="new-project-needs-summary" style="font-size:12px;color:var(--color-text-secondary);margin:-8px 0 14px;">ملزومات اختیاری است و هنوز موردی تعریف نشده است.</div>
            <div id="new-project-color-size-summary" style="font-size:12px;color:var(--color-text-secondary);margin:-8px 0 16px;">رنگ‌بندی و سایزبندی اختیاری است و هنوز تعریف نشده است.</div>

            <div style="
              display:flex;
              justify-content:flex-start;
              gap:10px;
              flex-wrap:wrap;
            ">
              <button
                type="submit"
                id="project-create-submit"
                class="btn btn-primary"
                ${isEditMode ? "disabled" : ""}
                ${isEditMode ? 'title="در انتظار دریافت تنظیمات و فایل‌های پروژه"' : ""}
              >
                ${isEditMode ? "در حال دریافت اطلاعات…" : "ثبت پروژه"}
              </button>

              <button
                type="button"
                id="project-create-cancel"
                class="btn btn-light"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;

      const settingsModal = document.createElement('div');
      settingsModal.id = 'project-create-settings-modal';
      settingsModal.style.cssText = 'position:fixed;inset:0;z-index:10020;background:var(--color-overlay,rgba(0,0,0,.5));display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;';
      settingsModal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-create-settings-title" style="background:var(--color-surface);color:var(--color-text);width:100%;max-width:680px;max-height:88vh;overflow:auto;border:1px solid var(--color-border);border-radius:14px;padding:20px;box-sizing:border-box;box-shadow:var(--shadow-lg,0 18px 50px rgba(0,0,0,.2))">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px"><h3 id="project-create-settings-title" style="margin:0">' + (isEditMode ? 'تنظیمات پروژه' : 'تنظیمات پیش‌فرض ایجاد پروژه') + '</h3><button type="button" class="btn btn-light" data-settings-close aria-label="بستن تنظیمات">✕</button></div>' +
        '<p style="font-size:12px;line-height:1.9;color:var(--color-text-secondary);margin:0 0 16px">' + (isEditMode ? 'تنظیمات دسترسی، وضعیت و اطلاع‌رسانی همین پروژه را تغییر دهید.' : 'این انتخاب‌ها برای دفعات بعد ذخیره می‌شوند و هنگام ساخت پروژه جدید به‌صورت پیش‌فرض اعمال خواهند شد.') + '</p>' +
        '<div id="project-create-settings-content"></div>' +
        '<div id="project-settings-error" class="alert alert-danger" hidden style="margin-top:12px"></div>' +
        '<div style="display:flex;justify-content:flex-start;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid var(--color-border)"><button type="button" class="btn btn-primary" data-settings-save>ذخیره تنظیمات</button><button type="button" class="btn btn-light" data-settings-cancel>بستن</button></div></div>';
      modal.appendChild(settingsModal);
      const editReadiness = { lookupsLoaded: !isEditMode, attachmentsLoaded: !isEditMode };
      const editSubmitButton = modal.querySelector('#project-create-submit');
      const updateEditSubmitReadiness = () => {
        if (!isEditMode || !editSubmitButton || !editSubmitButton.isConnected) return;
        const ready = editReadiness.lookupsLoaded && editReadiness.attachmentsLoaded;
        editSubmitButton.disabled = !ready;
        editSubmitButton.textContent = ready ? 'ذخیره تغییرات' : 'در حال دریافت اطلاعات…';
        editSubmitButton.title = ready ? '' : 'تا دریافت تنظیمات و فهرست فایل‌های پروژه، ذخیره تغییرات غیرفعال است.';
        editSubmitButton.setAttribute('aria-busy', ready ? 'false' : 'true');
      };
      const settingsContent = settingsModal.querySelector('#project-create-settings-content');
      ['new-project-departments-setting','new-project-users-setting','new-project-status-setting','new-project-notify-setting'].forEach((id) => {
        const setting = modal.querySelector('#' + id);
        if (setting && settingsContent) settingsContent.appendChild(setting);
      });
      if (isEditMode) {
        modal._projectEditReadiness = editReadiness;
        modal._updateProjectEditReadiness = updateEditSubmitReadiness;
        updateEditSubmitReadiness();
      }
      const projectSettingsKey = projectSettingsStorageKey();
      const getSelectedDepartmentIds = () => Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]:checked')).map((input) => input.value).filter(Boolean);
      const getSelectedUserIds = () => Array.from(modal.querySelector('#new-project-users').selectedOptions).map((option) => option.value).filter(Boolean);
      const saveProjectSettings = () => {
        const settings = { departmentIds:getSelectedDepartmentIds(), userIds:getSelectedUserIds(), notifyEnabled:!!modal.querySelector('#new-project-notify').checked, status:String((modal.querySelector('#new-project-status') || {}).value || '') };
        if (!isEditMode) {
          try { localStorage.setItem(projectSettingsKey, JSON.stringify(settings)); } catch (error) {}
        }
        return settings;
      };
      const applySavedProjectSettings = () => {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(projectSettingsKey) || 'null'); } catch (error) {}
        const checks = Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]'));
        if (saved && Array.isArray(saved.departmentIds)) checks.forEach((input) => { input.checked = saved.departmentIds.map(String).includes(String(input.value)); });
        const userSelect = modal.querySelector('#new-project-users');
        if (saved && Array.isArray(saved.userIds)) Array.from(userSelect.options).forEach((option) => { option.selected = saved.userIds.map(String).includes(String(option.value)); });
        const notify = modal.querySelector('#new-project-notify');
        if (saved && typeof saved.notifyEnabled === 'boolean') notify.checked = saved.notifyEnabled;
        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect && saved && saved.status && Array.from(statusSelect.options).some((option) => option.value === saved.status)) statusSelect.value = saved.status;
        else if (statusSelect && statusSelect.options.length > 1) {
          const awaiting = Array.from(statusSelect.options).find((option) => /در\s*انتظار\s*اقدام/.test(option.textContent));
          statusSelect.value = awaiting ? awaiting.value : statusSelect.options[1].value;
        }
      };
      const openSettings = () => { settingsModal.style.display = 'flex'; const first = settingsModal.querySelector('input,select,button'); if (first) first.focus(); };
      const closeSettings = () => { settingsModal.style.display = 'none'; };
      modal.querySelector('#project-settings-open').addEventListener('click', openSettings);
      settingsModal.querySelector('[data-settings-close]').addEventListener('click', closeSettings);
      settingsModal.querySelector('[data-settings-cancel]').addEventListener('click', closeSettings);
      settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettings(); });
      settingsModal.querySelector('[data-settings-save]').addEventListener('click', () => {
        const error = settingsModal.querySelector('#project-settings-error');
        if (!getSelectedDepartmentIds().length) {
          error.textContent = 'حداقل یک واحد مجاز انتخاب کنید.';
          error.hidden = false;
          return;
        }
        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect && statusSelect.options.length > 1 && !statusSelect.value) {
          error.textContent = 'وضعیت پروژه پس از ایجاد را انتخاب کنید.';
          error.hidden = false;
          return;
        }
        saveProjectSettings();
        error.hidden = true;
        closeSettings();
      });
      settingsContent.addEventListener('change', saveProjectSettings);
      settingsContent.addEventListener('click', (event) => {
        if (event.target && event.target.matches('input[name="AvailableDepartmentIDs"]')) saveProjectSettings();
      });

      const closeButton = modal.querySelector('#project-create-close');
      const cancelButton = modal.querySelector('#project-create-cancel');
      const form = modal.querySelector('#project-create-form');
      const workflowSelect = modal.querySelector('#new-project-workflow');
      const departmentsSelect = modal.querySelector('#new-project-departments');
      const usersSelect = modal.querySelector('#new-project-users');
      const fileInput = modal.querySelector('#new-project-file');
      const fileHelp = modal.querySelector('#new-project-file-help');
      const fileNameInput = modal.querySelector('#new-project-filename');
      const fileNameWrap = modal.querySelector('#new-project-filename-wrap');
      const fileNamePreview = modal.querySelector('#new-project-filename-preview');
      const updateFileNamePreview = () => {
        if (!fileNamePreview) return;
        const projectCode = String((modal.querySelector('#new-project-code') || {}).value || '').trim().replace(/[\\/:*?"<>|]/g, '_');
        const enteredName = String(fileNameInput && fileNameInput.value || '').trim();
        fileNamePreview.textContent = projectCode && enteredName ? 'نام نهایی: ' + projectCode + '_' + enteredName : 'نام نهایی فایل با کد پروژه ترکیب می‌شود.';
      };
      if (fileInput) fileInput.addEventListener('change', () => {
        const selected = fileInput.files && fileInput.files[0];
        if (fileNameWrap) fileNameWrap.hidden = !selected;
        if (selected && fileNameInput) {
          const lastDot = selected.name.lastIndexOf('.');
          fileNameInput.value = lastDot > 0 ? selected.name.slice(0, lastDot) : selected.name;
        } else if (fileNameInput) fileNameInput.value = '';
        updateFileNamePreview();
      });
      if (fileNameInput) fileNameInput.addEventListener('input', updateFileNamePreview);
      const codeInputForFileName = modal.querySelector('#new-project-code');
      if (codeInputForFileName) codeInputForFileName.addEventListener('input', updateFileNamePreview);
      const routerForAttachments = window.PMS.Router;
      const canUploadProjectAttachment = !!(routerForAttachments &&
        (routerForAttachments.isAdmin() ||
          (Array.isArray(routerForAttachments.permissions) &&
            routerForAttachments.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1)));
      if (!canUploadProjectAttachment && fileInput) {
        fileInput.disabled = true;
        if (fileNameInput) fileNameInput.disabled = true;
        if (fileHelp) fileHelp.textContent = 'برای افزودن فایل، مدیر باید دسترسی ATTACHMENT_UPLOAD را به نقش شما بدهد.';
      }

      const closeModal = () => {
        if (this.isSaving) {
          return;
        }

        modal.remove();

        if (this.modal === modal) {
          this.modal = null;
        }
      };

      const colorSizeButton = modal.querySelector('#new-project-color-size-button');
      if (colorSizeButton) colorSizeButton.addEventListener('click', () => this.openColorSizeForm(modal));
      const needsButton = modal.querySelector('#new-project-needs-button');
      if (needsButton) needsButton.addEventListener('click', () => this.openDraftNeedsForm(modal));

      closeButton.addEventListener('click', closeModal);
      cancelButton.addEventListener('click', closeModal);

      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });

      const escapeHandler = (event) => {
        if (event.key === 'Escape' && this.modal === modal) {
          closeModal();
        }
      };

      document.addEventListener('keydown', escapeHandler);

      const originalRemove = modal.remove.bind(modal);

      modal.remove = () => {
        document.removeEventListener('keydown', escapeHandler);
        originalRemove();
      };

      form.addEventListener('input', () => { modal.dataset.lookupUserInteracted = 'true'; });
      form.addEventListener('change', () => { modal.dataset.lookupUserInteracted = 'true'; });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.createProject(modal);
      });

      const existingAttachmentsList = modal.querySelector('#project-edit-attachments-list');
      if (existingAttachmentsList) {
        existingAttachmentsList.addEventListener('click', async (event) => {
          const button = event.target.closest('[data-project-attachment-action]');
          if (!button || button.disabled) return;
          const attachmentId = button.getAttribute('data-attachment-id');
          const action = button.getAttribute('data-project-attachment-action');
          if (action === 'download') {
            const attachmentsModule = window.PMS && (window.PMS.Attachments || (window.PMS.Modules && window.PMS.Modules.Attachments));
            if (attachmentsModule && typeof attachmentsModule.download === 'function') attachmentsModule.download(attachmentId);
            else alert('امکان دریافت فایل در حال حاضر فراهم نیست.');
          } else if (action === 'delete') {
            await this.deleteProjectEditAttachment(modal, attachmentId, button);
          }
        });
      }

      const renderProjectLookups = (rawData, serverConfirmed) => {
        if (serverConfirmed) modal.dataset.lookupsServerConfirmed = 'true';
        const preserveEditInputs = isEditMode && modal.dataset.lookupUserInteracted === 'true'
          ? {
              title: String((modal.querySelector('#new-project-title') || {}).value || ''),
              quantity: String((modal.querySelector('#new-project-quantity') || {}).value || ''),
              description: String((modal.querySelector('#new-project-description') || {}).value || ''),
              notify: !!(modal.querySelector('#new-project-notify') || {}).checked
            }
          : null;
        let lookupData = rawData;
        for (let depth = 0; depth < 3 && lookupData && lookupData.data !== undefined &&
          !Array.isArray(lookupData.departments); depth += 1) {
          lookupData = lookupData.data;
        }
        if (!lookupData || typeof lookupData !== 'object') lookupData = {};

        const lookupWorkflows = Array.isArray(lookupData.workflows) ? lookupData.workflows : [];
        if (isEditMode && !lookupWorkflows.length && editProject.WorkflowID) {
          // Editing does not require PROJECT_CREATE or workflow-management access;
          // the current workflow is locked, so a single display option is sufficient.
          lookupWorkflows.push({
            ID: editProject.WorkflowID,
            Name: editProject.WorkflowName || editProject.WorkflowTitle || editProject.WorkflowCode || 'گردش کار فعلی',
            Status: 'ACTIVE'
          });
        }
        const workflows = this.normalizeWorkflows({ workflows: lookupWorkflows });
        const departments = Array.isArray(lookupData.departments) ? lookupData.departments : [];
        const users = Array.isArray(lookupData.users) ? lookupData.users : [];
        const projectStatuses = Array.isArray(lookupData.projectStatuses) ? lookupData.projectStatuses.slice() : [];
        if (isEditMode && editProject.Status) {
          const currentStatus = String(editProject.Status);
          const hasCurrentStatus = projectStatuses.some((item) =>
            String(item.Code || item.ID || item.Id || item.id || '') === currentStatus
          );
          if (!hasCurrentStatus) {
            // Preserve an existing inactive/custom status instead of forcing the user
            // to change it merely to save an unrelated project edit.
            projectStatuses.push({
              Code: currentStatus,
              Name: this.statusText(currentStatus),
              Status: 'INACTIVE'
            });
          }
        }

        if (this.modal !== modal) return;
        this.workflows = workflows;

        workflowSelect.innerHTML = workflows.length
          ? '<option value="">انتخاب گردش کار</option>' + workflows.map((workflow) => {
              const id = workflow.ID || workflow.Id || workflow.id;
              const name = workflow.Name || workflow.Title || workflow.WorkflowName || workflow.Code || id;
              return '<option value="' + this.escape(id) + '">' + this.escape(name) + '</option>';
            }).join('')
          : '<option value="">گردش کار فعالی پیدا نشد</option>';
        workflowSelect.value = '';

        departmentsSelect.innerHTML = departments.map((department) => {
          const id = department.ID || department.Id || department.id;
          const name = department.Name || department.Title || department.Code || id;
          return '<label class="project-access-option"><input type="checkbox" name="AvailableDepartmentIDs" value="' +
            this.escape(id) + '"><span>' + this.escape(name) + '</span></label>';
        }).join('');

        usersSelect.innerHTML = users.map((user) => {
          const id = user.ID || user.Id || user.id;
          const name = user.Name || user.FullName || user.Username || id;
          return '<option value="' + this.escape(id) + '">' + this.escape(name) + '</option>';
        }).join('');

        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect) statusSelect.innerHTML = projectStatuses.length
          ? '<option value="">انتخاب وضعیت</option>' + projectStatuses.map((status) => {
              const value = status.Code || status.ID || status.Id || status.id;
              const name = status.Name || status.Code || value;
              return '<option value="' + this.escape(value) + '">' + this.escape(name) + '</option>';
            }).join('')
          : '<option value="">وضعیت فعالی تعریف نشده است</option>';

        const designDepartment = departments.find((department) =>
          String(department.Code || '').toUpperCase() === 'DESIGN' ||
          String(department.Name || '').includes('طراحی')
        );
        if (designDepartment) {
          const designId = String(designDepartment.ID || designDepartment.Id || designDepartment.id);
          const designCheckbox = Array.from(
            departmentsSelect.querySelectorAll('input[name="AvailableDepartmentIDs"]')
          ).find((input) => input.value === designId);
          if (designCheckbox) designCheckbox.checked = true;
        }

        if (isEditMode) {
          // In edit mode, restore this project's saved values instead of the
          // user's defaults. Project code and workflow remain locked.
          const projectCode = modal.querySelector('#new-project-code');
          const titleInput = modal.querySelector('#new-project-title');
          const quantityInput = modal.querySelector('#new-project-quantity');
          const descriptionInput = modal.querySelector('#new-project-description');
          const statusSelectForEdit = modal.querySelector('#new-project-status');
          if (projectCode) projectCode.value = String(editProject.ProjectCode || '');
          if (titleInput) titleInput.value = String(editProject.Title || editProject.Name || '');
          if (quantityInput) quantityInput.value = editProject.Quantity === undefined || editProject.Quantity === null ? '' : String(editProject.Quantity);
          if (descriptionInput) descriptionInput.value = String(editProject.Description || '');
          if (workflowSelect) workflowSelect.value = String(editProject.WorkflowID || '');
          const parseIds = (value) => {
            if (Array.isArray(value)) return value.map(String);
            try { const parsed = JSON.parse(String(value || '[]')); return Array.isArray(parsed) ? parsed.map(String) : []; } catch (error) { return []; }
          };
          const allowedDepartments = parseIds(editProject.AvailableDepartmentIDs);
          Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]')).forEach((input) => {
            input.checked = allowedDepartments.includes(String(input.value));
          });
          const allowedUsers = parseIds(editProject.AllowedUserIDs);
          if (usersSelect) Array.from(usersSelect.options).forEach((option) => { option.selected = allowedUsers.includes(String(option.value)); });
          if (statusSelectForEdit) {
            const statusValue = String(editProject.Status || '');
            if (Array.from(statusSelectForEdit.options).some((option) => option.value === statusValue)) statusSelectForEdit.value = statusValue;
          }
          const notify = modal.querySelector('#new-project-notify');
          if (notify) notify.checked = editProject.NotifyEnabled === true || String(editProject.NotifyEnabled).toLowerCase() === 'true';
          if (preserveEditInputs) {
            if (titleInput) titleInput.value = preserveEditInputs.title;
            if (quantityInput) quantityInput.value = preserveEditInputs.quantity;
            if (descriptionInput) descriptionInput.value = preserveEditInputs.description;
            if (notify) notify.checked = preserveEditInputs.notify;
          }
          let savedColorSize = { colors: [], sizes: [] };
          try { savedColorSize = typeof editProject.ColorSizeJSON === 'string' ? JSON.parse(editProject.ColorSizeJSON || '{"colors":[],"sizes":[]}') : (editProject.ColorSizeJSON || savedColorSize); } catch (error) {}
          modal.dataset.colorSizeJson = JSON.stringify({
            colors: Array.isArray(savedColorSize.colors) ? savedColorSize.colors : [],
            sizes: Array.isArray(savedColorSize.sizes) ? savedColorSize.sizes : []
          });
          const colorSummary = modal.querySelector('#new-project-color-size-summary');
          if (colorSummary) colorSummary.textContent = (savedColorSize.colors.length || savedColorSize.sizes.length)
            ? savedColorSize.colors.length + ' رنگ و ' + savedColorSize.sizes.length + ' سایز تعریف شده'
            : 'رنگ‌بندی و سایزبندی تعریف نشده است.';
          const needsButtonForEdit = modal.querySelector('#new-project-needs-button');
          if (needsButtonForEdit) needsButtonForEdit.hidden = true;
          const needsSummary = modal.querySelector('#new-project-needs-summary');
          if (needsSummary) needsSummary.textContent = 'برای مدیریت ملزومات، از بخش ملزومات پروژه استفاده کنید.';
          const fileHelpForEdit = modal.querySelector('#new-project-file-help');
          if (fileHelpForEdit) fileHelpForEdit.textContent = 'برای افزودن فایل جدید، آن را انتخاب کنید؛ فایل‌های فعلی در همین فرم قابل مشاهده و مدیریت هستند.';
          this.loadProjectEditAttachments(modal, editProjectId);
          const settingsTitle = settingsModal.querySelector('#project-create-settings-title');
          if (settingsTitle) settingsTitle.textContent = 'تنظیمات پروژه';
          const settingsDescription = settingsModal.querySelector('p');
          if (settingsDescription) settingsDescription.textContent = 'واحدها، کاربران مجاز، وضعیت و اطلاع‌رسانی این پروژه را تنظیم کنید.';
        } else {
          applySavedProjectSettings();
        }

        if (isEditMode && serverConfirmed) {
          editReadiness.lookupsLoaded = true;
          updateEditSubmitReadiness();
        }

        if (!workflows.length) {
          this.showFormError(modal, 'برای ایجاد پروژه، ابتدا باید یک گردش کار فعال و دارای مرحله ایجاد کنید.');
        } else if (!departments.length) {
          this.showFormError(modal, 'واحد فعالی برای انتخاب پیدا نشد. ابتدا واحدها را بررسی کنید.');
        } else {
          this.clearFormError(modal);
        }
      };

      try {
        // Scope cached names and IDs to the current authenticated session so
        // another user on the same device never sees a previous user's lookup cache.
        const sessionToken = String(window.PMS.Api.getToken() || '');
        let lookupHash = 2166136261;
        for (let i = 0; i < sessionToken.length; i += 1) {
          lookupHash ^= sessionToken.charCodeAt(i);
          lookupHash = Math.imul(lookupHash, 16777619);
        }
        const lookupCacheKey = isEditMode
          ? 'dashboard_project_lookups_v1'
          : 'project-form-lookups-v1-' + (lookupHash >>> 0).toString(36);
        const lookupPath = isEditMode ? '/project-dashboard/lookups' : '/project-form/lookups';

        // Creation needs create-authorized lookups; editing uses the read-only
        // project dashboard lookup so PROJECT_EDIT users do not need PROJECT_CREATE.
        const lookupResult = await window.PMS.Api.getCached(
          lookupPath,
          lookupCacheKey,
          {
            onRefresh: (freshData) => {
              if (this.modal !== modal) return;
              if (modal.dataset.lookupUserInteracted === 'true') {
                // Never overwrite edits made while the cached lookups were refreshing.
                if (isEditMode) {
                  editReadiness.lookupsLoaded = true;
                  updateEditSubmitReadiness();
                }
                return;
              }
              renderProjectLookups(freshData, true);
            },
            onError: (error, isBackground) => {
              if (this.modal !== modal || !isEditMode || !isBackground) return;
              this.showFormError(
                modal,
                'تأیید دریافت آخرین تنظیمات فرم ناموفق بود. فرم را ببندید و دوباره باز کنید تا اطلاعات مجدداً دریافت شود. ' +
                this.getErrorMessage(error)
              );
            }
          }
        );

        if (this.modal !== modal) return;
        if (!(lookupResult && lookupResult.cached === true && modal.dataset.lookupsServerConfirmed === 'true')) {
          renderProjectLookups(
            lookupResult && lookupResult.data !== undefined ? lookupResult.data : lookupResult,
            !(lookupResult && lookupResult.cached === true)
          );
        }
      } catch (error) {
        if (this.modal !== modal) return;
        workflowSelect.innerHTML = '<option value="">خطا در دریافت اطلاعات فرم</option>';
        departmentsSelect.innerHTML = '<div class="project-lookup-error">دریافت واحدها ناموفق بود.</div>';
        this.showFormError(
          modal,
          'دریافت اطلاعات فرم ایجاد پروژه ناموفق بود. دوباره تلاش کنید. ' +
          this.getErrorMessage(error)
        );
      }

      // در حالت ویرایش نیز کد پروژه و گردش کار قفل هستند و فقط سایر اطلاعات مجاز تغییر می‌کنند.
    },

    openDraftNeedsForm: function (projectModal) {
      const existing = document.getElementById('project-draft-needs-modal');
      if (existing) existing.remove();
      let saved = [];
      try { saved = JSON.parse(projectModal.dataset.projectNeeds || '[]'); } catch (error) {}
      const modal = document.createElement('div');
      modal.id = 'project-draft-needs-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10030;background:var(--color-overlay,rgba(0,0,0,.48));display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;overflow:auto;';
      modal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-draft-needs-title" style="background:var(--color-surface);color:var(--color-text);width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h3 id="project-draft-needs-title">ملزومات موردنیاز پروژه</h3><button type="button" class="btn btn-light" data-draft-needs-close>بستن</button></div><p style="color:var(--color-text-secondary);font-size:12px;line-height:1.8">نیازها را تعریف کنید؛ پس از ثبت پروژه، این موارد به همان پروژه متصل می‌شوند. این فرم سفارش خرید ثبت نمی‌کند.</p><form id="project-draft-needs-form"><div id="project-draft-needs-rows"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn btn-secondary" id="project-draft-needs-add">+ افزودن ردیف</button><button type="submit" class="btn btn-primary">ذخیره نیازها</button></div><div id="project-draft-needs-error" class="alert alert-danger" hidden style="margin-top:12px"></div></form></div>';
      document.body.appendChild(modal);
      const rows = modal.querySelector('#project-draft-needs-rows');
      const error = modal.querySelector('#project-draft-needs-error');
      const addRow = (item) => {
        const row = document.createElement('div');
        row.setAttribute('data-draft-need-row','1');
        row.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;border:1px solid var(--color-border);border-radius:8px;padding:12px;margin-top:10px';
        row.innerHTML = '<label>نام ملزوم *<input name="ItemName" required maxlength="200" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>واحد اندازه‌گیری *<input name="Unit" required maxlength="100" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>مقدار موردنیاز *<input name="RequestedQuantity" type="number" min="0.001" step="any" required style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>توضیحات<input name="Notes" maxlength="500" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><button type="button" class="btn btn-light" data-draft-need-remove>حذف ردیف</button>';
        ['ItemName','Unit','RequestedQuantity','Notes'].forEach((name) => { if (item && item[name] !== undefined) row.querySelector('[name="'+name+'"]').value = item[name]; });
        row.querySelector('[data-draft-need-remove]').addEventListener('click', () => row.remove());
        rows.appendChild(row);
      };
      (saved.length ? saved : [{}]).forEach(addRow);
      modal.querySelector('#project-draft-needs-add').addEventListener('click', () => addRow({}));
      const close = () => modal.remove();
      modal.querySelector('[data-draft-needs-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
      modal.querySelector('#project-draft-needs-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const items = Array.from(rows.querySelectorAll('[data-draft-need-row]')).map((row) => {
          const get = (name) => row.querySelector('[name="'+name+'"]').value.trim();
          return { ItemName:get('ItemName'), Unit:get('Unit'), RequestedQuantity:Number(get('RequestedQuantity')), Notes:get('Notes') };
        });
        if (!items.length) { projectModal.dataset.projectNeeds = '[]'; close(); return; }
        if (items.some((item) => !item.ItemName || !item.Unit || !Number.isFinite(item.RequestedQuantity) || item.RequestedQuantity <= 0)) {
          error.textContent = 'نام ملزوم، واحد اندازه‌گیری و مقدار مثبت برای هر ردیف الزامی است.';
          error.hidden = false;
          return;
        }
        projectModal.dataset.projectNeeds = JSON.stringify(items);
        const summary = projectModal.querySelector('#new-project-needs-summary');
        if (summary) summary.textContent = items.length + ' ردیف ملزومات برای ثبت همراه پروژه آماده است.';
        close();
      });
    },

    openColorSizeForm: function (projectModal) {
      const existing = document.getElementById('project-color-size-modal');
      if (existing) existing.remove();

      let saved = { colors: [], sizes: [] };
      try {
        saved = JSON.parse(projectModal.dataset.colorSizeJson || '{"colors":[],"sizes":[]}');
      } catch (error) {}

      const modal = document.createElement('div');
      modal.id = 'project-color-size-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;overflow:auto;';
      modal.innerHTML =
        '<div role="dialog" aria-modal="true" aria-labelledby="project-color-size-title" style="background:var(--color-surface,#fff);color:var(--color-text,#222);width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:14px;padding:20px;box-sizing:border-box;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><h3 id="project-color-size-title" style="margin:0">رنگ‌بندی و سایزبندی پروژه</h3><button type="button" class="btn btn-light" data-color-size-close>بستن</button></div>' +
          '<p style="font-size:12px;color:var(--color-text-secondary);line-height:1.9;margin:0 0 16px">هر رنگ و هر سایز را در یک ردیف وارد کنید. با دکمه افزودن می‌توانید ردیف جدید بسازید و ردیف‌های اضافی را حذف کنید. مقدار تولید هر ترکیب بعداً در رویدادهای تولید ثبت می‌شود.</p>' +
          '<form id="project-color-size-form">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
              '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px"><strong>رنگ‌ها</strong><button type="button" class="btn btn-secondary" data-color-size-add="colors">+ افزودن رنگ</button></div><div data-color-size-list="colors"></div></section>' +
              '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px"><strong>سایزها</strong><button type="button" class="btn btn-secondary" data-color-size-add="sizes">+ افزودن سایز</button></div><div data-color-size-list="sizes"></div></section>' +
            '</div>' +
            '<div id="project-color-size-error" class="alert alert-danger" hidden style="margin-top:12px"></div>' +
            '<div style="display:flex;gap:8px;justify-content:flex-start;margin-top:16px;flex-wrap:wrap"><button type="submit" class="btn btn-primary">ذخیره مشخصات</button><button type="button" class="btn btn-light" data-color-size-clear>پاک کردن همه</button></div>' +
          '</form>' +
        '</div>';
      document.body.appendChild(modal);

      const form = modal.querySelector('#project-color-size-form');
      const errorBox = modal.querySelector('#project-color-size-error');
      const limits = { colors: { max: 80, label: 'رنگ' }, sizes: { max: 40, label: 'سایز' } };

      const getList = (kind) => modal.querySelector('[data-color-size-list="' + kind + '"]');

      const addRow = (kind, value) => {
        const list = getList(kind);
        if (!list || list.querySelectorAll('[data-variant-row]').length >= 100) {
          errorBox.textContent = 'حداکثر ۱۰۰ ' + limits[kind].label + ' می‌توانید تعریف کنید.';
          errorBox.hidden = false;
          return;
        }
        const row = document.createElement('div');
        row.setAttribute('data-variant-row', '1');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = limits[kind].max;
        input.value = value || '';
        input.placeholder = kind === 'colors' ? 'مثلاً مشکی' : 'مثلاً XL';
        input.setAttribute('aria-label', limits[kind].label);
        input.style.cssText = 'min-width:0;flex:1;width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid var(--color-border,#ddd);border-radius:8px;background:var(--color-surface,#fff);color:inherit;font:inherit;';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-light';
        remove.textContent = 'حذف';
        remove.setAttribute('aria-label', 'حذف ' + limits[kind].label);
        remove.addEventListener('click', () => {
          row.remove();
          if (!list.querySelector('[data-variant-row]')) addRow(kind, '');
          errorBox.hidden = true;
        });
        row.appendChild(input);
        row.appendChild(remove);
        list.appendChild(row);
      };

      const renderList = (kind, values) => {
        const list = getList(kind);
        list.replaceChildren();
        (Array.isArray(values) ? values : []).forEach((value) => addRow(kind, value));
        if (!list.querySelector('[data-variant-row]')) addRow(kind, '');
      };

      renderList('colors', saved.colors);
      renderList('sizes', saved.sizes);

      modal.querySelectorAll('[data-color-size-add]').forEach((button) => {
        button.addEventListener('click', () => {
          addRow(button.getAttribute('data-color-size-add'), '');
          errorBox.hidden = true;
        });
      });

      const close = () => modal.remove();
      modal.querySelector('[data-color-size-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
      modal.querySelector('[data-color-size-clear]').addEventListener('click', () => {
        renderList('colors', []);
        renderList('sizes', []);
        errorBox.hidden = true;
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const normalize = (kind) => {
          const seen = new Set();
          const values = Array.from(getList(kind).querySelectorAll('input'))
            .map((input) => input.value.trim())
            .filter(Boolean);
          const result = [];
          for (const value of values) {
            if (value.length > limits[kind].max) {
              throw new Error('نام هر ' + limits[kind].label + ' حداکثر ' + limits[kind].max + ' نویسه باشد.');
            }
            const key = value.toLocaleLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              result.push(value);
            }
          }
          if (result.length > 100) {
            throw new Error('حداکثر ۱۰۰ ' + limits[kind].label + ' می‌توانید تعریف کنید.');
          }
          return result;
        };

        try {
          const colors = normalize('colors');
          const sizes = normalize('sizes');
          projectModal.dataset.colorSizeJson = JSON.stringify({ colors: colors, sizes: sizes });
          const summary = projectModal.querySelector('#new-project-color-size-summary');
          if (summary) {
            summary.textContent = (colors.length || sizes.length)
              ? colors.length + ' رنگ و ' + sizes.length + ' سایز تعریف شده'
              : 'هنوز رنگ یا سایزی تعریف نشده است.';
          }
          close();
        } catch (error) {
          errorBox.textContent = error && error.message ? error.message : 'بررسی رنگ‌بندی و سایزبندی ناموفق بود.';
          errorBox.hidden = false;
        }
      });
    },

    normalizeWorkflows: function (response) {
      let data = response;

      if (data && data.success === true && data.data !== undefined) {
        data = data.data;
      }

      if (data && data.data !== undefined) {
        data = data.data;
      }

      if (Array.isArray(data)) {
        return data.filter((workflow) => {
          return String(workflow.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        });
      }

      if (data && Array.isArray(data.workflows)) {
        return this.normalizeWorkflows(data.workflows);
      }

      if (data && Array.isArray(data.items)) {
        return this.normalizeWorkflows(data.items);
      }

      return [];
    },

    loadProjectEditAttachments: async function (modal, projectId) {
      const section = modal.querySelector('#project-edit-attachments');
      const list = modal.querySelector('#project-edit-attachments-list');
      if (!section || !list || !projectId) return;

      const router = window.PMS && window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const isAdmin = !!(router && typeof router.isAdmin === 'function' && router.isAdmin());
      const canView = isAdmin || permissions.includes('ATTACHMENT_VIEW');
      const canDelete = isAdmin || permissions.includes('ATTACHMENT_DELETE');
      if (!canView) {
        list.textContent = 'برای مشاهده فایل‌های قبلی، دسترسی مشاهده پیوست لازم است.';
        // نبود مجوز مشاهده پیوست نباید فرم ویرایش را برای همیشه قفل کند؛
        // وضعیت دسترسی به‌عنوان پایان بررسی فایل‌ها در نظر گرفته می‌شود.
        if (modal._projectEditReadiness) {
          modal._projectEditReadiness.attachmentsLoaded = true;
          modal._updateProjectEditReadiness && modal._updateProjectEditReadiness();
        }
        return;
      }

      list.textContent = 'در حال دریافت فایل‌ها…';
      try {
        const response = await window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/attachments');
        const items = this.normalizeProjectAttachments(response);
        const attachments = items.filter((item) => {
          const entityType = String(item.EntityType || item.entityType || '').toUpperCase();
          const entityId = String(item.EntityID || item.entityID || item.EntityId || '');
          const status = String(item.Status || item.status || 'ACTIVE').toUpperCase();
          return entityType === 'PROJECT' && entityId === String(projectId) && status !== 'DELETED' && status !== 'VOID';
        });
        if (!list.isConnected || modal.dataset.projectId !== String(projectId)) return;
        if (!attachments.length) {
          list.textContent = 'هنوز فایلی برای این پروژه ثبت نشده است.';
          if (modal._projectEditReadiness) {
            modal._projectEditReadiness.attachmentsLoaded = true;
            modal._updateProjectEditReadiness && modal._updateProjectEditReadiness();
          }
          return;
        }

        list.innerHTML = attachments.map((item) => {
          const id = item.ID || item.Id || item.id || '';
          const name = item.FileName || item.fileName || 'فایل بدون نام';
          const size = Number(item.FileSize || item.fileSize || 0);
          const sizeLabel = size >= 1024 * 1024 ? (size / (1024 * 1024)).toFixed(1) + ' مگابایت' :
            size >= 1024 ? (size / 1024).toFixed(1) + ' کیلوبایت' : (size ? size + ' بایت' : '');
          return '<div data-project-attachment-row style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:9px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface);">' +
            '<div style="min-width:0;flex:1;overflow-wrap:anywhere;"><div data-project-attachment-name style="font-weight:600;font-size:13px;">' + this.escape(name) + '</div>' +
            (sizeLabel ? '<small style="color:var(--color-text-secondary);">' + this.escape(sizeLabel) + '</small>' : '') + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-light" data-project-attachment-action="download" data-attachment-id="' + this.escape(id) + '" style="min-height:34px;">دریافت</button>' +
            (canDelete ? '<button type="button" class="btn btn-light" data-project-attachment-action="delete" data-attachment-id="' + this.escape(id) + '" style="min-height:34px;color:var(--color-danger);">حذف</button>' : '') +
            '</div></div>';
        }).join('');
        if (modal._projectEditReadiness) {
          modal._projectEditReadiness.attachmentsLoaded = true;
          modal._updateProjectEditReadiness && modal._updateProjectEditReadiness();
        }
      } catch (error) {
        console.error('Project attachments load failed:', error);
        if (list.isConnected) list.textContent = 'دریافت فهرست فایل‌ها ناموفق بود: ' + (error.message || 'خطای نامشخص');
        // اگر دریافت فایل‌ها خطا بدهد، دکمه ذخیره فعال نمی‌شود تا اطلاعات ناقص بازنویسی نشود.
      }
    },

    requestProjectAttachmentDeleteReason: function (attachmentName) {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'دلیل حذف فایل');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:30000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.55);direction:rtl;';
        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(100%,480px);box-sizing:border-box;padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface);color:var(--color-text);box-shadow:0 18px 60px rgba(0,0,0,.25);';
        const title = document.createElement('h3');
        title.textContent = 'دلیل حذف فایل';
        title.style.cssText = 'margin:0 0 8px;font-size:18px;';
        const description = document.createElement('p');
        description.textContent = 'برای حذف «' + String(attachmentName || 'فایل').slice(0, 180) + '» دلیل حذف را وارد کنید. این دلیل در سابقه تغییرات ثبت می‌شود.';
        description.style.cssText = 'margin:0 0 12px;line-height:1.8;color:var(--color-text-secondary);overflow-wrap:anywhere;';
        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = 'دلیل حذف (الزامی)';
        fieldLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;';
        const textarea = document.createElement('textarea');
        textarea.rows = 4;
        textarea.maxLength = 1000;
        textarea.placeholder = 'مثلاً فایل اشتباه بارگذاری شده است…';
        textarea.style.cssText = 'display:block;width:100%;box-sizing:border-box;resize:vertical;min-height:100px;padding:10px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text);font:inherit;';
        const error = document.createElement('div');
        error.hidden = true;
        error.style.cssText = 'margin-top:6px;color:var(--color-danger);font-size:13px;';
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;justify-content:flex-start;gap:8px;flex-wrap:wrap;margin-top:16px;';
        const cancel = document.createElement('button');
        cancel.type = 'button'; cancel.className = 'btn btn-light'; cancel.textContent = 'انصراف';
        const submit = document.createElement('button');
        submit.type = 'button'; submit.className = 'btn btn-danger'; submit.textContent = 'تأیید حذف';
        const finish = (value) => { overlay.remove(); resolve(value); };
        cancel.addEventListener('click', () => finish(''));
        overlay.addEventListener('click', (event) => { if (event.target === overlay) finish(''); });
        submit.addEventListener('click', () => {
          const value = textarea.value.trim();
          if (!value) { error.textContent = 'وارد کردن دلیل حذف الزامی است.'; error.hidden = false; textarea.focus(); return; }
          finish(value);
        });
        textarea.addEventListener('input', () => { error.hidden = true; });
        textarea.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit.click(); });
        actions.append(cancel, submit);
        panel.append(title, description, fieldLabel, textarea, error, actions);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        textarea.focus();
      });
    },

    deleteProjectEditAttachment: async function (modal, attachmentId, button) {
      if (!attachmentId) return;
      const router = window.PMS && window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const isAdmin = !!(router && typeof router.isAdmin === 'function' && router.isAdmin());
      if (!(isAdmin || permissions.includes('ATTACHMENT_DELETE'))) {
        alert('برای حذف فایل، دسترسی حذف پیوست لازم است.');
        return;
      }
      const row = button.closest('[data-project-attachment-row]');
      const nameElement = row && row.querySelector('[data-project-attachment-name]');
      const reason = await this.requestProjectAttachmentDeleteReason(nameElement ? nameElement.textContent : 'فایل');
      if (!reason) return;

      const previousText = button.textContent;
      button.disabled = true;
      button.textContent = 'در حال حذف…';
      try {
        await window.PMS.Api.delete('/attachments/' + encodeURIComponent(attachmentId), { query: { reason: reason } });
        const projectId = String(modal.dataset.projectId || '');
        this.invalidateProjectCardAttachmentMetadata(projectId);
        await this.loadProjectEditAttachments(modal, projectId);
        await this.loadProjectCardImages(this.projects);
      } catch (error) {
        console.error('Project attachment delete failed:', error);
        alert('حذف فایل ناموفق بود: ' + (error.message || 'خطای نامشخص'));
        if (button.isConnected) {
          button.disabled = false;
          button.textContent = previousText;
        }
      }
    },

    // ========================================================
    // ثبت پروژه
    // ========================================================

    createProject: async function (modal) {
      if (this.isSaving) {
        return;
      }

      const codeInput = modal.querySelector('#new-project-code');
      const titleInput = modal.querySelector('#new-project-title');
      const quantityInput = modal.querySelector('#new-project-quantity');
      const workflowSelect = modal.querySelector('#new-project-workflow');
      const descriptionInput = modal.querySelector('#new-project-description');
      const shouldAddNeeds = false;
      const departmentsSelect = modal.querySelector('#new-project-departments');
      const usersSelect = modal.querySelector('#new-project-users');
      const fileInput = modal.querySelector('#new-project-file');
      const fileNameInput = modal.querySelector('#new-project-filename');
      const notifyInput = modal.querySelector('#new-project-notify');
      const selectedDepartments = Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]:checked')).map((input) => input.value).filter(Boolean);
      const selectedUsers = Array.from(usersSelect.selectedOptions).map((option) => option.value).filter(Boolean);
      const selectedFile = fileInput && fileInput.files ? fileInput.files[0] : null;
      const submitButton = modal.querySelector('#project-create-submit');
      const progressBox = modal.querySelector('#project-create-progress');
      const progressText = modal.querySelector('#project-create-progress-text');
      const updateProgress = (message, state) => {
        if (!progressBox || !progressText) return;
        progressText.textContent = message;
        if (state === 'error') {
          progressBox.hidden = true;
          return;
        }
        progressBox.hidden = false;
      };
      const routerForAttachments = window.PMS.Router;
      const canUploadProjectAttachment = !!(routerForAttachments &&
        (routerForAttachments.isAdmin() ||
          (Array.isArray(routerForAttachments.permissions) &&
            routerForAttachments.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1)));

      let colorSize = { colors: [], sizes: [] };
      try { colorSize = JSON.parse(modal.dataset.colorSizeJson || '{"colors":[],"sizes":[]}'); } catch (error) {}
      const project = {
        ProjectCode: codeInput.value.trim(),
        Title: titleInput.value.trim(),
        Quantity: quantityInput.value.trim() === '' ? '' : Number(quantityInput.value),
        WorkflowID: workflowSelect.value,
        Description: descriptionInput.value.trim(),
        ColorSizeJSON: JSON.stringify({
          colors: Array.isArray(colorSize.colors) ? colorSize.colors : [],
          sizes: Array.isArray(colorSize.sizes) ? colorSize.sizes : []
        }),
        AvailableDepartmentIDs: selectedDepartments,
        AllowedUserIDs: selectedUsers,
        NotifyEnabled: !!(notifyInput && notifyInput.checked),
        Status: String((modal.querySelector('#new-project-status') || {}).value || '')
      };
      if (modal.dataset.editMode !== 'true') {
        try {
          localStorage.setItem(projectSettingsStorageKey(), JSON.stringify({
            departmentIds: selectedDepartments, userIds: selectedUsers, notifyEnabled: project.NotifyEnabled, status: project.Status
          }));
        } catch (settingsSaveError) {}
      }

      if (!project.ProjectCode) {
        this.showFormError(modal, 'کد پروژه را وارد کن.');
        codeInput.focus();
        return;
      }

      if (!project.Title) {
        this.showFormError(modal, 'نام پروژه را وارد کن.');
        titleInput.focus();
        return;
      }

      if (quantityInput.value.trim() !== '' &&
          (!Number.isFinite(project.Quantity) || project.Quantity < 1 || !Number.isInteger(project.Quantity))) {
        this.showFormError(modal, 'تعداد پروژه باید یک عدد صحیح بزرگ‌تر از صفر باشد.');
        quantityInput.focus();
        return;
      }

      if (!project.WorkflowID) {
        this.showFormError(modal, 'یک گردش کار انتخاب کن.');
        workflowSelect.focus();
        return;
      }

      if (!project.AvailableDepartmentIDs.length) {
        this.showFormError(modal, 'حداقل یک واحد مجاز برای پروژه انتخاب کن.');
        const settingsOverlay = modal.querySelector('#project-create-settings-modal');
        if (settingsOverlay) {
          settingsOverlay.style.display = 'flex';
          const settingsError = settingsOverlay.querySelector('#project-settings-error');
          if (settingsError) { settingsError.textContent = 'حداقل یک واحد مجاز انتخاب کنید.'; settingsError.hidden = false; }
        }
        departmentsSelect.focus();
        return;
      }
      if (project.Status === '') {
        this.showFormError(modal, modal.dataset.editMode === 'true' ? 'وضعیت پروژه را در تنظیمات انتخاب کن.' : 'وضعیت پروژه پس از ایجاد را در تنظیمات انتخاب کن.');
        const settingsOverlay = modal.querySelector('#project-create-settings-modal');
        if (settingsOverlay) {
          settingsOverlay.style.display = 'flex';
          const settingsError = settingsOverlay.querySelector('#project-settings-error');
          if (settingsError) { settingsError.textContent = 'وضعیت پروژه پس از ایجاد را انتخاب کنید.'; settingsError.hidden = false; }
        }
        return;
      }

      if (selectedFile && !canUploadProjectAttachment) {
        this.showFormError(modal, 'برای بارگذاری فایل، دسترسی افزودن پیوست لازم است.');
        fileInput.focus();
        return;
      }
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        this.showFormError(modal, 'حجم فایل حداکثر ۵ مگابایت باشد.');
        fileInput.focus();
        return;
      }
      const requestedFileName = String(fileNameInput && fileNameInput.value || '').trim();
      if (selectedFile && !requestedFileName) {
        this.showFormError(modal, 'لطفاً نام دلخواه فایل را وارد کنید.');
        if (fileNameInput) fileNameInput.focus();
        return;
      }
      const buildProjectAttachmentName = (projectCode, originalFile, requestedName) => {
        const originalName = String(originalFile && originalFile.name || '');
        const dot = originalName.lastIndexOf('.');
        const extension = dot > 0 ? originalName.slice(dot) : '';
        let cleanName = String(requestedName || '').trim().replace(/[\\/:*?"<>|]/g, '_');
        if (!cleanName) cleanName = dot > 0 ? originalName.slice(0, dot) : originalName;
        if (extension && !cleanName.toLowerCase().endsWith(extension.toLowerCase())) cleanName += extension;
        const cleanCode = String(projectCode || 'PROJECT').trim().replace(/[\\/:*?"<>|]/g, '_');
        return cleanCode + '_' + cleanName;
      };

      this.isSaving = true;
      submitButton.disabled = true;
      submitButton.textContent = modal.dataset.editMode === 'true' ? 'در حال ذخیره...' : 'در حال ثبت...';
      // Keep the user informed even when the server request takes several seconds.
      this.clearFormError(modal);
      updateProgress('در حال ذخیره اطلاعات پروژه در سرور؛ لطفاً این پنجره را نبندید.', 'loading');

      try {
        if (modal.dataset.editMode === 'true') {
          const projectId = String(modal.dataset.projectId || '');
          if (!projectId) throw new Error('شناسه پروژه برای ویرایش مشخص نیست.');
          const response = await window.PMS.Api.put('/projects/' + encodeURIComponent(projectId), project);
          if (response && response.success === false) throw new Error(this.getErrorMessage(response) || 'ذخیره تغییرات ناموفق بود.');
          const updated = this.extractCreatedProject(response) || (response && response.data && typeof response.data === 'object' ? response.data : {});
          const existingProject = this.projects.find((item) => String(item.ID || item.Id || item.id) === projectId);
          if (existingProject) Object.assign(existingProject, project, updated);
          if (selectedFile) {
            updateProgress('تغییرات ذخیره شد؛ در حال بارگذاری فایل پیوست...', 'loading');
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
              reader.onload = () => {
                const result = String(reader.result || '');
                const comma = result.indexOf(',');
                if (comma < 0) reject(new Error('ساختار فایل نامعتبر است.'));
                else resolve(result.slice(comma + 1));
              };
              reader.readAsDataURL(selectedFile);
            });
            await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/attachments', {
              FileName: buildProjectAttachmentName(project.ProjectCode, selectedFile, requestedFileName),
              MimeType: selectedFile.type || 'application/octet-stream',
              Base64: base64
            });
            this.invalidateProjectCardAttachmentMetadata(projectId);
          }
          this.applyFilters();
          updateProgress('تغییرات پروژه ذخیره شد.', 'success');
          if (this.modal === modal) this.modal = null;
          modal.remove();
          alert('تغییرات پروژه با موفقیت ذخیره شد.');
          this.loadProjects();
          return;
        }

        const response = await window.PMS.Api.post('/projects', project);

        const created = this.extractCreatedProject(response);

        if (!created || !(created.ID || created.Id || created.id)) {
          throw new Error(
            this.getErrorMessage(response) ||
            'پاسخ سرور برای ثبت پروژه معتبر نیست.'
          );
        }

        const createdId = String(created.ID || created.Id || created.id);
        updateProgress('پروژه ذخیره شد. در حال تکمیل اطلاعات وابسته...', 'loading');

        let attachmentWarning = '';
        let needsWarning = '';
        let draftNeeds = [];
        try { draftNeeds = JSON.parse(modal.dataset.projectNeeds || '[]'); } catch (error) {}
        if (draftNeeds.length) {
          try {
            for (let i = 0; i < draftNeeds.length; i++) {
              updateProgress('پروژه ثبت شد؛ در حال ثبت ملزومات (' + (i + 1) + ' از ' + draftNeeds.length + ')...', 'loading');
              await window.PMS.Api.post('/procurement/needs', Object.assign({}, draftNeeds[i], { ProjectID: createdId }));
            }
          } catch (needsError) {
            needsWarning = ' پروژه ایجاد شد، اما ثبت همه ملزومات ناموفق بود: ' + this.getErrorMessage(needsError);
          }
        }
        if (selectedFile) {
          updateProgress('پروژه ثبت شد؛ در حال بارگذاری فایل پیوست...', 'loading');
          try {
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
              reader.onload = () => {
                const result = String(reader.result || '');
                const comma = result.indexOf(',');
                if (comma < 0) reject(new Error('ساختار فایل نامعتبر است.'));
                else resolve(result.slice(comma + 1));
              };
              reader.readAsDataURL(selectedFile);
            });
            await window.PMS.Api.post('/projects/' + encodeURIComponent(createdId) + '/attachments', {
              FileName: buildProjectAttachmentName(project.ProjectCode, selectedFile, requestedFileName),
              MimeType: selectedFile.type || 'application/octet-stream',
              Base64: base64
            });
            this.invalidateProjectCardAttachmentMetadata(createdId);
          } catch (attachmentError) {
            attachmentWarning = ' پروژه ایجاد شد، اما بارگذاری فایل ناموفق بود: ' + this.getErrorMessage(attachmentError);
          }
        }

        const exists = this.projects.some((item) => {
          return String(item.ID || item.Id || item.id) === createdId;
        });

        if (!exists) {
          this.projects.unshift(created);
        }

        // فهرست فعلی را بلافاصله به‌روز می‌کنیم.
        this.applyFilters();

        updateProgress('ثبت پروژه تمام شد.', 'success');
        // Let the success state be announced before closing the form.
        if (this.modal === modal) {
          this.modal = null;
        }
        modal.remove();

        alert('پروژه با موفقیت ثبت شد.' + attachmentWarning + needsWarning);

        if (shouldAddNeeds) {
          this.openProjectNeedsForm(createdId);
        }

        // Refresh the list only when the user is allowed to view projects.
        const router = window.PMS.Router;
        const canViewProjects = !!(
          router &&
          (router.isAdmin() ||
            (Array.isArray(router.permissions) &&
              router.permissions.indexOf('PROJECT_VIEW') !== -1))
        );

        if (canViewProjects) {
          this.loadProjects();
        }

      } catch (error) {
        const message = this.getErrorMessage(error) || 'ثبت پروژه ناموفق بود.';
        updateProgress('ثبت پروژه ناموفق بود: ' + message, 'error');
        this.showFormError(modal, message);
      } finally {
        this.isSaving = false;

        if (submitButton.isConnected) {
          submitButton.disabled = false;
          submitButton.textContent = modal.dataset.editMode === 'true' ? 'ذخیره تغییرات' : 'ثبت پروژه';
        }
      }
    },

    extractCreatedProject: function (response) {
      if (!response) {
        return null;
      }

      if (response.success === false) {
        throw new Error(this.getErrorMessage(response));
      }

      let data = response;

      if (data.data !== undefined) {
        data = data.data;
      }

      if (data && data.data !== undefined) {
        data = data.data;
      }

      if (data && (data.ID || data.Id || data.id)) {
        return data;
      }

      return null;
    },

    showFormError: function (modal, message) {
      const errorBox = modal.querySelector('#project-create-error');

      if (!errorBox) {
        return;
      }

      errorBox.textContent = message;
      errorBox.hidden = false;
    },

    clearFormError: function (modal) {
      const errorBox = modal.querySelector('#project-create-error');

      if (errorBox) {
        errorBox.textContent = '';
        errorBox.hidden = true;
      }
    },

    getErrorMessage: function (error) {
      if (!error) {
        return '';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error.message) {
        return error.message;
      }

      if (error.error && error.error.message) {
        return error.error.message;
      }

      if (error.data && error.data.message) {
        return error.data.message;
      }

      if (error.messageText) {
        return error.messageText;
      }

      return '';
    },

    // ========================================================
    // فیلتر پروژه‌ها
    // ========================================================

    applyFilters: function () {
      const statusFilter = document.getElementById('project-status-filter');
      const searchInput = document.getElementById('project-search');

      const status = statusFilter ? statusFilter.value : '';
      const search = searchInput
        ? searchInput.value.trim().toLocaleLowerCase('fa')
        : '';

      const filtered = (this.projects || []).filter((project) => {
        if (status && String(project.Status || '') !== status) {
          return false;
        }

        if (search) {
          const code = String(project.ProjectCode || '').toLocaleLowerCase('fa');
          const title = String(project.Title || '').toLocaleLowerCase('fa');

          if (
            code.indexOf(search) === -1 &&
            title.indexOf(search) === -1
          ) {
            return false;
          }
        }

        return true;
      });

      this.render(filtered);
    },

    // ========================================================
    // نمایش جدول پروژه‌ها
    // ========================================================

    render: function (projects) {
      const container = document.getElementById('projects-table-container');
      const empty = document.getElementById('projects-empty');
      if (!container) return;

      container.classList.add('projects-card-list');

      if (!projects || projects.length === 0) {
        container.innerHTML = '';
        container.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;

      const statusClass = (status) => {
        const value = String(status || '').toUpperCase();
        if (value === 'ACTIVE') return 'is-active';
        if (value === 'ON_HOLD' || value === 'INACTIVE') return 'is-hold';
        if (value === 'COMPLETED') return 'is-completed';
        if (value === 'CANCELLED' || value === 'VOID' || value === 'DELETED') return 'is-cancelled';
        return '';
      };

      let html = '';
      projects.forEach((project) => {
        const id = project.ID || project.Id || project.id || '';
        const stateClass = statusClass(project.Status);
        const step = this.getProjectStageName(project);
        const quantity = project.Quantity !== undefined && project.Quantity !== null && project.Quantity !== ''
          ? 'تعداد: ' + this.escape(project.Quantity.toLocaleString ? project.Quantity.toLocaleString('fa-IR') : project.Quantity)
          : '';
        html += `
          <article class="project-list-card">
            <div class="project-list-card-main has-thumbnail">
              <span class="project-list-card-indicator ${stateClass}" aria-hidden="true"></span>
              <div class="project-list-card-content">
                <div class="project-list-card-code">${this.escape(project.ProjectCode || 'بدون کد')}</div>
                <div class="project-list-card-title">${this.escape(project.Title || project.Name || 'بدون عنوان')}</div>
                <div class="project-list-card-meta">
                  <span class="project-list-badge ${stateClass}"><span aria-hidden="true">●</span> ${this.escape(this.statusText(project.Status))}</span>
                  <span class="project-list-badge">مرحله: ${this.escape(step)}</span>
                  ${project.CurrentStepStatus ? '<span class="project-list-badge">وضعیت مرحله: ' + this.escape(project.CurrentStepStatus) + '</span>' : ''}
                  ${quantity ? '<span class="project-list-badge">' + quantity + '</span>' : ''}
                </div>
                <div class="project-list-card-activity">آخرین بروزرسانی: ${this.escape(this.formatDate(project.UpdatedAt))}</div>
              </div>
              <div class="project-list-card-media" data-project-media="${this.escape(id)}" data-image-state="loading" aria-label="تصویر پروژه"><div class="project-list-card-image-placeholder"><span class="project-list-image-spinner" aria-hidden="true"></span><span class="project-list-card-image-label">در حال بارگذاری تصویر</span></div><img class="project-list-card-thumbnail" data-project-thumbnail="${this.escape(id)}" alt="" hidden loading="lazy" decoding="async" tabindex="0" role="button" aria-label="نمایش تصویر پروژه"></div>
            </div>
            <div class="project-list-card-actions">
              <button type="button" class="btn btn-sm btn-light project-view-button" data-project-id="${this.escape(id)}">مشاهده پروژه</button>
              ${this.canEditProjects() ? `
                <button type="button" class="btn btn-sm btn-secondary project-edit-button" data-project-id="${this.escape(id)}" title="ویرایش اطلاعات پروژه">ویرایش</button>
              ` : ''}
              ${this.canManageProcurement() ? `
                <button type="button" class="btn btn-sm btn-secondary project-material-needs-button" data-project-id="${this.escape(id)}">ملزومات</button>
              ` : ''}
              ${this.canEditProjects() ? `
                <button type="button" class="btn btn-sm btn-secondary project-color-size-button" data-project-id="${this.escape(id)}" title="تعریف یا ویرایش رنگ‌بندی و سایزبندی">رنگ‌بندی و سایز</button>
              ` : ''}
            </div>
          </article>
        `;
      });

      container.innerHTML = html;
      container.hidden = false;
      this.applyProjectCardImagesToCards();
      this.loadProjectCardImages(projects);

      container.querySelectorAll('.project-list-card-thumbnail').forEach((image) => {
        const openImage = () => {
          if (!image.src || image.hidden) return;
          this.openProjectImage(image.src, image.alt || 'تصویر پروژه');
        };
        image.addEventListener('click', openImage);
        image.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openImage();
          }
        });
        image.addEventListener('error', () => {
          const projectId = String(image.getAttribute('data-project-thumbnail') || '');
          delete this.projectCardImages[projectId];
          this.projectCardImageStates[projectId] = 'error';
          this.applyProjectCardImagesToCards();
        });
      });

      container.querySelectorAll('.project-view-button').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.getAttribute('data-project-id');
          if (id) window.location.hash = '#project-detail/' + encodeURIComponent(id);
        });
      });
    },

    openProjectImage: function (src, alt) {
      const existing = document.getElementById('project-image-lightbox');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'project-image-lightbox';
      overlay.className = 'project-image-lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'نمایش تصویر پروژه');
      overlay.innerHTML = '<div class="project-image-lightbox-content">' +
        '<button type="button" class="project-image-lightbox-close" aria-label="بستن تصویر" title="بستن">×</button>' +
        '<img class="project-image-lightbox-image" alt="">' +
        '</div>';

      const image = overlay.querySelector('.project-image-lightbox-image');
      const closeButton = overlay.querySelector('.project-image-lightbox-close');
      image.src = src;
      image.alt = alt || 'تصویر پروژه';

      const close = function () {
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
      };
      const onKeyDown = function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      };

      closeButton.addEventListener('click', close);
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) close();
      });
      document.addEventListener('keydown', onKeyDown);
      document.body.appendChild(overlay);
      closeButton.focus();
    },

    // ========================================================
    // وضعیت پروژه
    // ========================================================

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال',
        INACTIVE: 'غیرفعال',
        ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده',
        CANCELLED: 'لغوشده',
        VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده'
      };

      const custom = this.projectStatuses.find((item) =>
        String(item.Code || item.ID || '').toLowerCase() === String(status || '').toLowerCase()
      );
      return (custom && (custom.Name || custom.Code)) || map[String(status || '').toUpperCase()] || status || '-';
    },

    // ========================================================
    // تاریخ
    // ========================================================

    formatDate: function (value) {
      if (!value) {
        return '-';
      }

      try {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
          return String(value);
        }

        return date.toLocaleString('fa-IR');
      } catch (error) {
        return String(value);
      }
    },

    // ========================================================
    // نمایش خطا
    // ========================================================

    showError: function (error) {
      const errorBox = document.getElementById('projects-error');

      if (!errorBox) {
        return;
      }

      errorBox.textContent =
        this.getErrorMessage(error) || 'خطا در دریافت پروژه‌ها.';

      errorBox.hidden = false;
    },

    // ========================================================
    // جلوگیری از ورود HTML ناخواسته
    // ========================================================

    escape: function (value) {
      if (value === null || value === undefined) {
        return '';
      }

      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // ==========================================================
  // ثبت ماژول در فضای عمومی برنامه
  // ==========================================================

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  window.PMS.Projects = Projects;
  window.PMS.Modules.Projects = Projects;

})();