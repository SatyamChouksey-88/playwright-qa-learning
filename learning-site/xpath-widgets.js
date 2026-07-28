/* Live XPath practice widgets + evaluator for PlaywrightLearning */
(function () {
  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === "className") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function normalizeXPath(expr) {
    let s = (expr || "").trim();
    if (s.startsWith("xpath=")) s = s.slice(6).trim();
    return s;
  }

  function clearHighlights(root) {
    root.querySelectorAll(".xp-hit").forEach((n) => n.classList.remove("xp-hit"));
  }

  // Returns the element a matched node should highlight, or null if the match
  // falls outside the practice root. Absolute expressions (`//…`, `/…`) are
  // evaluated against the whole document even when a context node is passed, so
  // we must clip results to `root` to keep the tester scoped as the UI promises.
  function highlightTargetWithin(root, node) {
    if (!node) return null;
    let target = null;
    if (node.nodeType === Node.ELEMENT_NODE) target = node;
    else if (node.nodeType === Node.ATTRIBUTE_NODE) target = node.ownerElement;
    else if (node.nodeType === Node.TEXT_NODE) target = node.parentElement;
    if (!target) return null;
    return root === target || root.contains(target) ? target : null;
  }

  function evaluateXPath(root, expr) {
    clearHighlights(root);
    const xpath = normalizeXPath(expr);
    if (!xpath) return { ok: false, count: 0, error: "Enter an XPath expression." };
    try {
      const result = document.evaluate(
        xpath,
        root,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      const nodes = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        const target = highlightTargetWithin(root, node);
        if (!target) continue; // ignore matches outside the practice DOM
        target.classList.add("xp-hit");
        nodes.push(node);
      }
      return { ok: true, count: nodes.length, nodes };
    } catch (e) {
      return { ok: false, count: 0, error: e.message || String(e) };
    }
  }

  function buildPracticeDom() {
    return el("div", { className: "xp-practice-dom", id: "xp-practice-root" }, `
      <section class="xp-region">
        <span class="xp-region-label">Login form</span>
        <form class="xp-demo-form" onsubmit="return false">
          <label>Email <input type="email" name="email" id="userEmail" placeholder="you@example.com" /></label>
          <label>Password <input type="password" name="pass" id="userPass" /></label>
          <div class="xp-field-row">
            <label>Company</label>
            <input type="text" name="company" id="company" />
          </div>
          <button type="button" class="xp-btn">Login</button>
          <button type="submit" class="xp-btn xp-btn-primary submit-btn css-a1b2c3" data-action="save">Submit</button>
        </form>
      </section>

      <section class="xp-region">
        <span class="xp-region-label">Plan cards (Added / Removed badges)</span>
        <div class="xp-plans">
          <div data-plan="1" class="xp-plan">
            <div data-automation-id="textView">STI FY26 Standard Plan</div>
          </div>
          <div data-plan="2" class="xp-plan">
            <div data-automation-id="textView">(empty)</div>
            <span class="xp-badge removed">Removed</span>
            <del>STI FY26 Old Sales Plan</del>
          </div>
          <div data-plan="3" class="xp-plan">
            <div data-automation-id="textView">STI FY26 PfR HPE</div>
            <span class="xp-badge added">Added</span>
          </div>
        </div>
      </section>

      <section class="xp-region">
        <span class="xp-region-label">Users table</span>
        <table class="xp-table">
          <thead><tr><th>Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td>Garry White</td><td>ESS</td><td><button type="button">Edit</button></td></tr>
            <tr><td>Ada Lovelace</td><td>Admin</td><td><button type="button">Edit</button></td></tr>
            <tr><td>Joe Root</td><td>ESS</td><td><button type="button">Edit</button></td></tr>
          </tbody>
        </table>
      </section>

      <section class="xp-region">
        <span class="xp-region-label">Duplicate "more" icons (same XPath matches 3)</span>
        <div class="xp-dupes">
          <span class="button01"><button type="button" data-icon="more">⋮</button><p>Read docs</p></span>
          <span class="button02"><input type="text" aria-label="note" /><button type="button" data-icon="more">⋮</button></span>
          <span class="button03"><button type="button" data-icon="more">⋮</button></span>
        </div>
      </section>

      <section class="xp-region">
        <span class="xp-region-label">Two identical dropdown chevrons</span>
        <div class="xp-expiry">
          <div name="expiryDate"><div><a href="#"><div><i class="xp-chevron">▼</i></div></a></div></div>
          <div name="expiryDate"><div><a href="#"><div><i class="xp-chevron">▼</i></div></a></div></div>
        </div>
      </section>

      <section class="xp-region">
        <span class="xp-region-label">Promo banner (plus a hidden script with the same text)</span>
        <div class="xp-promo">Summer promo ends Friday</div>
      </section>
    `);
  }

  function attachScriptSim(root) {
    // Real <script> node (non-executing MIME) so //*[contains(.,'promo')] can false-match
    const s = document.createElement("script");
    s.type = "application/json";
    s.className = "xp-fake-script";
    s.textContent = '{"msg":"promo code HYDRATE"}';
    // .xp-promo lives inside its own <section class="xp-region"> wrapper, so it is a
    // grandchild of root, not a direct child — insertBefore needs the *actual* parent.
    const promo = root.querySelector(".xp-promo");
    if (promo && promo.parentNode) promo.parentNode.insertBefore(s, promo);
  }

  // Short, human-readable description of a matched node for the results list.
  function describeMatch(node) {
    if (!node) return "";
    if (node.nodeType === Node.ATTRIBUTE_NODE) {
      return "@" + node.name + '="' + node.value + '"';
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.nodeValue || "").replace(/\s+/g, " ").trim();
      return 'text "' + t.slice(0, 40) + (t.length > 40 ? "…" : "") + '"';
    }
    const tag = node.tagName ? node.tagName.toLowerCase() : node.nodeName;
    let attr = "";
    if (node.id) attr = ' id="' + node.id + '"';
    else if (node.getAttribute && node.getAttribute("data-plan")) attr = ' data-plan="' + node.getAttribute("data-plan") + '"';
    else if (node.getAttribute && node.getAttribute("data-icon")) attr = ' data-icon="' + node.getAttribute("data-icon") + '"';
    else if (typeof node.className === "string" && node.className.trim()) {
      attr = ' class="' + node.className.trim().split(/\s+/).slice(0, 2).join(" ") + '"';
    }
    const txt = (node.textContent || "").replace(/\s+/g, " ").trim();
    const snippet = txt ? ' — "' + txt.slice(0, 42) + (txt.length > 42 ? "…" : "") + '"' : "";
    return "<" + tag + attr + ">" + snippet;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function mountTester(host) {
    host.innerHTML = "";
    const wrap = el("div", { className: "xp-tester" });

    // How-to guide + highlight legend
    wrap.appendChild(el("div", { className: "xp-howto" }, `
      <strong>How to use:</strong>
      <ol class="xp-steps">
        <li>Click an <em>example</em> below, or type your own XPath in the box.</li>
        <li>Press <kbd>Enter</kbd> or <em>Evaluate</em> to run it against the Practice DOM.</li>
        <li>Matching elements get a <span class="xp-legend-swatch">yellow highlight</span> and are listed under <em>Results</em>.</li>
      </ol>
      <p class="muted" style="margin:6px 0 0">Only the Practice DOM below is searched — not the rest of this page. You can write <code>//…</code> or the Playwright form <code>xpath=//…</code>.</p>
    `));

    const label = el("label", { className: "xp-input-label", for: "xp-main-input", text: "Your XPath expression" });
    wrap.appendChild(label);

    const row = el("div", { className: "xp-tester-row" });
    const input = el("input", {
      type: "text",
      id: "xp-main-input",
      className: "xp-input",
      placeholder: "//button[@type='submit']",
      "aria-label": "XPath expression"
    });
    input.value = "//button[contains(@class,'submit-btn')]";
    const runBtn = el("button", { type: "button", className: "iconbtn primary-btn", text: "Evaluate" });
    runBtn.classList.add("xp-eval-btn");
    const clearBtn = el("button", { type: "button", className: "iconbtn", text: "Clear" });
    row.append(input, runBtn, clearBtn);
    wrap.appendChild(row);

    wrap.appendChild(el("div", { className: "xp-examples-label", text: "Try an example (click to load & run):" }));

    const chips = el("div", { className: "xp-chips" });
    // [label, expression, what-it-teaches tooltip]
    const presets = [
      ["Submit button", "//button[@type='submit']", "Match by a stable attribute"],
      ["Partial class", "//button[contains(@class,'submit-btn')]", "contains() survives hashed CSS-module classes"],
      ["Email → input", "//label[contains(.,'Email')]//input", "Reach a nested input from its label"],
      ["Company sibling", "//label[normalize-space()='Company']/following-sibling::input[1]", "following-sibling axis"],
      ["Ada's Edit", "//tr[td[contains(.,'Ada')]]//button", "Pick a table row by its text, not index"],
      ["Active plans", "//div[@data-plan and not(.//span[text()='Removed'])]", "not() as a predicate to exclude Removed"],
      ["2nd icon only", "(//button[@data-icon='more'])[2]", "Index the whole match set with (…)[n]"],
      ["Scoped button", "//span[@class='button02']//button", "Scope by a unique parent instead of [2]"],
      ["Excludes <script>", "//*[not(self::script) and contains(.,'promo')]", "Avoid matching hidden script text"],
      ["Invalid (XPath 2)", "//label[ends-with(text(),'Email')]", "ends-with is not valid in browsers — see the error"],
    ];
    presets.forEach(([labelText, expr, tip]) => {
      const b = el("button", { type: "button", className: "chip", text: labelText, title: tip });
      b.addEventListener("click", () => {
        input.value = expr;
        run();
      });
      chips.appendChild(b);
    });
    wrap.appendChild(chips);

    const status = el("div", { className: "xp-status", id: "xp-status", "aria-live": "polite" });
    wrap.appendChild(status);

    const results = el("div", { className: "xp-results", id: "xp-results" });
    wrap.appendChild(results);

    const stage = el("div", { className: "xp-stage cardish" });
    stage.appendChild(el("h4", { text: "Practice DOM" }));
    const hint = el("p", { className: "muted xp-stage-hint" });
    hint.innerHTML = "This is the mini web page your XPath runs against. Highlighted boxes are the current matches.";
    stage.appendChild(hint);
    const dom = buildPracticeDom();
    attachScriptSim(dom);
    stage.appendChild(dom);
    wrap.appendChild(stage);

    function run() {
      // Evaluate against practice root so // doesn't hit whole page chrome
      const res = evaluateXPath(dom, input.value);
      if (!res.ok) {
        status.className = "xp-status xp-err";
        status.innerHTML = "✕ Invalid XPath — " + escapeHtml(res.error);
        results.innerHTML = "";
        return;
      }
      if (res.count === 0) {
        status.className = "xp-status xp-warn";
        status.innerHTML = "No matches in the Practice DOM. Check spelling, quotes, and that the element exists.";
        results.innerHTML = "";
        return;
      }
      status.className = "xp-status xp-ok";
      status.innerHTML = "✓ " + res.count + (res.count === 1 ? " match" : " matches") + " highlighted below.";
      results.innerHTML =
        '<div class="xp-results-title">Results</div>' +
        '<ol class="xp-results-list">' +
        res.nodes.map((n) => "<li><code>" + escapeHtml(describeMatch(n)) + "</code></li>").join("") +
        "</ol>";
    }

    runBtn.addEventListener("click", run);
    clearBtn.addEventListener("click", () => {
      clearHighlights(dom);
      status.className = "xp-status";
      status.textContent = "";
      results.innerHTML = "";
      input.value = "";
      input.focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run();
    });

    host.appendChild(wrap);
    run();
  }

  function mountChallengeCards(host, challenges, markFn) {
    host.innerHTML = "";
    challenges.forEach((c, i) => {
      const card = el("article", { className: "challenge-card xpath-challenge", "data-id": c.id });
      card.appendChild(el("h3", { text: (i + 1) + ". " + c.name }));
      card.appendChild(el("p", { text: c.goal }));

      const tryRow = el("div", { className: "xp-try-row" });
      const tryIn = el("input", {
        type: "text",
        className: "xp-input",
        placeholder: "Your XPath…",
        "aria-label": "Try XPath for " + c.name
      });
      const tryBtn = el("button", { type: "button", className: "iconbtn", text: "Try on DOM" });
      const tryMsg = el("span", { className: "xp-try-msg muted-inline" });
      tryBtn.addEventListener("click", () => {
        const testerInput = document.querySelector(".xp-tester .xp-input");
        const stageRoot = document.querySelector(".xp-tester");
        if (!testerInput || !stageRoot) {
          tryMsg.textContent = "Open the live tester above first.";
          return;
        }
        const usedFallback = !tryIn.value.trim();
        testerInput.value = tryIn.value.trim() || c.answer;
        const evBtn = document.querySelector(".xp-tester-row .xp-eval-btn");
        if (evBtn) evBtn.click();
        stageRoot.scrollIntoView({ behavior: "smooth", block: "start" });
        const statusEl = document.getElementById("xp-status");
        tryMsg.textContent =
          (usedFallback ? "Ran the sample answer — " : "Ran your XPath — ") +
          (statusEl ? statusEl.textContent.replace(/^[✓✕]\s*/, "") : "see results above.");
      });
      tryRow.append(tryIn, tryBtn, tryMsg);
      card.appendChild(el("p", { className: "muted xp-try-hint", text: "Type an XPath and press Try on DOM (empty = run the sample answer). Results appear in the tester above." }));
      card.appendChild(tryRow);

      const details = el("details", { className: "solution-reveal" });
      details.appendChild(el("summary", { text: "Show solution (Playwright)" }));
      const body = el("div", { className: "solution-body" });
      body.innerHTML =
        "<p><strong>XPath:</strong> <code>" + c.answer.replace(/</g, "&lt;") + "</code></p>" +
        "<pre><code data-lang=\"ts\">await page.locator('xpath=" +
        c.answer.replace(/'/g, "\\'") +
        "').click(); // or .first() if needed\n" +
        "// Prefer when possible:\n" +
        "// await page.getByRole('button', { name: /submit/i }).click();</code></pre>" +
        "<p class=\"muted\">" + c.why + "</p>";
      details.appendChild(body);
      card.appendChild(details);

      if (typeof markFn === "function") {
        const done = el("button", { type: "button", className: "iconbtn mark-play mark-done", text: "Mark practiced" });
        done.addEventListener("click", () => markFn(c.id, done));
        card.appendChild(done);
      }
      host.appendChild(card);
    });
  }

  /* ---------------- Axis navigator: click a node, click an axis, see it live ---------------- */

  // Static realistic tree: main > (nav, section.product-card > (h2, p.price, div.actions > (Add to cart, Wishlist)), aside)
  const AXIS_TREE = {
    nid: "main", tag: "main", label: "&lt;main&gt;", xp: "//main", children: [
      { nid: "nav", tag: "nav", label: "&lt;nav&gt; Site nav", xp: "//nav", children: [] },
      {
        nid: "card", tag: "section", label: "&lt;section class=\"product-card\"&gt;", xp: "//section[@class='product-card']", children: [
          { nid: "title", tag: "h2", label: "&lt;h2&gt; Wireless Mouse", xp: "//h2[text()='Wireless Mouse']", children: [] },
          { nid: "price", tag: "p", label: "&lt;p class=\"price\"&gt; $29.99", xp: "//p[@class='price']", children: [] },
          {
            nid: "actions", tag: "div", label: "&lt;div class=\"actions\"&gt;", xp: "//div[@class='actions']", children: [
              { nid: "addBtn", tag: "button", label: "&lt;button&gt; Add to cart", xp: "//button[contains(.,'Add to cart')]", children: [] },
              { nid: "wishBtn", tag: "button", label: "&lt;button&gt; ♡ Wishlist", xp: "//button[contains(.,'Wishlist')]", children: [] }
            ]
          }
        ]
      },
      { nid: "aside", tag: "aside", label: "&lt;aside&gt; Related items", xp: "//aside", children: [] }
    ]
  };

  const AXIS_INFO = {
    self: { label: "Self", desc: "The node you selected — the starting point every other axis is measured from." },
    parent: { label: "Parent", desc: "The one node directly above this one (exactly one step up)." },
    child: { label: "Child", desc: "Direct children, one level below — not grandchildren." },
    ancestor: { label: "Ancestor", desc: "Every node above this one, all the way up to the root — parent, grandparent, and so on." },
    descendant: { label: "Descendant", desc: "Every node below this one, at any depth — children, grandchildren, and so on." },
    "following-sibling": { label: "Following-sibling", desc: "Sibling nodes that come after this one, under the same parent." },
    "preceding-sibling": { label: "Preceding-sibling", desc: "Sibling nodes that come before this one, under the same parent." }
  };

  function renderAxisNode(node, depth) {
    const kids = node.children.length
      ? '<div class="xp-axis-children">' + node.children.map((c) => renderAxisNode(c, depth + 1)).join("") + "</div>"
      : "";
    return (
      '<div class="xp-axis-node" data-nid="' + node.nid + '">' +
      '<span class="xp-axis-tag" data-select="' + node.nid + '" tabindex="0" role="button" aria-label="Select ' + node.tag + '">' + node.label + "</span>" +
      kids +
      "</div>"
    );
  }

  function axisFindNode(root, nid) {
    return root.querySelector('.xp-axis-node[data-nid="' + CSS.escape(nid) + '"]');
  }

  function axisDirectChildren(containerNode) {
    const wrap = containerNode.querySelector(":scope > .xp-axis-children");
    if (!wrap) return [];
    return Array.from(wrap.children).filter((c) => c.classList.contains("xp-axis-node"));
  }

  function axisParent(containerNode) {
    const wrap = containerNode.parentElement; // .xp-axis-children or the tree root wrapper
    if (!wrap || !wrap.classList.contains("xp-axis-children")) return null;
    return wrap.closest(".xp-axis-node");
  }

  function computeAxis(selectedNode, axis) {
    switch (axis) {
      case "self":
        return [selectedNode];
      case "parent": {
        const p = axisParent(selectedNode);
        return p ? [p] : [];
      }
      case "child":
        return axisDirectChildren(selectedNode);
      case "ancestor": {
        const out = [];
        let p = axisParent(selectedNode);
        while (p) {
          out.push(p);
          p = axisParent(p);
        }
        return out;
      }
      case "descendant": {
        const wrap = selectedNode.querySelector(":scope > .xp-axis-children");
        return wrap ? Array.from(wrap.querySelectorAll(".xp-axis-node")) : [];
      }
      case "following-sibling":
      case "preceding-sibling": {
        const p = axisParent(selectedNode);
        if (!p) return []; // root node has no parent, so no siblings
        const siblings = axisDirectChildren(p);
        const idx = siblings.indexOf(selectedNode);
        if (idx === -1) return [];
        return axis === "following-sibling" ? siblings.slice(idx + 1) : siblings.slice(0, idx);
      }
      default:
        return [];
    }
  }

  function axisTagOf(node) {
    const label = node.querySelector(".xp-axis-tag");
    const m = label ? label.textContent.match(/^<([a-z0-9]+)/i) : null;
    return m ? m[1] : "*";
  }

  function mountAxisNavigator(host) {
    host.innerHTML = "";
    const wrap = el("div", { className: "xp-axis-widget" });

    wrap.appendChild(el("p", { className: "muted" }, "1. Click a node in the tree below to select it (starts on <strong>Add to cart</strong>). 2. Click an axis button. Matching nodes get a highlight, and the equivalent XPath is shown underneath."));

    const btnRow = el("div", { className: "xp-axis-buttons" });
    Object.keys(AXIS_INFO).forEach((axis) => {
      const b = el("button", { type: "button", className: "chip xp-axis-btn", "data-axis": axis, text: AXIS_INFO[axis].label });
      btnRow.appendChild(b);
    });
    wrap.appendChild(btnRow);

    const out = el("div", { className: "xp-axis-output", id: "xp-axis-output" });
    wrap.appendChild(out);

    const treeHost = el("div", { className: "xp-axis-stage cardish" });
    treeHost.appendChild(el("h4", { text: "Mini product card (click any tag)" }));
    treeHost.innerHTML += '<div class="xp-axis-tree">' + renderAxisNode(AXIS_TREE, 0) + "</div>";
    wrap.appendChild(treeHost);

    const treeRoot = treeHost.querySelector(".xp-axis-tree");
    let selectedNid = "addBtn";
    let activeAxis = null;

    function clearMarks() {
      treeRoot.querySelectorAll(".xp-axis-node").forEach((n) => n.classList.remove("xp-axis-selected", "xp-axis-hit"));
    }

    function paint() {
      clearMarks();
      const selNode = axisFindNode(treeRoot, selectedNid);
      if (!selNode) return;
      selNode.classList.add("xp-axis-selected");
      btnRow.querySelectorAll(".xp-axis-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.axis === activeAxis));

      if (!activeAxis) {
        out.innerHTML = '<p class="muted">Pick an axis above to see the result.</p>';
        return;
      }
      const hits = computeAxis(selNode, activeAxis).filter((n) => n !== selNode || activeAxis === "self");
      hits.forEach((n) => n.classList.add("xp-axis-hit"));

      const selData = findInTree(AXIS_TREE, selectedNid);
      const tags = [...new Set(hits.map(axisTagOf))];
      const xpr = activeAxis === "self" ? selData.xp : selData.xp + "/" + activeAxis + "::" + (tags.length === 1 ? tags[0] : "*");

      out.innerHTML =
        '<div class="xp-axis-desc"><strong>' + AXIS_INFO[activeAxis].label + ":</strong> " + AXIS_INFO[activeAxis].desc + "</div>" +
        '<div class="xp-axis-count">' + hits.length + (hits.length === 1 ? " node" : " nodes") + " highlighted below (in pink).</div>" +
        '<code class="xp-axis-expr">' + escapeHtml(xpr) + "</code>";
    }

    function findInTree(node, nid) {
      if (node.nid === nid) return node;
      for (const c of node.children) {
        const r = findInTree(c, nid);
        if (r) return r;
      }
      return null;
    }

    treeRoot.addEventListener("click", (e) => {
      const t = e.target.closest("[data-select]");
      if (!t) return;
      selectedNid = t.dataset.select;
      paint();
    });
    treeRoot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const t = e.target.closest("[data-select]");
      if (!t) return;
      e.preventDefault();
      selectedNid = t.dataset.select;
      paint();
    });
    btnRow.addEventListener("click", (e) => {
      const b = e.target.closest(".xp-axis-btn");
      if (!b) return;
      activeAxis = b.dataset.axis;
      paint();
    });

    host.appendChild(wrap);
    paint();
  }

  /* ---------------- Iframe demo: prove XPath doesn't cross frame boundaries ---------------- */

  function mountIframeDemo(host) {
    host.innerHTML = "";
    const wrap = el("div", { className: "xp-iframe-demo" });

    wrap.appendChild(el("p", { className: "muted" }, "The box below is a real &lt;iframe&gt; with its own document containing a Pay button. Try both searches and compare."));

    const iframe = el("iframe", {
      className: "xp-demo-iframe",
      title: "Payment widget demo",
      srcdoc: '<body style="font-family:sans-serif;margin:0;padding:16px;background:#0e1420;color:#e8eaf0"><p style="margin:0 0 10px">Payment widget (separate document)</p><button id="pay" style="padding:8px 16px;border-radius:8px;border:0;background:#22c55e;color:#08130a;font-weight:600;cursor:pointer">Pay now</button></body>'
    });

    const btnRow = el("div", { className: "xp-tester-row" });
    const mainBtn = el("button", { type: "button", className: "iconbtn", text: "Search main document" });
    const frameBtn = el("button", { type: "button", className: "iconbtn primary-btn", text: "Search inside the iframe" });
    btnRow.append(mainBtn, frameBtn);

    const status = el("div", { className: "xp-status", "aria-live": "polite" });

    wrap.appendChild(el("code", { className: "xp-axis-expr", style: "display:inline-block;margin-bottom:10px" }, "//button[@id='pay']"));
    wrap.appendChild(btnRow);
    wrap.appendChild(status);
    wrap.appendChild(iframe);

    function runAgainst(doc, label) {
      try {
        const result = doc.evaluate("//button[@id='pay']", doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (result.snapshotLength === 0) {
          status.className = "xp-status xp-warn";
          status.innerHTML = "✕ 0 matches searching the <strong>" + label + "</strong> — the Pay button lives in a different document.";
        } else {
          status.className = "xp-status xp-ok";
          status.innerHTML = "✓ " + result.snapshotLength + " match found searching the <strong>" + label + "</strong>: " + escapeHtml(describeMatch(result.snapshotItem(0)));
        }
      } catch (e) {
        status.className = "xp-status xp-err";
        status.textContent = "Error: " + (e.message || e);
      }
    }

    mainBtn.addEventListener("click", () => runAgainst(document, "main page document"));
    frameBtn.addEventListener("click", () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        status.className = "xp-status xp-err";
        status.textContent = "Iframe not ready yet — try again.";
        return;
      }
      runAgainst(doc, "iframe's own document");
    });

    host.appendChild(wrap);
  }

  window.XPathWidgets = {
    mountTester,
    mountChallengeCards,
    mountAxisNavigator,
    mountIframeDemo,
    evaluateXPath,
    normalizeXPath
  };
})();
