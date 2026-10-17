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

        uploadButton.addEventListener(
          'click',
          function () {

            MODULE.showUploadMessage();

          }
        );

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


    showUploadMessage:
      function () {

        alert(
          'فرم بارگذاری فایل را در مرحله بعد اضافه می‌کنیم.'
        );

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