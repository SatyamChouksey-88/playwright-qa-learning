/** Shared HTML escape + safe render helper (C3). file:// safe, no deps. */
(function (global) {
  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Trusted static template literals only — caller must not interpolate raw user HTML. */
  function html(strings, ...values) {
    let out = '';
    strings.forEach((str, i) => {
      out += str;
      if (i < values.length) out += escapeHtml(values[i]);
    });
    return out;
  }

  global.escapeHtml = escapeHtml;
  global.safeHtml = html;
})(typeof window !== 'undefined' ? window : globalThis);
