
(function () {
  'use strict';

 const DEFAULT_API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbw-o15vVNFbnfqhVYV6PtpDOTt4jURF5QKEahvnENkZp2hOPlek1Hj55T2tBnypfPCb/exec';
  // Explicitly injected only by controlled staging tests. Normal users keep the production default.
  const configuredApiBase = String(window.PMS_API_BASE_URL || '').trim();
  const API_BASE_URL = configuredApiBase || DEFAULT_API_BASE_URL;
  const TOKEN_KEY = 'pms_api_token';

  let memoryToken = null;
  let authExpiredNotified = false;
  const inFlightGetRequests = new Map();
  const diagnosticsEnabled = (function () {
    try {
      return new URLSearchParams(window.location.search).get('pmsDiagnostics') === '1';
    } catch (error) {
      return false;
    }
  })();
  const diagnosticRows = [];

  function renderPerformanceDiagnostics() {
    if (!diagnosticsEnabled || !document.body) return;
    let panel = document.getElementById('pms-performance-diagnostics');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'pms-performance-diagnostics';
      panel.setAttribute('aria-label', 'تشخیص سرعت PMS');
      panel.style.cssText = 'position:fixed;z-index:99999;left:10px;bottom:10px;width:min(620px,calc(100vw - 20px));max-height:45vh;overflow:auto;padding:12px;background:#111827;color:#f9fafb;border:1px solid #64748b;border-radius:10px;box-shadow:0 8px 30px #0005;font:12px/1.6 system-ui,sans-serif;direction:rtl';
      const heading = document.createElement('div');
      heading.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-weight:700';
      const title = document.createElement('span');
      title.textContent = 'تشخیص سرعت درخواست‌ها (حالت آزمایشی)';
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = 'بستن';
      close.style.cssText = 'border:1px solid #64748b;border-radius:6px;padding:2px 8px;background:#374151;color:#fff;cursor:pointer';
      close.addEventListener('click', function () { panel.remove(); });
      heading.appendChild(title);
      heading.appendChild(close);
      const note = document.createElement('p');
      note.textContent = 'زمان مرورگر از ارسال تا دریافت پاسخ است؛ جزئیات بک‌اند فقط برای مدیر مجاز نمایش داده می‌شود.';
      note.style.cssText = 'margin:0 0 8px;color:#cbd5e1';
      const benchmark = document.createElement('button');
      benchmark.type = 'button';
      benchmark.textContent = 'سنجش ۵ مسیر تأمین';
      benchmark.style.cssText = 'margin:0 0 8px;border:1px solid #64748b;border-radius:6px;padding:6px 10px;background:#374151;color:#fff;cursor:pointer';
      benchmark.addEventListener('click', async function () {
        if (benchmark.disabled) return;
        benchmark.disabled = true;
        benchmark.textContent = 'در حال سنجش مسیرهای تأمین...';
        const paths = [
          '/procurement/workspace',
          '/procurement/dashboard',
          '/procurement/needs',
          '/procurement/orders',
          '/procurement/reports'
        ];
        for (const path of paths) {
          try {
            await Api.get(path, { retry: false, trackSync: false });
          } catch (error) {}
        }
        benchmark.disabled = false;
        benchmark.textContent = 'سنجش دوباره ۵ مسیر تأمین';
      });
      const table = document.createElement('table');
      table.id = 'pms-performance-diagnostics-table';
      table.style.cssText = 'width:100%;border-collapse:collapse;text-align:right;word-break:break-word';
      panel.appendChild(heading);
      panel.appendChild(note);
      panel.appendChild(benchmark);
      panel.appendChild(table);
      document.body.appendChild(panel);
    }

    const table = document.getElementById('pms-performance-diagnostics-table');
    if (!table) return;
    table.textContent = '';
    const header = document.createElement('tr');
    ['مسیر', 'زمان مرورگر', 'کل بک‌اند', 'خواندن/پردازش بک‌اند'].forEach(function (label) {
      const cell = document.createElement('th');
      cell.textContent = label;
      cell.style.cssText = 'padding:5px;border-bottom:1px solid #475569';
      header.appendChild(cell);
    });
    table.appendChild(header);

    diagnosticRows.slice().reverse().forEach(function (item) {
      const row = document.createElement('tr');
      const backend = item.backend ? String(item.backend.totalMs) + ' ms' : '—';
      const detail = item.backend
        ? 'دسترسی ' + item.backend.accessMs + ' / روتر ' + item.backend.routerMs +
          (item.sheets.length ? ' / Sheets: ' + item.sheets.map(function (s) {
            return s.operation + ':' + s.totalMs + 'ms×' + s.count;
          }).join(', ') : '')
        : 'جزئیات مدیر در دسترس نیست';
      [item.path, item.clientMs + ' ms', backend, detail].forEach(function (value) {
        const cell = document.createElement('td');
        cell.textContent = value;
        cell.style.cssText = 'padding:5px;border-bottom:1px solid #374151;vertical-align:top';
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
  }

  function recordPerformance(path, clientMs, data) {
    if (!diagnosticsEnabled) return;
    const diagnostics = data && data._diagnostics;
    const sheets = diagnostics && Array.isArray(diagnostics.sheetOperations)
      ? diagnostics.sheetOperations.slice(0, 3)
      : [];
    diagnosticRows.push({
      path: String(path || ''),
      clientMs: Math.round(clientMs),
      backend: diagnostics || null,
      sheets: sheets
    });
    if (diagnosticRows.length > 20) diagnosticRows.shift();
    renderPerformanceDiagnostics();
  }

  const syncState = {
    status: 'idle',
    activeRequests: 0,
    lastUpdated: null,
    lastError: null,
    cachedDisplayed: false,
    batchHadError: false
  };

  function notifySyncStatus() {
    try {
      if (typeof window.CustomEvent !== 'function') return;

      window.dispatchEvent(
        new CustomEvent('pms:sync-status', {
          detail: {
            status: syncState.status,
            activeRequests: syncState.activeRequests,
            lastUpdated: syncState.lastUpdated,
            lastError: syncState.lastError,
            cachedDisplayed: syncState.cachedDisplayed
          }
        })
      );
    } catch (error) {}
  }

  function startTrackedRequest() {
    if (syncState.activeRequests === 0) {
      syncState.batchHadError = false;
      syncState.lastError = null;
    }

    syncState.activeRequests += 1;
    syncState.status = syncState.cachedDisplayed
      ? 'cached-refreshing'
      : 'fetching';

    notifySyncStatus();
  }

  function finishTrackedRequest(success, error) {
    if (syncState.activeRequests > 0) {
      syncState.activeRequests -= 1;
    }

    if (!success) {
      syncState.batchHadError = true;
      syncState.lastError =
        error && error.message
          ? error.message
          : 'خطا در ارتباط با سرور.';
    }

    if (syncState.activeRequests > 0) {
      syncState.status = syncState.cachedDisplayed
        ? 'cached-refreshing'
        : 'fetching';

      notifySyncStatus();
      return;
    }

    if (syncState.batchHadError) {
      syncState.status = 'error';
    } else {
      syncState.status = 'updated';
      syncState.lastUpdated = Date.now();
      syncState.lastError = null;
    }

    syncState.cachedDisplayed = false;
    notifySyncStatus();
  }

  function isAuthError(error) {
    if (!error) return false;

    const code = String(error.code || '').toUpperCase();
    const message = String(error.message || '');

    return (
      error.status === 401 ||
      code === 'UNAUTHORIZED' ||
      code === 'AUTH_REQUIRED' ||
      code === 'SESSION_EXPIRED' ||
      /نشست کاربر معتبر نیست|نشست.*منقضی|احراز هویت الزامی است/.test(message)
    );
  }

  function notifyAuthExpired() {
    Api.clearToken();

    if (authExpiredNotified) return;
    authExpiredNotified = true;

    try {
      window.dispatchEvent(
        new CustomEvent('pms:auth-expired', {
          detail: {
            message: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.'
          }
        })
      );
    } catch (error) {}
  }

  const Api = {
    setToken: function (token) {
      memoryToken = token || null;

      if (memoryToken) {
        authExpiredNotified = false;

        try {
          localStorage.setItem(TOKEN_KEY, memoryToken);
        } catch (error) {}
      } else {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch (error) {}
      }
    },

    getToken: function () {
      if (memoryToken) return memoryToken;

      try {
        return localStorage.getItem(TOKEN_KEY) || null;
      } catch (error) {
        return null;
      }
    },

    clearToken: function () {
      memoryToken = null;

      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (error) {}
    },

    getSyncStatus: function () {
      return {
        status: syncState.status,
        activeRequests: syncState.activeRequests,
        lastUpdated: syncState.lastUpdated,
        lastError: syncState.lastError,
        cachedDisplayed: syncState.cachedDisplayed
      };
    },

    markCacheShown: function () {
      syncState.cachedDisplayed = true;

      syncState.status = syncState.activeRequests > 0
        ? 'cached-refreshing'
        : 'cached';

      notifySyncStatus();
    },

    request: async function (method, path, options) {
      options = options || {};

      const actualMethod = String(method || 'GET').toUpperCase();
      const requestStartedAt = Date.now();
      // Auxiliary requests can opt out of the global header status.
      const tracked =
        (actualMethod === 'GET' || actualMethod === 'HEAD') &&
        options.trackSync !== false;

      if (tracked) startTrackedRequest();

      try {
        const params = new URLSearchParams();
        params.set('path', path || '/');
        const diagnosticPath = /^\/(dashboard|projects(?:\/|$)|project-dashboard\/lookups|workflows(?:\/|$)|events(?:\/|$)|procurement(?:\/|$))/.test(String(path || '/'));
        if (diagnosticsEnabled && diagnosticPath && (actualMethod === 'GET' || actualMethod === 'HEAD')) params.set('_diagnostics', '1');
        if (options.query && typeof options.query === 'object') {
          Object.keys(options.query).forEach((key) => {
            const value = options.query[key];
            if (value !== undefined && value !== null) params.set(key, String(value));
          });
        }

        const token = this.getToken();

        if (token) params.set('token', token);

        const usePostOverride =
          actualMethod === 'PUT' || actualMethod === 'DELETE';

        if (usePostOverride) {
          params.set('_method', actualMethod);
        }

        const url = API_BASE_URL + '?' + params.toString();

        const fetchOptions = {
          method: usePostOverride ? 'POST' : actualMethod,
          redirect: 'follow'
        };

        if (
          actualMethod !== 'GET' &&
          actualMethod !== 'HEAD'
        ) {
          fetchOptions.headers = {
            'Content-Type': 'text/plain;charset=utf-8'
          };

          fetchOptions.body = JSON.stringify(options.body || {});
        }

        // Retry transient network errors, rate limits and server failures a
        // small number of times. Permission/validation failures are not retried.
        const canRetry = options.retry !== false &&
          (actualMethod === 'GET' || actualMethod === 'HEAD');
        const maxAttempts = canRetry ? 3 : 1;
        let response = null;
        let data = null;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          try {
            response = await fetch(url, fetchOptions);
          } catch (fetchError) {
            if (attempt + 1 >= maxAttempts) throw fetchError;
            await new Promise(function (resolve) {
              setTimeout(resolve, attempt === 0 ? 300 : 750);
            });
            continue;
          }

          data = null;
          try {
            data = await response.json();
          } catch (parseError) {
            data = null;
          }
          if (diagnosticsEnabled && diagnosticPath) recordPerformance(path, Date.now() - requestStartedAt, data);

          const transientHttpError =
            response.status === 429 || response.status >= 500;
          if (transientHttpError && attempt + 1 < maxAttempts) {
            await new Promise(function (resolve) {
              setTimeout(resolve, attempt === 0 ? 300 : 750);
            });
            continue;
          }

          break;
        }

        if (!response || !response.ok) {
          throw this.createApiError(response ? response.status : 0, data);
        }

        if (data === null || typeof data !== 'object') {
          const invalidResponse = new Error(
            'پاسخ سرور قابل خواندن نیست. لطفاً دوباره تلاش کنید.'
          );
          invalidResponse.code = 'INVALID_API_RESPONSE';
          invalidResponse.status = response.status;
          throw invalidResponse;
        }

        if (data && data.success === false) {
          throw this.createApiError(response.status, data);
        }

        if (tracked) finishTrackedRequest(true);

        return data;

      } catch (error) {
        if (isAuthError(error) && path !== '/auth/login' && path !== '/auth/logout') {
          notifyAuthExpired();
        }

        if (tracked) finishTrackedRequest(false, error);

        throw error;
      }
    },

    get: function (path, options) {
      const token = this.getToken() || '';
      const query = options && options.query && typeof options.query === 'object'
        ? options.query
        : {};
      const queryKey = Object.keys(query).filter(function (key) {
        return query[key] !== undefined && query[key] !== null;
      }).sort().map(function (key) {
        return [key, String(query[key])];
      });
      // Query parameters affect the response; requests with different filters
      // must never share the same in-flight GET promise.
      const requestKey = token + '\n' + String(path || '/') + '\n' +
        JSON.stringify(queryKey) + '\ntrackSync=' + String(options && options.trackSync !== false) +
        '\nretry=' + String(!(options && options.retry === false));

      if (inFlightGetRequests.has(requestKey)) {
        return inFlightGetRequests.get(requestKey);
      }

      const requestPromise = this.request('GET', path, options);
      const sharedPromise = requestPromise.finally(function () {
        if (inFlightGetRequests.get(requestKey) === sharedPromise) {
          inFlightGetRequests.delete(requestKey);
        }
      });

      inFlightGetRequests.set(requestKey, sharedPromise);
      return sharedPromise;
    },

    post: function (path, body, options) {
      options = options || {};
      options.body = body;

      return this.request('POST', path, options);
    },

    put: function (path, body, options) {
      options = options || {};
      options.body = body;

      return this.request('PUT', path, options);
    },

    delete: function (path, options) {
      return this.request('DELETE', path, options);
    },

    getCached: async function (path, cacheKey, options) {
      options = options || {};

      const cached =
        window.PMS && window.PMS.Cache
          ? window.PMS.Cache.get(cacheKey)
          : null;

      const freshPromise = this.get(path, options);

      if (cached !== null) {
        this.markCacheShown();

        freshPromise
          .then(function (response) {
            const data = Api.extractData(response);

            if (window.PMS && window.PMS.Cache) {
              window.PMS.Cache.set(cacheKey, data);
            }

            if (typeof options.onRefresh === 'function') {
              options.onRefresh(data, response);
            }
          })
          .catch(function (error) {
            // نشست نامعتبر است؛ از تکرار پیام خطا جلوگیری می‌کنیم.
            if (isAuthError(error)) return;

            console.warn('Background refresh failed:', error);

            if (typeof options.onError === 'function') {
              options.onError(error, true);
            }
          });

        return {
          data: cached,
          cached: true,
          refreshing: true
        };
      }

      const response = await freshPromise;
      const data = this.extractData(response);

      if (window.PMS && window.PMS.Cache) {
        window.PMS.Cache.set(cacheKey, data);
      }

      return {
        data: data,
        cached: false,
        refreshing: false,
        response: response
      };
    },

    getFresh: async function (path, cacheKey, options) {
      const response = await this.get(path, options);
      const data = this.extractData(response);

      if (window.PMS && window.PMS.Cache) {
        window.PMS.Cache.set(cacheKey, data);
      }

      return data;
    },

    getCachedData: function (cacheKey) {
      if (!window.PMS || !window.PMS.Cache) return null;
      return window.PMS.Cache.get(cacheKey);
    },

    extractData: function (response) {
      if (
        response &&
        response.success === true &&
        Object.prototype.hasOwnProperty.call(response, 'data')
      ) {
        return response.data;
      }

      return response;
    },

    invalidate: function (cacheKey) {
      if (window.PMS && window.PMS.Cache) {
        window.PMS.Cache.remove(cacheKey);
      }
    },

    invalidateMany: function (cacheKeys) {
      if (!Array.isArray(cacheKeys)) return;

      cacheKeys.forEach(function (key) {
        Api.invalidate(key);
      });
    },

    createApiError: function (status, response) {
      const error = new Error(
        response &&
        response.error &&
        response.error.message
          ? response.error.message
          : 'خطا در ارتباط با سرور.'
      );

      error.status = status;
      error.code =
        response &&
        response.error &&
        response.error.code
          ? response.error.code
          : 'API_ERROR';
      error.response = response;

      return error;
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Api = Api;
})();
