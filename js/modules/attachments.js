(function () {

  'use strict';


  window.PMS =
    window.PMS || {};

  window.PMS.Modules =
    window.PMS.Modules || {};


  const Api =
    window.PMS.Api;

  const Cache =
    window.PMS.Cache;


  const MODULE = {


    cacheKey:
      Cache.keys.ATTACHMENTS || 'attachments',


    state: {

      attachments: [],

      filter:
        '',

      search:
        ''

    },


    init: function () {

      this.bindEvents();

      this.load();

    },


    bindEvents: function () {

      const search =
        document.getElementById(
          'attachment-search'
        );


      if (search) {

        search.addEventListener(
          'input',
          function (event) {

            MODULE.state.search =
              String(
                event.target.value ||
                ''
              )
                .trim()
                .toLowerCase();

            MODULE.render();

          }
        );

      }


      const filter =
        document.getElementById(
          'attachment-entity-filter'
        );


      if (filter) {

        filter.addEventListener(
          'change',
          function (event) {

            MODULE.state.filter =
              String(
                event.target.value ||
                ''
              )
                .trim()
                .toUpperCase();

            MODULE.render();

          }
        );

      }


      const uploadButton =
        document.getElementById(
          'attachment-upload-button'
        );


      if (uploadButton) {
        const router = window.PMS.Router;
        const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
        const canUpload = !!(router && (
          (typeof router.isAdmin === 'function' && router.isAdmin()) ||
          permissions.indexOf('ATTACHMENT_UPLOAD') !== -1
        ));
        uploadButton.hidden = !canUpload;
        if (canUpload) {
          uploadButton.addEventListener('click', function () {
            MODULE.showUploadMessage();
          });
        }
      }

    },


    load: async function () {

      const cached =
        Cache
          ? Cache.get(
              this.cacheKey
            )
          : null;


      if (cached !== null) {

        this.state.attachments =
          this.normalize(
            cached
          );

        this.render();

      } else {

        this.showLoading(
          true
        );

      }


      try {

        const response =
          await Api.get(
            '/attachments'
          );


        const data =
          Api.extractData(
            response
          );


        const attachments =
          this.normalize(
            data
          );


        this.state.attachments =
          attachments;


        if (Cache) {

          Cache.set(
            this.cacheKey,
            attachments
          );

        }


        this.render();


      } catch (error) {

        console.error(
          'Attachments Load Error:',
          error
        );


        if (
          cached === null
        ) {

          this.showError(
            error.message ||
            'خطا در دریافت فایل‌ها.'
          );

        }

      }

    },


    normalize: function (
      data
    ) {

      if (
        Array.isArray(
          data
        )
      ) {

        return data;

      }


      if (
        data &&
        Array.isArray(
          data.items
        )
      ) {

        return data.items;

      }


      if (
        data &&
        Array.isArray(
          data.attachments
        )
      ) {

        return data.attachments;

      }


      return [];

    },


    render: function () {

      const container =
        document.getElementById(
          'attachments-table-container'
        );


      const empty =
        document.getElementById(
          'attachments-empty'
        );


      if (!container) {

        return;

      }


      const filtered =
        this.getFilteredAttachments();


      this.showLoading(
        false
      );


      this.hideError();


      if (
        filtered.length === 0
      ) {

        container.innerHTML =
          '';

        container.hidden =
          true;

        if (empty) {

          empty.hidden =
            false;

        }

        return;

      }


      if (empty) {

        empty.hidden =
          true;

      }


      container.innerHTML =
        this.buildTable(
          filtered
        );


      container.hidden =
        false;

    },


    getFilteredAttachments:
      function () {

        const search =
          this.state.search;


        const filter =
          this.state.filter;


        return this.state.attachments
          .filter(
            function (item) {

              if (
                filter &&
                String(
                  item.EntityType ||
                  item.entityType ||
                  ''
                )
                  .toUpperCase() !==
                filter
              ) {

                return false;

              }


              if (!search) {

                return true;

              }


              const fileName =
                String(
                  item.FileName ||
                  item.fileName ||
                  ''
                )
                  .toLowerCase();


              const mimeType =
                String(
                  item.MimeType ||
                  item.mimeType ||
                  ''
                )
                  .toLowerCase();


              const entityId =
                String(
                  item.EntityID ||
                  item.entityID ||
                  ''
                )
                  .toLowerCase();


              return (
                fileName.indexOf(
                  search
                ) !== -1 ||

                mimeType.indexOf(
                  search
                ) !== -1 ||

                entityId.indexOf(
                  search
                ) !== -1
              );

            }
          );

      },


    buildTable: function (
      items
    ) {

      let html = '';

      html +=
        '<table class="data-table">';

      html +=
        '<thead>';

      html +=
        '<tr>';

      html +=
        '<th>نام فایل</th>';

      html +=
        '<th>نوع ارتباط</th>';

      html +=
        '<th>شناسه</th>';

      html +=
        '<th>نوع فایل</th>';

      html +=
        '<th>حجم</th>';

      html +=
        '<th>تاریخ بارگذاری</th>';

      html +=
        '<th>وضعیت</th>';

      html +=
        '<th>عملیات</th>';

      html +=
        '</tr>';

      html +=
        '</thead>';

      html +=
        '<tbody>';


      items.forEach(
        function (item) {

          const id =
            item.ID ||
            item.id ||
            '';


          const fileName =
            item.FileName ||
            item.fileName ||
            '-';


          const entityType =
            item.EntityType ||
            item.entityType ||
            '-';


          const entityId =
            item.EntityID ||
            item.entityID ||
            '-';


          const mimeType =
            item.MimeType ||
            item.mimeType ||
            '-';


          const fileSize =
            item.FileSize ||
            item.fileSize ||
            '';


          const uploadedAt =
            item.UploadedAt ||
            item.uploadedAt ||
            '-';


          const status =
            item.Status ||
            item.status ||
            '';


          html +=
            '<tr>';


          html +=
            '<td>' +
            this.escapeHtml(
              fileName
            ) +
            '</td>';


          html +=
            '<td>' +
            this.getEntityLabel(
              entityType
            ) +
            '</td>';


          html +=
            '<td>' +
            this.escapeHtml(
              entityId
            ) +
            '</td>';


          html +=
            '<td>' +
            this.escapeHtml(
              mimeType
            ) +
            '</td>';


          html +=
            '<td>' +
            this.formatFileSize(
              fileSize
            ) +
            '</td>';


          html +=
            '<td>' +
            this.escapeHtml(
              uploadedAt
            ) +
            '</td>';


          html +=
            '<td>' +
            this.getStatusLabel(
              status
            ) +
            '</td>';


          html +=
            '<td>';


          html +=
            '<button ' +
            'type="button" ' +
            'class="btn btn-sm btn-light" ' +
            'data-attachment-id="' +
            this.escapeHtml(
              id
            ) +
            '" ' +
            'onclick="PMS.Modules.Attachments.download(\'' +
            this.escapeJs(
              id
            ) +
            '\')">' +
            'مشاهده' +
            '</button>';


          html +=
            '</td>';


          html +=
            '</tr>';

        }.bind(this)
      );


      html +=
        '</tbody>';

      html +=
        '</table>';


      return html;

    },


    download: async function (attachmentId) {
      if (!attachmentId) {
        alert('شناسه فایل مشخص نیست.');
        return;
      }

      try {
        // Backend download endpoint returns file metadata and Base64 content.
        const response = await Api.get(
          '/attachments/' +
          encodeURIComponent(attachmentId) +
          '/download'
        );
        const data = Api.extractData(response) || {};

        // Keep compatibility with a URL-based response if the backend changes.
        const url = data.url || data.downloadUrl || data.DownloadUrl;
        if (url) {
          window.open(url, '_blank', 'noopener');
          return;
        }

        const base64 = data.Base64 || data.base64;
        if (!base64) {
          throw new Error('سرور اطلاعات دانلود یا محتوای فایل را برنگرداند.');
        }

        const mimeType = data.MimeType || data.mimeType || 'application/octet-stream';
        const fileName = data.FileName || data.fileName || ('attachment-' + attachmentId);
        const cleanBase64 = String(base64).replace(/^data:[^,]*;base64,/, '');
        const binary = window.atob(cleanBase64);
        const chunks = [];
        const chunkSize = 8192;

        for (let offset = 0; offset < binary.length; offset += chunkSize) {
          const length = Math.min(chunkSize, binary.length - offset);
          const bytes = new Uint8Array(length);
          for (let i = 0; i < length; i++) {
            bytes[i] = binary.charCodeAt(offset + i);
          }
          chunks.push(bytes);
        }

        const blob = new Blob(chunks, { type: mimeType });
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(function () {
          window.URL.revokeObjectURL(objectUrl);
        }, 1000);
      } catch (error) {
        console.error('Attachment Download Error:', error);
        alert(error.message || 'خطا در دریافت فایل.');
      }
    },


    showUploadMessage: async function () {
      if (document.getElementById('attachment-upload-modal')) return;

      const router = window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const canUpload = !!(router && (
        (typeof router.isAdmin === 'function' && router.isAdmin()) ||
        permissions.indexOf('ATTACHMENT_UPLOAD') !== -1
      ));
      if (!canUpload) {
        alert('برای بارگذاری فایل، دسترسی ATTACHMENT_UPLOAD لازم است.');
        return;
      }

      const modal = document.createElement('div');
      modal.id = 'attachment-upload-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML =
        '<section class="modal" role="dialog" aria-modal="true" aria-labelledby="attachment-upload-title" style="width:min(620px,100%);max-height:90vh;overflow:auto;">' +
          '<header class="modal-header"><h3 id="attachment-upload-title">بارگذاری فایل</h3><button type="button" class="modal-close" id="attachment-upload-close" aria-label="بستن">×</button></header>' +
          '<div class="modal-body">' +
            '<form id="attachment-upload-form">' +
              '<div class="filter-group"><label for="attachment-upload-entity-type">اتصال فایل به *</label><select id="attachment-upload-entity-type" class="form-control" required><option value="PROJECT">پروژه</option><option value="EVENT">رویداد</option></select></div>' +
              '<div class="filter-group" style="margin-top:12px"><label for="attachment-upload-entity">انتخاب مورد *</label><select id="attachment-upload-entity" class="form-control" required><option value="">ابتدا نوع اتصال را انتخاب کنید…</option></select><small id="attachment-upload-entity-help" style="display:block;margin-top:5px;color:var(--color-text-secondary)">در حال دریافت فهرست…</small></div>' +
              '<div class="filter-group" style="margin-top:12px"><label for="attachment-upload-file">فایل *</label><input id="attachment-upload-file" class="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required><small style="display:block;margin-top:5px;color:var(--color-text-secondary)">فرمت‌های مجاز: JPG، PNG، WEBP، PDF، DOCX و XLSX؛ حداکثر ۵ مگابایت.</small></div>' +
              '<div class="filter-group" style="margin-top:12px"><label for="attachment-upload-filename">نام فایل</label><input id="attachment-upload-filename" class="form-control" type="text" maxlength="180" autocomplete="off" placeholder="نام اصلی فایل استفاده می‌شود"></div>' +
              '<div id="attachment-upload-status" role="status" aria-live="polite" style="margin-top:12px"></div>' +
              '<div style="display:flex;gap:8px;justify-content:flex-start;flex-wrap:wrap;margin-top:16px"><button class="btn btn-primary" id="attachment-upload-submit" type="submit">بارگذاری</button><button class="btn btn-secondary" id="attachment-upload-cancel" type="button">انصراف</button></div>' +
            '</form>' +
          '</div>' +
        '</section>';

      document.body.appendChild(modal);

      const form = modal.querySelector('#attachment-upload-form');
      const typeSelect = modal.querySelector('#attachment-upload-entity-type');
      const entitySelect = modal.querySelector('#attachment-upload-entity');
      const entityHelp = modal.querySelector('#attachment-upload-entity-help');
      const fileInput = modal.querySelector('#attachment-upload-file');
      const fileNameInput = modal.querySelector('#attachment-upload-filename');
      const status = modal.querySelector('#attachment-upload-status');
      const submit = modal.querySelector('#attachment-upload-submit');
      let entityRequestId = 0;

      const onKeyDown = function (event) {
        if (event.key === 'Escape') close();
      };
      const close = function () {
        modal.remove();
        document.removeEventListener('keydown', onKeyDown);
      };
      modal.querySelector('#attachment-upload-close').addEventListener('click', close);
      modal.querySelector('#attachment-upload-cancel').addEventListener('click', close);
      modal.addEventListener('click', function (event) {
        if (event.target === modal) close();
      });
      document.addEventListener('keydown', onKeyDown);

      const unwrapList = function (response, keys) {
        let data = Api.extractData(response);
        for (let depth = 0; depth < 4 && data && !Array.isArray(data); depth += 1) {
          let next = null;
          for (let i = 0; i < keys.length; i += 1) {
            if (Array.isArray(data[keys[i]])) { next = data[keys[i]]; break; }
          }
          if (!next && data.data && typeof data.data === 'object') next = data.data;
          if (!next) break;
          data = next;
        }
        return Array.isArray(data) ? data : [];
      };

      const getEntityId = function (item, kind) {
        return String(item.ID || item.Id || item.id ||
          (kind === 'PROJECT' ? item.ProjectID : item.EventID) || '');
      };
      const getEntityLabel = function (item, kind, id) {
        if (kind === 'PROJECT') {
          const code = item.ProjectCode || item.Code || '';
          const title = item.Title || item.Name || item.ProjectName || '';
          return [code, title].filter(Boolean).join(' — ') || id;
        }
        const title = item.EventTypeName || item.EventTypeTitle || item.Title || item.Name || item.EventTitle || 'رویداد';
        const project = item.ProjectCode || item.ProjectTitle || '';
        const date = item.EventDate || item.CreatedAt || item.RegisteredAt || '';
        return [title, project, date ? String(date).slice(0, 10) : ''].filter(Boolean).join(' — ') || id;
      };

      const loadEntities = async function () {
        const requestId = ++entityRequestId;
        const kind = typeSelect.value;
        entitySelect.disabled = true;
        entitySelect.innerHTML = '<option value="">در حال دریافت فهرست…</option>';
        entityHelp.textContent = 'در حال دریافت فهرست…';
        status.textContent = '';
        try {
          const response = await Api.get(kind === 'PROJECT' ? '/projects' : '/events', { trackSync: false });
          if (requestId !== entityRequestId || !document.body.contains(modal)) return;
          const keys = kind === 'PROJECT'
            ? ['projects', 'items', 'results', 'data']
            : ['events', 'items', 'results', 'data'];
          const items = unwrapList(response, keys);
          const options = items.map(function (item) {
            const id = getEntityId(item, kind);
            return id ? { id: id, label: getEntityLabel(item, kind, id) } : null;
          }).filter(Boolean);
          entitySelect.innerHTML = '<option value="">یک مورد انتخاب کنید…</option>' + options.map(function (item) {
            return '<option value="' + MODULE.escapeHtml(item.id) + '">' + MODULE.escapeHtml(item.label) + '</option>';
          }).join('');
          entitySelect.disabled = false;
          entityHelp.textContent = options.length
            ? options.length + ' مورد قابل انتخاب است.'
            : 'موردی برای انتخاب پیدا نشد یا دسترسی مشاهده این فهرست وجود ندارد.';
        } catch (error) {
          if (requestId !== entityRequestId || !document.body.contains(modal)) return;
          entitySelect.innerHTML = '<option value="">فهرست قابل دریافت نیست</option>';
          entitySelect.disabled = true;
          entityHelp.textContent = 'دریافت فهرست ناموفق بود. دسترسی مشاهده پروژه‌ها/رویدادها و اتصال سرور را بررسی کنید.';
          status.textContent = error.message || 'خطا در دریافت فهرست.';
        }
      };

      typeSelect.addEventListener('change', loadEntities);
      fileInput.addEventListener('change', function () {
        const file = fileInput.files && fileInput.files[0];
        if (file && !fileNameInput.value.trim()) fileNameInput.value = file.name;
      });
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (submit.disabled) return;
        const entityId = entitySelect.value;
        const kind = typeSelect.value;
        const file = fileInput.files && fileInput.files[0];
        if (!entityId) {
          status.textContent = 'ابتدا پروژه یا رویداد را انتخاب کنید.';
          entitySelect.focus();
          return;
        }
        if (!file) {
          status.textContent = 'لطفاً یک فایل انتخاب کنید.';
          fileInput.focus();
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          status.textContent = 'حجم فایل نباید بیشتر از ۵ مگابایت باشد.';
          fileInput.focus();
          return;
        }
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        const mimeByExtension = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        const allowedMimeTypes = Object.keys(mimeByExtension).map(function (key) { return mimeByExtension[key]; });
        const mimeType = allowedMimeTypes.indexOf(file.type) !== -1 ? file.type : mimeByExtension[extension];
        if (!mimeType) {
          status.textContent = 'نوع فایل مجاز نیست. فقط JPG، PNG، WEBP، PDF، DOCX و XLSX پذیرفته می‌شوند.';
          fileInput.focus();
          return;
        }

        submit.disabled = true;
        status.textContent = 'در حال آماده‌سازی و ارسال فایل…';
        try {
          const dataUrl = await new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result || '')); };
            reader.onerror = function () { reject(new Error('خواندن فایل ناموفق بود.')); };
            reader.readAsDataURL(file);
          });
          const requestedName = String(fileNameInput.value || '').trim();
          const chosenName = requestedName || file.name;
          const dot = chosenName.lastIndexOf('.');
          const finalName = dot > 0 ? chosenName : chosenName + '.' + extension;
          const response = await Api.post('/attachments', {
            EntityType: kind,
            EntityID: entityId,
            FileName: finalName.replace(/[\\/:*?"<>|]/g, '_').slice(0, 180),
            MimeType: mimeType,
            Base64: dataUrl
          });
          const result = Api.extractData(response) || {};
          if (result.success === false || result.error) {
            throw new Error(result.message || result.error || 'بارگذاری فایل ناموفق بود.');
          }
          if (Cache && typeof Cache.remove === 'function') Cache.remove(MODULE.cacheKey);
          status.textContent = 'فایل با موفقیت بارگذاری شد.';
          await MODULE.load();
          window.setTimeout(close, 350);
        } catch (error) {
          status.textContent = error.message || 'بارگذاری فایل ناموفق بود.';
        } finally {
          if (document.body.contains(modal)) submit.disabled = false;
        }
      });

      await loadEntities();
      const firstFocusable = modal.querySelector('#attachment-upload-entity-type');
      if (firstFocusable) firstFocusable.focus();
    },


    getEntityLabel:
      function (
        value
      ) {

        const type =
          String(
            value || ''
          )
            .toUpperCase();


        if (
          type === 'PROJECT'
        ) {

          return 'پروژه';

        }


        if (
          type === 'EVENT'
        ) {

          return 'رویداد';

        }


        return this.escapeHtml(
          value || '-'
        );

      },


    getStatusLabel:
      function (
        value
      ) {

        const status =
          String(
            value || ''
          )
            .toUpperCase();


        const labels = {

          ACTIVE:
            'فعال',

          INACTIVE:
            'غیرفعال',

          DELETED:
            'حذف‌شده',

          VOID:
            'باطل‌شده'

        };


        return (
          labels[status] ||
          this.escapeHtml(
            value || '-'
          )
        );

      },


    formatFileSize:
      function (
        value
      ) {

        const size =
          Number(
            value
          );


        if (
          !size ||
          size <= 0
        ) {

          return '-';

        }


        if (
          size < 1024
        ) {

          return (
            size +
            ' B'
          );

        }


        if (
          size < 1024 * 1024
        ) {

          return (
            (size / 1024)
              .toFixed(1) +
            ' KB'
          );

        }


        return (
          (size / (1024 * 1024))
            .toFixed(1) +
          ' MB'
        );

      },


    showLoading:
      function (
        visible
      ) {

        const element =
          document.getElementById(
            'attachments-loading'
          );


        if (element) {

          element.hidden =
            !visible;

        }

      },


    showError:
      function (
        message
      ) {

        const element =
          document.getElementById(
            'attachments-error'
          );


        if (!element) {

          return;

        }


        element.textContent =
          message;


        element.hidden =
          false;

      },


    hideError:
      function () {

        const element =
          document.getElementById(
            'attachments-error'
          );


        if (element) {

          element.hidden =
            true;

        }

      },


    escapeHtml:
      function (
        value
      ) {

        const div =
          document.createElement(
            'div'
          );


        div.textContent =
          String(
            value ?? ''
          );


        return div.innerHTML;

      },


    escapeJs:
      function (
        value
      ) {

        return String(
          value ?? ''
        )
          .replace(
            /\\/g,
            '\\\\'
          )
          .replace(
            /'/g,
            "\\'"
          )
          .replace(
            /"/g,
            '\\"'
          )
          .replace(
            /\r/g,
            '\\r'
          )
          .replace(
            /\n/g,
            '\\n'
          );

      }

  };


   window.PMS.Attachments =
    MODULE;

  window.PMS.Modules.Attachments =
    MODULE;

})();