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
        uploadButton.hidden = !MODULE.can('ATTACHMENT_UPLOAD');
        uploadButton.addEventListener('click', function () {
          MODULE.showUploadMessage();
        });
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
            '<button type="button" class="btn btn-sm btn-light" onclick="PMS.Modules.Attachments.download(\\'' +
            this.escapeJs(id) + '\\')">دانلود</button>';

          if (this.can('ATTACHMENT_DELETE')) {
            html +=
              ' <button type="button" class="btn btn-sm btn-danger" onclick="PMS.Modules.Attachments.deleteAttachment(\\'' +
              this.escapeJs(id) + '\\')">حذف</button>';
          }


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


    can: function (permission) {
      const router = window.PMS && window.PMS.Router;
      if (router && typeof router.isAdmin === 'function' && router.isAdmin()) return true;
      return Boolean(router && Array.isArray(router.permissions) &&
        router.permissions.indexOf(permission) !== -1);
    },

    download: async function (attachmentId) {
      if (!attachmentId) return;
      try {
        const response = await Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download');
        const data = Api.extractData(response);
        if (!data || !data.Base64) throw new Error('محتوای فایل از سرور دریافت نشد.');
        const binary = window.atob(data.Base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.MimeType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = data.FileName || 'download';
        anchor.hidden = true;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (error) {
        console.error('Attachment Download Error:', error);
        alert(error.message || 'خطا در دریافت فایل.');
      }
    },

    showUploadMessage: function () {
      if (!this.can('ATTACHMENT_UPLOAD')) {
        alert('شما مجوز بارگذاری فایل را ندارید.');
        return;
      }
      if (document.getElementById('attachment-upload-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'attachment-upload-modal';
      modal.className = 'modal-overlay';
      modal.dir = 'rtl';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'attachment-upload-title');
      modal.innerHTML =
        '<div class="modal">' +
          '<div class="modal-header"><h3 id="attachment-upload-title">بارگذاری فایل</h3>' +
            '<button type="button" class="btn btn-light" id="attachment-upload-close" aria-label="بستن">×</button></div>' +
          '<div class="modal-body">' +
            '<div id="attachment-upload-error" class="alert alert-danger" role="alert" hidden></div>' +
            '<form id="attachment-upload-form" class="form">' +
              '<div class="form-group"><label for="attachment-upload-entity">نوع ارتباط</label>' +
                '<select id="attachment-upload-entity" required><option value="PROJECT">پروژه</option><option value="EVENT">رویداد</option></select></div>' +
              '<div class="form-group"><label for="attachment-upload-entity-id">شناسه پروژه یا رویداد</label>' +
                '<input id="attachment-upload-entity-id" type="text" required autocomplete="off" /></div>' +
              '<div class="form-group"><label for="attachment-upload-file">فایل</label>' +
                '<input id="attachment-upload-file" type="file" required />' +
                '<small class="form-help">فایل به پروژه یا رویداد انتخاب‌شده پیوست می‌شود.</small></div>' +
              '<div class="form-actions"><button id="attachment-upload-submit" type="submit" class="btn btn-primary">بارگذاری</button>' +
                '<button id="attachment-upload-cancel" type="button" class="btn btn-secondary">انصراف</button></div>' +
            '</form></div></div>';
      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
      const close = function () {
        if (modal.dataset.busy === 'true') return;
        modal.remove();
        if (!document.querySelector('.modal-overlay')) document.body.classList.remove('modal-open');
      };
      modal.querySelector('#attachment-upload-close').addEventListener('click', close);
      modal.querySelector('#attachment-upload-cancel').addEventListener('click', close);
      modal.addEventListener('click', function (event) {
        if (event.target === modal) close();
      });
      modal.querySelector('#attachment-upload-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const entityType = modal.querySelector('#attachment-upload-entity').value;
        const entityId = modal.querySelector('#attachment-upload-entity-id').value.trim();
        const fileInput = modal.querySelector('#attachment-upload-file');
        const file = fileInput.files && fileInput.files[0];
        const errorBox = modal.querySelector('#attachment-upload-error');
        const submit = modal.querySelector('#attachment-upload-submit');
        errorBox.hidden = true;
        errorBox.textContent = '';
        if (!entityId || !file) {
          errorBox.textContent = 'شناسه و فایل را وارد کنید.';
          errorBox.hidden = false;
          return;
        }
        if (file.size === 0) {
          errorBox.textContent = 'فایل انتخاب‌شده خالی است.';
          errorBox.hidden = false;
          return;
        }
        modal.dataset.busy = 'true';
        submit.disabled = true;
        submit.textContent = 'در حال بارگذاری...';
        try {
          const base64 = await new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
              const result = String(reader.result || '');
              const comma = result.indexOf(',');
              if (comma < 0) return reject(new Error('خواندن فایل ناموفق بود.'));
              resolve(result.slice(comma + 1));
            };
            reader.onerror = function () { reject(new Error('خواندن فایل ناموفق بود.')); };
            reader.readAsDataURL(file);
          });
          await Api.post('/attachments', {
            EntityType: entityType,
            EntityID: entityId,
            FileName: file.name,
            MimeType: file.type || 'application/octet-stream',
            Base64: base64
          });
          Api.invalidateMany([MODULE.cacheKey]);
          modal.dataset.busy = 'false';
          close();
          await MODULE.load();
          alert('فایل با موفقیت بارگذاری شد.');
        } catch (error) {
          modal.dataset.busy = 'false';
          submit.disabled = false;
          submit.textContent = 'بارگذاری';
          errorBox.textContent = error.message || 'بارگذاری فایل ناموفق بود.';
          errorBox.hidden = false;
        }
      });
      modal.querySelector('#attachment-upload-entity-id').focus();
    },

    deleteAttachment: async function (attachmentId) {
      if (!attachmentId || !this.can('ATTACHMENT_DELETE')) {
        alert('شما مجوز حذف فایل را ندارید.');
        return;
      }
      const reason = window.prompt('دلیل حذف فایل را وارد کنید:');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('وارد کردن دلیل حذف الزامی است.');
        return;
      }
      if (!window.confirm('آیا از حذف این فایل مطمئن هستید؟')) return;
      try {
        await Api.delete('/attachments/' + encodeURIComponent(attachmentId), {
          params: { reason: reason.trim() }
        });
        Api.invalidateMany([MODULE.cacheKey]);
        await this.load();
        alert('فایل حذف شد.');
      } catch (error) {
        alert(error.message || 'حذف فایل ناموفق بود.');
      }
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