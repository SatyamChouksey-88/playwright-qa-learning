/* Live widgets for Mistakes / Tabs / Clipboard practice cards */
(function () {
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function status(box, msg, ok) {
    let s = box.querySelector(".pw-status");
    if (!s) {
      s = document.createElement("p");
      s.className = "pw-status";
      box.appendChild(s);
    }
    s.textContent = msg;
    s.classList.toggle("ok", !!ok);
    s.classList.toggle("bad", ok === false);
  }

  const builders = {
    "sk-sleep"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Click <strong>Load chart</strong>. The chart appears after ~1.2s — in Playwright you’d assert visibility, not sleep.</p>
        <button type="button" class="pw-btn" data-load>Load chart</button>
        <div data-testid="chart" class="sk-chart" hidden>Revenue ▲ 42%</div>
        <div class="sk-choice">
          <p><strong>Which wait would you write?</strong></p>
          <button type="button" class="chip" data-pick="bad">await page.waitForTimeout(3000)</button>
          <button type="button" class="chip" data-pick="good">await expect(page.getByTestId('chart')).toBeVisible()</button>
        </div>
      </div>`));
      const chart = host.querySelector("[data-testid='chart']");
      host.querySelector("[data-load]").onclick = () => {
        chart.hidden = true;
        status(host, "Loading… (imagine a sleep here would waste time)", null);
        setTimeout(() => {
          chart.hidden = false;
          status(host, "Chart visible — assert this state in Playwright", true);
        }, 1200);
      };
      host.querySelectorAll("[data-pick]").forEach((b) => {
        b.onclick = () => {
          const good = b.dataset.pick === "good";
          status(host, good ? "Correct — web-first assert retries until ready" : "Wrong — sleep is time-based hope, not readiness", good);
        };
      });
    },

    "sk-overlay"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice sk-overlay-stage">
        <p class="pw-hint">Save is covered. Wait for the overlay to hide (or click Dismiss), then Save.</p>
        <div class="sk-save-wrap">
          <button type="button" class="pw-btn" data-save>Save</button>
          <div data-testid="loading-overlay" class="sk-overlay">Loading… <button type="button" class="pw-btn ghost" data-dismiss>Dismiss</button></div>
        </div>
        <div role="status" class="sk-status-line" hidden>Saved</div>
        <button type="button" class="chip" data-force>Try { force: true } (bad habit)</button>
        <button type="button" class="chip" data-reset>Reset overlay</button>
      </div>`));
      const overlay = host.querySelector("[data-testid='loading-overlay']");
      const st = host.querySelector(".sk-status-line");
      const save = host.querySelector("[data-save]");
      let forced = false;
      host.querySelector("[data-dismiss]").onclick = () => {
        overlay.hidden = true;
        status(host, "Overlay hidden — now Save is actionable", true);
      };
      save.onclick = () => {
        if (!overlay.hidden && !forced) {
          status(host, "Click intercepted by overlay — same as Playwright actionability failure", false);
          return;
        }
        st.hidden = false;
        status(host, forced ? "Forced click “worked” but hid a real UX bug" : "Saved cleanly after overlay gone", !forced);
        forced = false;
      };
      host.querySelector("[data-force]").onclick = () => {
        forced = true;
        status(host, "force armed — click Save (this is the anti-pattern)", false);
      };
      host.querySelector("[data-reset]").onclick = () => {
        overlay.hidden = false;
        st.hidden = true;
        forced = false;
        status(host, "Overlay back", true);
      };
    },

    "sk-oneshot"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Toast appears after 800ms. One-shot isVisible checked too early = flake.</p>
        <button type="button" class="pw-btn" data-pay>Pay now</button>
        <div role="status" class="sk-toast" hidden>Payment complete</div>
        <div class="sk-choice">
          <button type="button" class="chip" data-sim="bad">Simulate one-shot check @ 0ms</button>
          <button type="button" class="chip" data-sim="good">Simulate retrying expect</button>
        </div>
      </div>`));
      const toast = host.querySelector(".sk-toast");
      let visibleAt = 0;
      host.querySelector("[data-pay]").onclick = () => {
        toast.hidden = true;
        visibleAt = Date.now() + 800;
        status(host, "Payment processing…", null);
        setTimeout(() => {
          toast.hidden = false;
          status(host, "Toast visible", true);
        }, 800);
      };
      host.querySelector('[data-sim="bad"]').onclick = () => {
        const ok = !toast.hidden;
        status(host, ok ? "Lucky — toast already there" : "FAIL — one-shot saw hidden toast (classic flake)", ok);
      };
      host.querySelector('[data-sim="good"]').onclick = () => {
        const tryOnce = () => {
          if (!toast.hidden) {
            status(host, "PASS — retrying assert eventually saw the toast", true);
            return;
          }
          if (Date.now() > visibleAt + 2000) {
            status(host, "Timed out", false);
            return;
          }
          setTimeout(tryOnce, 100);
        };
        status(host, "Retrying like expect().toBeVisible()…", null);
        tryOnce();
      };
    },

    "sk-strict"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Two Save buttons. Prefer scoping to the dialog.</p>
        <button type="button" class="pw-btn ghost" data-toolbar-save>Save</button>
        <div role="dialog" aria-label="Edit profile" class="sk-dialog">
          <h4>Edit profile</h4>
          <button type="button" class="pw-btn" data-dialog-save>Save</button>
        </div>
        <div class="sk-choice">
          <button type="button" class="chip" data-pick="first">page.getByRole('button', { name: 'Save' }).first()</button>
          <button type="button" class="chip" data-pick="scope">page.getByRole('dialog').getByRole('button', { name: 'Save' })</button>
        </div>
      </div>`));
      host.querySelector("[data-toolbar-save]").onclick = () => status(host, "Toolbar Save — wrong target for this challenge", false);
      host.querySelector("[data-dialog-save]").onclick = () => status(host, "Dialog Save — correct target", true);
      host.querySelectorAll("[data-pick]").forEach((b) => {
        b.onclick = () => {
          const good = b.dataset.pick === "scope";
          status(host, good ? "Correct — scope beats .first()" : "Risky — .first() may click the toolbar Save", good);
        };
      });
    },

    "sk-response"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Order the steps, then click Load data.</p>
        <ol class="sk-order" data-order>
          <li draggable="true" data-step="1">Create waitForResponse promise <em>(no await yet)</em></li>
          <li draggable="true" data-step="2">Click Load data</li>
          <li draggable="true" data-step="3">Await the response promise</li>
        </ol>
        <button type="button" class="pw-btn" data-load>Load data</button>
        <div data-testid="stats" class="sk-chart" hidden>Users online: 42</div>
        <button type="button" class="chip" data-check>Check my order</button>
      </div>`));
      const list = host.querySelector("[data-order]");
      let drag = null;
      list.querySelectorAll("[data-step]").forEach((li) => {
        li.addEventListener("dragstart", () => { drag = li; });
        li.addEventListener("dragover", (e) => e.preventDefault());
        li.addEventListener("drop", (e) => {
          e.preventDefault();
          if (drag && drag !== li) {
            const kids = [...list.children];
            const from = kids.indexOf(drag);
            const to = kids.indexOf(li);
            if (from < to) li.after(drag);
            else li.before(drag);
          }
        });
      });
      host.querySelector("[data-check]").onclick = () => {
        const order = [...list.querySelectorAll("[data-step]")].map((n) => n.dataset.step).join("");
        const ok = order === "123";
        status(host, ok ? "Correct order: register → click → await" : "Reorder to: register → click → await", ok);
      };
      host.querySelector("[data-load]").onclick = () => {
        const stats = host.querySelector("[data-testid='stats']");
        stats.hidden = true;
        setTimeout(() => {
          stats.hidden = false;
          status(host, "Response arrived — in PW you’d awaited waitForResponse already", true);
        }, 400);
      };
    },

    "sk-pickfix"(host) {
      const items = [
        {
          q: "Chart loads asynchronously after click",
          bad: "waitForTimeout(2000)",
          good: "expect(chart).toBeVisible()",
        },
        {
          q: "CI flakes you can’t reproduce",
          bad: "retries: 5 and move on",
          good: "trace on-first-retry + --repeat-each",
        },
        {
          q: "Login needed for 40 tests",
          bad: "UI login in every test",
          good: "storageState + API seed",
        },
        {
          q: "Button covered by spinner",
          bad: "click({ force: true })",
          good: "expect(overlay).toBeHidden() then click",
        },
      ];
      let i = 0;
      let score = 0;
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint" data-q></p>
        <div class="sk-choice">
          <button type="button" class="chip" data-ans="bad"></button>
          <button type="button" class="chip" data-ans="good"></button>
        </div>
        <p class="muted" data-score>Score: 0 / 0</p>
        <button type="button" class="pw-btn ghost" data-next hidden>Next</button>
      </div>`));
      const qEl = host.querySelector("[data-q]");
      const badB = host.querySelector('[data-ans="bad"]');
      const goodB = host.querySelector('[data-ans="good"]');
      const scoreEl = host.querySelector("[data-score]");
      const next = host.querySelector("[data-next]");
      function paint() {
        const it = items[i];
        qEl.innerHTML = `<strong>${i + 1}/${items.length}.</strong> ${it.q} — pick the better fix:`;
        // shuffle button labels sides
        if (Math.random() > 0.5) {
          badB.textContent = it.bad;
          goodB.textContent = it.good;
          badB.dataset.ans = "bad";
          goodB.dataset.ans = "good";
        } else {
          badB.textContent = it.good;
          goodB.textContent = it.bad;
          badB.dataset.ans = "good";
          goodB.dataset.ans = "bad";
        }
        next.hidden = true;
        status(host, "", null);
      }
      function answered(ok) {
        if (ok) score++;
        scoreEl.textContent = `Score: ${score} / ${i + 1}`;
        status(host, ok ? "Good instinct" : "That’s the anti-pattern — flip it", ok);
        next.hidden = false;
      }
      badB.onclick = () => answered(badB.dataset.ans === "good");
      goodB.onclick = () => answered(goodB.dataset.ans === "good");
      next.onclick = () => {
        i++;
        if (i >= items.length) {
          status(host, `Done — ${score}/${items.length}. Re-open solution for the recipes.`, score === items.length);
          next.hidden = true;
          return;
        }
        paint();
      };
      paint();
    },

    "sk-popup"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Main page + popup simulation (same idea as waitForEvent('popup')).</p>
        <a href="#" data-open>Open docs</a>
        <p data-main-flag hidden class="sk-ok">Docs opened</p>
        <div class="sk-popup-panel" hidden>
          <strong>Docs popup</strong>
          <p>Accept terms to continue.</p>
          <button type="button" class="pw-btn" data-accept>Accept</button>
          <button type="button" class="pw-btn ghost" data-close>Close</button>
        </div>
      </div>`));
      const panel = host.querySelector(".sk-popup-panel");
      const flag = host.querySelector("[data-main-flag]");
      host.querySelector("[data-open]").onclick = (e) => {
        e.preventDefault();
        panel.hidden = false;
        status(host, "Popup open — in PW this is a new Page from waitForEvent('popup')", true);
      };
      host.querySelector("[data-accept]").onclick = () => {
        flag.hidden = false;
        status(host, "Accepted — bringToFront() main page and assert “Docs opened”", true);
      };
      host.querySelector("[data-close]").onclick = () => {
        panel.hidden = true;
        status(host, "Popup closed", true);
      };
    },

    "sk-tabs"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Two tabs in one context. Switch with the tab buttons (like bringToFront).</p>
        <div class="sk-tabbar">
          <button type="button" class="chip is-active" data-tab="a">Tab A — Home</button>
          <button type="button" class="chip" data-tab="b">Tab B — Admin</button>
          <button type="button" class="pw-btn ghost" data-spawn>Open Tab B</button>
        </div>
        <div data-panel="a" class="sk-tab-panel">
          <h4>Home</h4>
          <button type="button" class="pw-btn" data-refresh>Refresh</button>
          <p data-home-msg class="muted">Ready</p>
        </div>
        <div data-panel="b" class="sk-tab-panel" hidden>
          <h4>Admin</h4>
          <label>Note <input data-note placeholder="type here" /></label>
          <p class="muted">Shared context = cookies shared (like real Playwright tabs).</p>
        </div>
      </div>`));
      const show = (id) => {
        host.querySelectorAll(".sk-tab-panel").forEach((p) => {
          p.hidden = p.dataset.panel !== id;
        });
        host.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === id));
        status(host, `Active: Tab ${id.toUpperCase()} (bringToFront equivalent)`, true);
      };
      host.querySelectorAll("[data-tab]").forEach((b) => {
        b.onclick = () => show(b.dataset.tab);
      });
      host.querySelector("[data-spawn]").onclick = () => show("b");
      host.querySelector("[data-refresh]").onclick = () => {
        host.querySelector("[data-home-msg]").textContent = "Refreshed at " + new Date().toLocaleTimeString();
        status(host, "Home refreshed while Tab B may still be open", true);
      };
    },

    "sk-dialog-vs-popup"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Three different “popups” — three APIs.</p>
        <div class="pw-row">
          <button type="button" class="pw-btn" data-native>Native confirm()</button>
          <button type="button" class="pw-btn" data-modal>HTML modal</button>
          <button type="button" class="pw-btn" data-win>Window popup</button>
        </div>
        <div role="dialog" class="sk-dialog" hidden data-html-modal>
          <p>HTML modal — use getByRole('dialog')</p>
          <button type="button" class="pw-btn" data-ok>OK</button>
        </div>
        <div class="sk-choice">
          <span class="muted">Match the API:</span>
          <button type="button" class="chip" data-match="native">page.on('dialog')</button>
          <button type="button" class="chip" data-match="modal">getByRole('dialog')</button>
          <button type="button" class="chip" data-match="win">waitForEvent('popup')</button>
        </div>
      </div>`));
      let last = "";
      host.querySelector("[data-native]").onclick = () => {
        const ok = window.confirm("Delete this item?");
        last = "native";
        status(host, ok ? "Accepted native dialog → page.on('dialog')" : "Dismissed native dialog", true);
      };
      host.querySelector("[data-modal]").onclick = () => {
        host.querySelector("[data-html-modal]").hidden = false;
        last = "modal";
        status(host, "HTML modal open → getByRole('dialog')", true);
      };
      host.querySelector("[data-ok]").onclick = () => {
        host.querySelector("[data-html-modal]").hidden = true;
        status(host, "Modal closed", true);
      };
      host.querySelector("[data-win]").onclick = () => {
        last = "win";
        const w = window.open("", "skdocs", "width=360,height=200");
        if (w) {
          w.document.write("<p style='font-family:sans-serif;padding:16px'>Popup Page — waitForEvent('popup')</p>");
          status(host, "Window opened → waitForEvent('popup') / new Page", true);
        } else {
          status(host, "Popup blocked by browser — allow popups for this practice", false);
        }
      };
      host.querySelectorAll("[data-match]").forEach((b) => {
        b.onclick = () => {
          const ok = b.dataset.match === last;
          status(host, ok ? "Matched the right API for the last trigger" : "Trigger one of the three buttons first, then match", ok);
        };
      });
    },

    "sk-clip-copy"(host) {
      const code = "INVITE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Copy the code, paste into the field, Apply.</p>
        <div class="pw-row">
          <code data-testid="invite-code">${code}</code>
          <button type="button" class="pw-btn" data-copy>Copy code</button>
        </div>
        <label>Paste invite code <input aria-label="Paste invite code" data-paste /></label>
        <button type="button" class="pw-btn" data-apply>Apply</button>
        <div role="status" hidden data-ok>Invite accepted</div>
      </div>`));
      let clip = "";
      host.querySelector("[data-copy]").onclick = async () => {
        clip = code;
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          /* fallback to in-memory for file:// */
        }
        status(host, "Copied to clipboard (and local fallback)", true);
      };
      host.querySelector("[data-apply]").onclick = async () => {
        const input = host.querySelector("[data-paste]");
        let val = input.value.trim();
        if (!val) {
          try {
            val = (await navigator.clipboard.readText()) || clip;
            input.value = val;
          } catch {
            val = clip;
            input.value = val;
          }
        }
        const ok = val === code;
        host.querySelector("[data-ok]").hidden = !ok;
        status(host, ok ? "Invite accepted" : "Code mismatch — copy then paste", ok);
      };
      // Ctrl/Meta+V into input uses real clipboard when permitted
      host.querySelector("[data-paste]").addEventListener("paste", () => {
        setTimeout(() => status(host, "Paste event received", true), 0);
      });
    },

    "sk-clip-seed"(host) {
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">Seed clipboard, focus editor, paste (Ctrl/Cmd+V).</p>
        <button type="button" class="pw-btn" data-seed>Seed clipboard with “Hello from clipboard”</button>
        <div contenteditable="true" class="sk-editor" role="textbox" aria-label="Editor" data-editor>Focus me, then paste…</div>
      </div>`));
      host.querySelector("[data-seed]").onclick = async () => {
        const text = "Hello from clipboard";
        try {
          await navigator.clipboard.writeText(text);
          status(host, "navigator.clipboard.writeText OK — now paste into the editor", true);
        } catch {
          host._seedFallback = text;
          status(host, "Clipboard API blocked on this origin — click editor then use Insert fallback", false);
        }
      };
      const editor = host.querySelector("[data-editor]");
      editor.addEventListener("paste", (e) => {
        // allow default; then check
        setTimeout(() => {
          const ok = editor.textContent.includes("Hello from clipboard");
          status(host, ok ? "Paste landed in contenteditable" : "Paste empty — try Seed again", ok);
        }, 0);
      });
      editor.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && host._seedFallback) {
          e.preventDefault();
          editor.textContent = host._seedFallback;
          status(host, "Inserted via fallback seed", true);
        }
      });
    },

    "sk-clip-read"(host) {
      const url = "https://app.example.com/share/" + Math.random().toString(36).slice(2, 7);
      host.appendChild(el(`<div class="pw-app sk-practice">
        <p class="pw-hint">App copies a share link — assert clipboard contents.</p>
        <button type="button" class="pw-btn" data-copy>Copy link</button>
        <button type="button" class="chip" data-read>Read clipboard (assert)</button>
        <p class="muted" data-out></p>
      </div>`));
      host.querySelector("[data-copy]").onclick = async () => {
        try {
          await navigator.clipboard.writeText(url);
          host._clip = url;
          status(host, "Link copied by the app", true);
        } catch {
          host._clip = url;
          status(host, "Stored share URL (clipboard API unavailable)", true);
        }
      };
      host.querySelector("[data-read]").onclick = async () => {
        let clip = host._clip || "";
        try {
          clip = (await navigator.clipboard.readText()) || clip;
        } catch { /* use fallback */ }
        const ok = clip.includes("https://app.example.com/share/");
        host.querySelector("[data-out]").textContent = clip || "(empty)";
        status(host, ok ? "Assert passed — URL on clipboard" : "Copy link first", ok);
      };
    },
  };

  function mount(root) {
    if (!root) return;
    root.querySelectorAll("[data-widget]").forEach((node) => {
      const id = node.dataset.widget;
      node.innerHTML = "";
      const fn = builders[id];
      if (fn) fn(node);
      else node.innerHTML = `<div class="pw-app"><p class="pw-hint">Demo missing for ${id}</p></div>`;
    });
  }

  // Also register onto PracticeWidgets.builders if present
  if (window.PracticeWidgets?.builders) {
    Object.assign(window.PracticeWidgets.builders, builders);
  }

  window.SkillsPracticeWidgets = { mount, builders };
})();
