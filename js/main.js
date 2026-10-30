/*
 * BG3 Honour Mode Cheat Sheet — progress tracking.
 *
 * Patterned after the Dark Souls 2 cheat sheets (smcnabb / xenevel):
 * any element with a data-id attribute becomes a checkbox, progress is
 * stored per profile, and section totals update as you tick things off.
 *
 * Storage layout (localStorage key below):
 * {
 *   current: "Default Profile",
 *   profiles: { "<name>": { checklistData: { "<data-id>": true }, collapsed: { "<section-id>": true }, tab: "#tabPlaythrough" } },
 *   settings: { hideCompleted: false, theme: "auto", gearShow: "all" }
 * }
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'bg3hm-bard-field-manual';
  var DEFAULT_PROFILE = 'Default Profile';
  var EXPORT_FORMAT = 'bg3hm-bard-field-manual/profile@1';

  // ------------------------------------------------------------ storage
  function blankProfile() {
    return { checklistData: {}, collapsed: {}, tab: '#tabPlaythrough' };
  }

  function loadState() {
    var s = null;
    try { s = JSON.parse(window.localStorage.getItem(STORAGE_KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object' || !s.profiles || typeof s.profiles !== 'object') {
      s = { current: DEFAULT_PROFILE, profiles: {}, settings: {} };
    }
    if (!Object.keys(s.profiles).length) s.profiles[DEFAULT_PROFILE] = blankProfile();
    if (!s.profiles[s.current]) s.current = Object.keys(s.profiles)[0];
    Object.keys(s.profiles).forEach(function (k) {
      var p = s.profiles[k];
      if (!p.checklistData) p.checklistData = {};
      if (!p.collapsed) p.collapsed = {};
    });
    if (!s.settings) s.settings = {};
    return s;
  }

  var state = loadState();
  var storageOk = true;

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (storageOk) {
        storageOk = false;
        var w = document.getElementById('storageWarning');
        if (w) w.classList.remove('d-none');
      }
    }
  }

  function profile() { return state.profiles[state.current]; }

  // ------------------------------------------------------------ helpers
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function trackedInputs(root) { return $$('input[data-track]', root); }

  function itemFor(input) { return document.querySelector('[data-id="' + input.getAttribute('data-track') + '"]'); }

  // ------------------------------------------------------------ gear wiki links
  // Cells with class="gear-link" hold gear-table text that may name one or more
  // specific items (e.g. "Ring of Protection", or compound text like "Everburn
  // Blade or Sussur greatsword"). GEAR_WIKI maps the exact substring as it
  // appears on this page to the bg3.wiki slug for that item, so we can wrap
  // just the recognised item name(s) in a link and leave the rest of the
  // cell's text (alternatives, footnotes, parenthetical notes) alone.
  var GEAR_WIKI = {
    'Everburn Blade': 'Everburn_Blade',
    'Amulet of Misty Step': 'Amulet_of_Misty_Step',
    'Ring of Protection': 'Ring_of_Protection',
    'Phalar Aluve': 'Phalar_Aluve',
    'Sussur greatsword': 'Sussur_Greatsword',
    'Knife of the Undermountain King': 'Knife_of_the_Undermountain_King',
    "Melf's First Staff": "Melf's_First_Staff",
    'Staff of Arcane Blessing': 'Staff_of_Arcane_Blessing',
    'Titanstring Bow': 'Titanstring_Bow',
    'Club of Hill Giant Strength': 'Club_of_Hill_Giant_Strength',
    'Adamantine Splint Armour': 'Adamantine_Splint_Armour',
    'Adamantine Scale Mail': 'Adamantine_Scale_Mail',
    'The Graceful Cloth': 'The_Graceful_Cloth',
    'Haste Helm': 'Haste_Helm',
    'Gloves of the Growling Underdog': 'Gloves_of_the_Growling_Underdog',
    'Gloves of Archery': 'Gloves_of_Archery',
    'Daredevil Gloves': 'Daredevil_Gloves',
    'Linebreaker Boots': 'Linebreaker_Boots',
    'Boots of Genial Striding': 'Boots_of_Genial_Striding',
    'Disintegrating Night Walkers': 'Disintegrating_Night_Walkers',
    'Boots of Speed': 'Boots_of_Speed',
    "Broodmother's Revenge": "Broodmother's_Revenge",
    'Necklace of Elemental Augmentation': 'Necklace_of_Elemental_Augmentation',
    "Crusher's Ring": "Crusher's_Ring",
    'Strange Conduit Ring': 'Strange_Conduit_Ring',
    "Mage's Friend": "Mage's_Friend",
    'Caustic Band': 'Caustic_Band',
    'Bracing Band': 'Bracing_Band',
    'Fetish of Callarduran Smoothhands': 'Fetish_of_Callarduran_Smoothhands',
    "Sunwalker's Gift": "Sunwalker's_Gift",
    'Incandescent Staff': 'Incandescent_Staff',
    'Darkfire Shortbow': 'Darkfire_Shortbow',
    'Flawed Helldusk Helmet': 'Flawed_Helldusk_Helmet',
    'Hat of Fire Acuity': 'Hat_of_Fire_Acuity',
    'Cloak of Protection': 'Cloak_of_Protection',
    'Fleshmelter Cloak': 'Fleshmelter_Cloak',
    'Gloves of Dexterity': 'Gloves_of_Dexterity',
    'Flawed Helldusk Gloves': 'Flawed_Helldusk_Gloves',
    'Risky Ring': 'Risky_Ring',
    'Halberd of Vigilance': 'Halberd_of_Vigilance',
    'Rhapsody': 'Rhapsody',
    "Ketheric's Shield": "Ketheric's_Shield",
    // Plain "Dark Justiciar Half-Plate"/"Gauntlets" are disambiguation pages
    // (two rarity variants each) — these are the pieces found in the
    // Gauntlet of Shar, matching the "Where to get it" note below.
    'Dark Justiciar Half-Plate': 'Dark_Justiciar_Half-Plate_(Rare)',
    'Helmet of Arcane Acuity': 'Helmet_of_Arcane_Acuity',
    'Marksmanship Hat': 'Marksmanship_Hat',
    'Dark Justiciar Gauntlets': 'Dark_Justiciar_Gauntlets_(Uncommon)',
    'Evasive Shoes': 'Evasive_Shoes',
    "Surgeon's Subjugation Amulet": "Surgeon's_Subjugation_Amulet",
    "Killer's Sweetheart": "Killer's_Sweetheart",
    'Shadow-Cloaked Ring': 'Shadow-Cloaked_Ring',
    'The Dead Shot': 'The_Dead_Shot',
    'Bhaalist Armour': 'Bhaalist_Armour',
    'Horns of the Berserker': 'Horns_of_the_Berserker',
    'Hood of the Weave': 'Hood_of_the_Weave',
    'Cloak of the Weave': 'Cloak_of_the_Weave',
    'Legacy of the Masters': 'Legacy_of_the_Masters',
    'Moondrop Pendant': 'Moondrop_Pendant',
    'Band of the Mystic Scoundrel': 'Band_of_the_Mystic_Scoundrel',
    "Larethian's Wrath": "Larethian's_Wrath",
    "Duellist's Prerogative": "Duellist's_Prerogative",
    "Balduran's Giantslayer": "Balduran's_Giantslayer",
    'Staff of Spellpower': 'Staff_of_Spellpower',
    'Nyrulna': 'Nyrulna',
    'Helm of Balduran': 'Helm_of_Balduran',
    'Mask of Soul Perception': 'Mask_of_Soul_Perception',
    'Robe of the Weave': 'Robe_of_the_Weave',
    'Gauntlets of Hill Giant Strength': 'Gauntlets_of_Hill_Giant_Strength',
    'Helldusk Boots': 'Helldusk_Boots'
  };

  // Longest match first, so e.g. "Ring of Protection" is matched whole rather
  // than any shorter name that happened to be a substring of it.
  var GEAR_NAMES = Object.keys(GEAR_WIKI).sort(function (a, b) { return b.length - a.length; });

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  var GEAR_PATTERN = new RegExp('(' + GEAR_NAMES.map(escapeRegExp).join('|') + ')', 'g');

  // Must run after addCheckboxes(), which wraps each [data-id] cell's text in
  // .item-content (inside a checkbox <label>). We rewrite that inner span,
  // not the <td> itself — overwriting the <td> would destroy the checkbox
  // addCheckboxes just built.
  function initGearLinks() {
    $$('.gear-link .item-content').forEach(function (span) {
      var text = span.textContent;
      if (!GEAR_PATTERN.test(text)) return;
      GEAR_PATTERN.lastIndex = 0;
      span.innerHTML = text.replace(GEAR_PATTERN, function (name) {
        return '<a class="gear-wiki-link" href="https://bg3.wiki/wiki/' + GEAR_WIKI[name] +
          '" target="_blank" rel="noopener">' + name + '</a>';
      });
      // Clicking the link shouldn't also toggle the checkbox — the link is a
      // descendant of the <label for="...">, and a click on it would
      // otherwise bubble up and fire the label's default action too.
      $$('a.gear-wiki-link', span).forEach(function (a) {
        a.addEventListener('click', function (e) { e.stopPropagation(); });
      });
    });
  }

  // ------------------------------------------------------------ checkboxes
  // Turn every [data-id] element into a labelled checkbox, as the DS2 sheets do.
  function addCheckboxes() {
    $$('[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      var target = el.tagName === 'TR' ? el.cells[0] : el;
      if (el.tagName === 'LI' && !el.id) el.id = id; // lets #a1-grove-3 style links work
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'form-check-input';
      input.id = 'cb-' + id;
      input.setAttribute('data-track', id);
      var label = document.createElement('label');
      label.className = 'check';
      label.htmlFor = input.id;
      var content = document.createElement('span');
      content.className = 'item-content';
      while (target.firstChild) content.appendChild(target.firstChild);
      var row = document.createElement('div');
      row.className = 'check-row';
      label.appendChild(content);
      row.appendChild(input);
      row.appendChild(label);
      target.appendChild(row);
    });
  }

  function applyChecklist() {
    var data = profile().checklistData;
    trackedInputs().forEach(function (input) {
      var on = data[input.getAttribute('data-track')] === true;
      input.checked = on;
      var item = itemFor(input);
      if (item) item.classList.toggle('completed', on);
    });
    updateTotals();
  }

  function setChecked(input, on) {
    var id = input.getAttribute('data-track');
    input.checked = on;
    if (on) profile().checklistData[id] = true; else delete profile().checklistData[id];
    var item = itemFor(input);
    if (item) item.classList.toggle('completed', on);
  }

  // ------------------------------------------------------------ totals
  function updateTotals() {
    $$('[data-section]').forEach(function (sec) {
      var id = sec.getAttribute('data-section');
      var inputs = trackedInputs(sec);
      var done = inputs.filter(function (i) { return i.checked; }).length;
      $$('[data-total="' + id + '"]').forEach(function (span) {
        if (!inputs.length) { span.textContent = ''; return; }
        var complete = done === inputs.length;
        span.textContent = complete ? 'Done' : done + '/' + inputs.length;
        span.classList.toggle('done', complete);
        span.classList.toggle('in-progress', !complete);
      });
    });
    var all = trackedInputs($('#tabPlaythrough'));
    var n = all.filter(function (i) { return i.checked; }).length;
    var pct = all.length ? Math.round((n / all.length) * 100) : 0;
    var bar = $('#overallBar');
    if (bar) {
      bar.setAttribute('aria-valuenow', String(pct));
      bar.firstElementChild.style.width = pct + '%';
    }
    var txt = $('#overallText');
    if (txt) txt.textContent = n + ' / ' + all.length + ' steps (' + pct + '%)';
  }

  // ------------------------------------------------------------ profiles
  function populateProfiles() {
    var sel = $('#profiles');
    sel.innerHTML = '';
    Object.keys(state.profiles).forEach(function (name) {
      var o = document.createElement('option');
      o.value = name;
      o.textContent = name;
      sel.appendChild(o);
    });
    sel.value = state.current;
  }

  function switchProfile(name) {
    state.current = name;
    save();
    populateProfiles();
    applyChecklist();
    applyCollapsed();
  }

  function uniqueName(base) {
    var name = base, i = 2;
    while (state.profiles[name]) name = base + ' (' + i++ + ')';
    return name;
  }

  var profileMode = 'add';
  function openProfileModal(mode) {
    profileMode = mode;
    $('#profileModalTitle').textContent = mode === 'add' ? 'Add profile' : 'Rename or delete profile';
    $('#profileModalName').value = mode === 'add' ? '' : state.current;
    $('#profileModalDelete').classList.toggle('d-none', mode === 'add' || Object.keys(state.profiles).length < 2);
    $('#profileModalSave').textContent = mode === 'add' ? 'Add' : 'Rename';
    bootstrap.Modal.getOrCreateInstance('#profileModal').show();
  }

  function initProfiles() {
    populateProfiles();
    $('#profiles').addEventListener('change', function () { switchProfile(this.value); });
    $('#profileAdd').addEventListener('click', function () { openProfileModal('add'); });
    $('#profileEdit').addEventListener('click', function () { openProfileModal('edit'); });
    $('#profileModal').addEventListener('shown.bs.modal', function () { $('#profileModalName').focus(); });

    $('#profileForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#profileModalName').value.trim();
      if (!name) return;
      if (profileMode === 'add') {
        if (!state.profiles[name]) state.profiles[name] = blankProfile();
        switchProfile(name);
      } else if (name !== state.current) {
        if (state.profiles[name]) { alert('A profile called "' + name + '" already exists.'); return; }
        state.profiles[name] = state.profiles[state.current];
        delete state.profiles[state.current];
        state.current = name;
        save();
        populateProfiles();
      }
      bootstrap.Modal.getOrCreateInstance('#profileModal').hide();
    });

    $('#profileModalDelete').addEventListener('click', function () {
      if (Object.keys(state.profiles).length < 2) return;
      if (!confirm('Delete the profile "' + state.current + '" and all its progress?')) return;
      delete state.profiles[state.current];
      bootstrap.Modal.getOrCreateInstance('#profileModal').hide();
      switchProfile(Object.keys(state.profiles)[0]);
    });
  }

  // ------------------------------------------------------------ import / export / reset
  function initBackup() {
    $('#exportProfile').addEventListener('click', function () {
      var payload = { format: EXPORT_FORMAT, exported: new Date().toISOString(), name: state.current, profile: profile() };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bg3-field-manual-' + state.current.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    });

    var file = $('#importProfileFile');
    $('#importProfileBtn').addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var p = data && data.profile;
          if (!p || typeof p.checklistData !== 'object') throw new Error('not a profile export');
          var clean = blankProfile();
          Object.keys(p.checklistData).forEach(function (k) { if (p.checklistData[k] === true) clean.checklistData[String(k)] = true; });
          if (p.collapsed && typeof p.collapsed === 'object') {
            Object.keys(p.collapsed).forEach(function (k) { if (p.collapsed[k] === true) clean.collapsed[String(k)] = true; });
          }
          var name = uniqueName(String(data.name || 'Imported profile').slice(0, 60));
          state.profiles[name] = clean;
          switchProfile(name);
          alert('Imported as profile "' + name + '".');
        } catch (e) {
          alert("That file doesn't look like an export from this cheat sheet.");
        }
        file.value = '';
      };
      reader.readAsText(f);
    });

    $('#resetProfile').addEventListener('click', function () {
      if (!confirm('Untick everything in "' + state.current + '"?')) return;
      profile().checklistData = {};
      save();
      applyChecklist();
    });

    var note = $('#storageNote');
    if (note) note.textContent = 'Saved under the key "' + STORAGE_KEY + '" for this site only.';
  }

  // ------------------------------------------------------------ collapse
  function collapseInstance(el) { return bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }); }

  function setSectionOpen(body, open, instant) {
    var head = body.parentElement.querySelector('.btn-collapse');
    if (instant) {
      body.classList.toggle('show', open);
      if (head) { head.classList.toggle('collapsed', !open); head.setAttribute('aria-expanded', String(open)); }
    } else {
      collapseInstance(body)[open ? 'show' : 'hide']();
    }
  }

  function applyCollapsed() {
    var c = profile().collapsed;
    $$('.section-body').forEach(function (body) {
      var sid = body.id.replace(/-body$/, '');
      setSectionOpen(body, !c[sid], true);
    });
  }

  function initCollapse() {
    document.addEventListener('shown.bs.collapse', function (e) {
      if (!e.target.classList.contains('section-body')) return;
      delete profile().collapsed[e.target.id.replace(/-body$/, '')];
      save();
    });
    document.addEventListener('hidden.bs.collapse', function (e) {
      if (!e.target.classList.contains('section-body')) return;
      profile().collapsed[e.target.id.replace(/-body$/, '')] = true;
      save();
    });
    function activeBodies() { return $$('.tab-pane.active .section-body'); }
    $('#collapseAll').addEventListener('click', function () {
      activeBodies().forEach(function (b) { setSectionOpen(b, false, true); profile().collapsed[b.id.replace(/-body$/, '')] = true; });
      save();
    });
    $('#expandAll').addEventListener('click', function () {
      activeBodies().forEach(function (b) { setSectionOpen(b, true, true); delete profile().collapsed[b.id.replace(/-body$/, '')]; });
      save();
    });
    applyCollapsed();
  }

  // ------------------------------------------------------------ tabs + deep links
  function tabLinkFor(pane) { return document.querySelector('#tabNav [data-bs-toggle="tab"][href="#' + pane.id + '"]'); }

  function showPane(pane) {
    if (!pane || pane.classList.contains('active')) return;
    var link = tabLinkFor(pane);
    if (link) bootstrap.Tab.getOrCreateInstance(link).show();
  }

  function flash(el) {
    el.classList.remove('flash');
    void el.offsetWidth; // restart the animation
    el.classList.add('flash');
  }

  // Go to any element by id: switch tab, open its section, scroll, highlight.
  function goTo(id, opts) {
    opts = opts || {};
    var el = id && document.getElementById(id);
    if (!el) return false;
    var pane = el.classList.contains('tab-pane') ? el : el.closest('.tab-pane');
    showPane(pane);
    var body = el.classList.contains('cl-section') ? el.querySelector('.section-body') : el.closest('.section-body');
    if (body && !body.classList.contains('show')) {
      setSectionOpen(body, true, true);
      delete profile().collapsed[body.id.replace(/-body$/, '')];
      save();
    }
    var collapsedNav = $('#mainNav.show');
    if (collapsedNav) collapseInstance(collapsedNav).hide();
    if (el.classList.contains('tab-pane')) {
      window.scrollTo({ top: 0, behavior: opts.instant ? 'auto' : 'smooth' });
    } else {
      // wait a frame so a freshly shown tab has layout
      requestAnimationFrame(function () {
        el.scrollIntoView({ behavior: opts.instant ? 'auto' : 'smooth', block: 'start' });
        if (!opts.noFlash) flash(el.classList.contains('cl-section') ? el.querySelector('.section-head') : el);
      });
    }
    return true;
  }

  function activePaneId() {
    var p = $('.tab-pane.active');
    return p ? p.id : 'tabPlaythrough';
  }

  // Record where the reader is, so the browser Back button returns to the exact spot.
  function rememberSpot() {
    history.replaceState({ tab: activePaneId(), y: window.scrollY }, '', location.href);
  }

  // Follow an in-page link: save the current spot, add a history entry, go.
  function follow(id) {
    navigating = true;
    rememberSpot();
    if (location.hash !== '#' + id) history.pushState({ tab: null, y: null }, '', '#' + id);
    goTo(id);
    navigating = false;
  }

  var navigating = false;

  function initNavigation() {
    // We restore positions ourselves (tabs change page height, so the browser's guess is wrong).
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    // Remember the tab and keep the URL shareable.
    document.addEventListener('shown.bs.tab', function (e) {
      var href = e.target.getAttribute('href');
      profile().tab = href;
      save();
      var openNav = $('#mainNav.show');
      if (openNav) collapseInstance(openNav).hide();
      if (!navigating && location.hash !== href) {
        rememberSpot();
        // Land on the tab's title rather than the page intro.
        var content = $('.tab-content');
        var y = Math.max(0, content.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fm-nav-h')) || 56) - 8);
        history.pushState({ tab: href.slice(1), y: y }, '', href);
        window.scrollTo({ top: y });
      }
    });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (a.hasAttribute('data-bs-toggle')) return; // Bootstrap handles tabs & dropdowns
      var id = a.getAttribute('href').slice(1);
      if (id === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      follow(id);
    });

    window.addEventListener('popstate', function (e) {
      navigating = true;
      var st = e.state;
      if (st && st.tab && document.getElementById(st.tab)) {
        showPane(document.getElementById(st.tab));
        var y = st.y || 0;
        requestAnimationFrame(function () { window.scrollTo({ top: y }); });
      } else if (location.hash.length > 1) {
        goTo(location.hash.slice(1));
      } else {
        showPane(document.getElementById('tabPlaythrough'));
      }
      navigating = false;
    });

    var startId = location.hash.slice(1);
    navigating = true;
    var landed = startId && goTo(startId, { instant: true, noFlash: true });
    navigating = false;
    if (!landed) {
      var saved = profile().tab && document.querySelector(profile().tab);
      if (saved && saved.classList.contains('tab-pane')) showPane(saved);
    }
  }

  // ------------------------------------------------------------ resume
  function initResume() {
    $('#resumeBtn').addEventListener('click', function () {
      var next = trackedInputs($('#tabPlaythrough')).filter(function (i) { return !i.checked; })[0];
      if (!next) { alert('Every playthrough step is ticked. Well played!'); return; }
      follow(itemFor(next).id);
    });
  }

  // ------------------------------------------------------------ settings
  function applyHideCompleted() {
    var on = !!state.settings.hideCompleted;
    document.body.classList.toggle('hide-completed', on);
    $('#toggleHideCompleted').checked = on;
  }

  var THEMES = ['auto', 'light', 'dark'];
  var THEME_LABEL = { auto: 'Theme: auto', light: 'Theme: light', dark: 'Theme: dark' };
  function applyTheme() {
    var t = state.settings.theme || 'auto';
    var resolved = t === 'auto' ? (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
    document.documentElement.setAttribute('data-bs-theme', resolved);
    $('#themeToggle').textContent = THEME_LABEL[t];
  }

  function applyGearShow() {
    var who = state.settings.gearShow || 'all';
    var pane = $('#tabGear');
    if (who === 'all') pane.removeAttribute('data-show'); else pane.setAttribute('data-show', who);
    $$('[data-gear-show]').forEach(function (b) {
      var on = b.getAttribute('data-gear-show') === who;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function initSettings() {
    applyHideCompleted();
    $('#toggleHideCompleted').addEventListener('change', function () {
      state.settings.hideCompleted = this.checked;
      save();
      applyHideCompleted();
    });
    applyTheme();
    $('#themeToggle').addEventListener('click', function () {
      var t = state.settings.theme || 'auto';
      state.settings.theme = THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];
      save();
      applyTheme();
    });
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if ((state.settings.theme || 'auto') === 'auto') applyTheme(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
    applyGearShow();
    $$('[data-gear-show]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.settings.gearShow = b.getAttribute('data-gear-show');
        save();
        applyGearShow();
      });
    });
  }

  // ------------------------------------------------------------ back to top
  function initBackToTop() {
    var btn = $('#backToTop');
    var update = function () { btn.classList.toggle('visible', window.scrollY > 400); };
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // ------------------------------------------------------------ boot
  document.addEventListener('DOMContentLoaded', function () {
    addCheckboxes();
    initGearLinks();

    document.addEventListener('change', function (e) {
      var input = e.target;
      if (!input.matches || !input.matches('input[data-track]')) return;
      setChecked(input, input.checked);
      save();
      updateTotals();
    });

    $$('[data-reset-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sec = document.getElementById(btn.getAttribute('data-reset-section'));
        if (!sec) return;
        trackedInputs(sec).forEach(function (i) { setChecked(i, false); });
        save();
        updateTotals();
      });
    });

    initProfiles();
    initSettings();
    applyChecklist();
    initCollapse();
    initBackup();
    initResume();
    initBackToTop();
    initNavigation();
    save();
  });
})();
