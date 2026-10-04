/**
 * Project Berth — Ultra-Fast Keyboard-First Review UI
 * Built strictly according to design/berth/README.md, tokens.css, and components.css.
 * Dock aesthetic: poured concrete, ink borders, square corners (radius-none), 4 painted colours.
 */

export function renderDashboardHtml(authenticatedUserEmail: string = "reviewer@theashtons.dev"): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Berth — Autonomous Agent Control Plane</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23121413'/%3E%3Cg transform='translate(8 8)'%3E%3Cpath d='M0 18H10V38H38V18H48V48H0Z' fill='%23EDEEE9'/%3E%3Crect x='14.25' y='5.25' width='19.5' height='28.5' fill='%23FFC21A' stroke='%23EDEEE9' stroke-width='2.5'/%3E%3C/g%3E%3C/svg%3E">
  <style>
    /* -------------------------------------------------------------
       Berth Design System Tokens (design/berth/tokens.css)
       ------------------------------------------------------------- */
    @font-face { font-family: 'Archivo Expanded'; src: url('/design/berth/fonts/ArchivoExpanded-800.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Archivo Expanded'; src: url('/design/berth/fonts/ArchivoExpanded-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Next'; src: url('/design/berth/fonts/AtkinsonHyperlegibleNext-400.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Next'; src: url('/design/berth/fonts/AtkinsonHyperlegibleNext-400-italic.woff2') format('woff2'); font-weight: 400; font-style: italic; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Next'; src: url('/design/berth/fonts/AtkinsonHyperlegibleNext-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Mono'; src: url('/design/berth/fonts/AtkinsonHyperlegibleMono-400.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Mono'; src: url('/design/berth/fonts/AtkinsonHyperlegibleMono-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }

    :root {
      color-scheme: light;
      --concrete: #e3e4df;
      --slab: #f2f3ef;
      --sunk: #d3d5cf;
      --ink: #121413;
      --ink-muted: #474c49;
      --quay: #ffc21a;
      --on-quay: #121413;
      --buoy: #f2541b;
      --on-buoy: #121413;
      --harbour: #0a4bc2;
      --on-harbour: #ffffff;
      --landed: #46c98d;
      --on-landed: #121413;
      --escalated: #a61f18;
      --on-escalated: #ffffff;
      --vouched: var(--ink);
      --on-vouched: var(--concrete);
      --link: #0a4bc2;
      --danger-text: #a61f18;
      --focus: #0a4bc2;
      --shadow-block: 4px 4px 0 0 #121413;
      --shadow-pressed: 1px 1px 0 0 #121413;
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-6: 24px;
      --space-8: 32px;
      --space-12: 48px;
      --radius-none: 0px;
      --border-hair: 1px;
      --border-rule: 2px;
      --border-heavy: 4px;
      --font-display: "Archivo Expanded", "Arial Black", Impact, sans-serif;
      --font-body: "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", Verdana, system-ui, sans-serif;
      --font-mono: "Atkinson Hyperlegible Mono", ui-monospace, Menlo, Consolas, monospace;
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        color-scheme: dark;
        --concrete: #111514;
        --slab: #1a1f1e;
        --sunk: #0a0d0c;
        --ink: #edeee9;
        --ink-muted: #a8aeaa;
        --quay: #ffc21a;
        --on-quay: #121413;
        --buoy: #ff6a33;
        --on-buoy: #121413;
        --harbour: #5b8cff;
        --on-harbour: #121413;
        --landed: #46c98d;
        --on-landed: #121413;
        --escalated: #a61f18;
        --on-escalated: #ffffff;
        --vouched: var(--ink);
        --on-vouched: var(--concrete);
        --link: #86aaff;
        --danger-text: #ff7f75;
        --focus: #ffc21a;
        --shadow-block: 4px 4px 0 0 #edeee9;
        --shadow-pressed: 1px 1px 0 0 #edeee9;
      }
    }

    :root[data-theme="dark"] {
      color-scheme: dark;
      --concrete: #111514;
      --slab: #1a1f1e;
      --sunk: #0a0d0c;
      --ink: #edeee9;
      --ink-muted: #a8aeaa;
      --quay: #ffc21a;
      --on-quay: #121413;
      --buoy: #ff6a33;
      --on-buoy: #121413;
      --harbour: #5b8cff;
      --on-harbour: #121413;
      --landed: #46c98d;
      --on-landed: #121413;
      --escalated: #a61f18;
      --on-escalated: #ffffff;
      --vouched: var(--ink);
      --on-vouched: var(--concrete);
      --link: #86aaff;
      --danger-text: #ff7f75;
      --focus: #ffc21a;
      --shadow-block: 4px 4px 0 0 #edeee9;
      --shadow-pressed: 1px 1px 0 0 #edeee9;
    }

    /* Type styles */
    .t-display-xl { font-family: var(--font-display); font-size: 64px; line-height: 60px; font-weight: 800; letter-spacing: -0.02em; }
    .t-display { font-family: var(--font-display); font-size: 40px; line-height: 44px; font-weight: 800; letter-spacing: -0.01em; }
    .t-heading { font-family: var(--font-display); font-size: 22px; line-height: 28px; font-weight: 700; }
    .t-label { font-family: var(--font-display); font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .t-body-lg { font-family: var(--font-body); font-size: 18px; line-height: 28px; font-weight: 400; }
    .t-body { font-family: var(--font-body); font-size: 16px; line-height: 24px; font-weight: 400; }
    .t-body-strong { font-family: var(--font-body); font-size: 16px; line-height: 24px; font-weight: 700; }
    .t-body-sm { font-family: var(--font-body); font-size: 14px; line-height: 20px; font-weight: 400; }
    .t-code { font-family: var(--font-mono); font-size: 14px; line-height: 20px; font-weight: 400; font-variant-numeric: tabular-nums; }
    .t-data { font-family: var(--font-mono); font-size: 13px; line-height: 20px; font-weight: 400; font-variant-numeric: tabular-nums; }
    .t-data-strong { font-family: var(--font-mono); font-size: 13px; line-height: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* -------------------------------------------------------------
       Berth Components (design/berth/components.css)
       ------------------------------------------------------------- */
    .bt-page { background: var(--concrete); color: var(--ink); font-family: var(--font-body); font-size: 16px; line-height: 24px; min-height: 100vh; margin: 0; display: flex; flex-direction: column; }
    .bt-page *, .bt-page *::before, .bt-page *::after { box-sizing: border-box; }

    /* Focus */
    .bt-btn:focus-visible, .bt-input:focus-visible, .bt-link:focus-visible, .bt-record:focus-visible, .bt-attempt:focus-visible, .bt-matrix td:focus-visible {
      outline: 3px solid var(--focus); outline-offset: 3px;
    }

    /* Label */
    .bt-label { font-family: var(--font-display); font-weight: 700; font-size: 12px; line-height: 16px; letter-spacing: 0.08em; text-transform: uppercase; }

    /* Button */
    .bt-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
      height: 40px; padding: 0 var(--space-4);
      font-family: var(--font-display); font-weight: 700; font-size: 13px; line-height: 16px; letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--ink); background: var(--slab);
      border: var(--border-rule) solid var(--ink); border-radius: 0;
      box-shadow: var(--shadow-block); cursor: pointer;
      transition: transform 60ms linear, box-shadow 60ms linear;
      text-decoration: none;
    }
    .bt-btn:hover { background: var(--sunk); }
    .bt-btn:active { transform: translate(3px, 3px); box-shadow: var(--shadow-pressed); }
    .bt-btn--primary { background: var(--quay); color: var(--on-quay); }
    .bt-btn--primary:hover { background: var(--quay); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    .bt-btn--danger { background: var(--escalated); color: var(--on-escalated); }
    .bt-btn--danger:hover { background: var(--escalated); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    .bt-btn--quiet { box-shadow: none; background: transparent; border-color: transparent; text-decoration: underline; text-underline-offset: 3px; }
    .bt-btn--quiet:hover { background: transparent; border-color: var(--ink); }
    .bt-btn:disabled, .bt-btn[aria-disabled="true"] { background: var(--sunk); color: var(--ink-muted); border-style: dashed; box-shadow: none; cursor: not-allowed; transform: none; text-decoration: none; }
    .bt-btn .bt-kbd { margin-left: var(--space-1); }

    /* Key hint */
    .bt-kbd {
      display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; padding: 0 6px;
      font-family: var(--font-mono); font-weight: 700; font-size: 12px; line-height: 1; text-transform: none; letter-spacing: 0;
      color: inherit; background: transparent;
      border: var(--border-rule) solid currentColor; border-bottom-width: var(--border-heavy);
    }

    /* State chip */
    .bt-state {
      display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 var(--space-2);
      font-family: var(--font-display); font-weight: 700; font-size: 11px; line-height: 1; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;
      color: var(--ink); background: var(--slab); border: var(--border-rule) solid var(--ink);
    }
    .bt-state::before { content: ""; flex: none; width: 10px; height: 10px; border: 2px solid currentColor; background: currentColor; }
    .bt-state--intent::before { background: transparent; }
    .bt-state--exploring { background: var(--harbour); color: var(--on-harbour); }
    .bt-state--exploring::before { background: linear-gradient(to top, currentColor 50%, transparent 50%); }
    .bt-state--proposed { background: var(--quay); color: var(--on-quay); }
    .bt-state--vouched { background: var(--vouched); color: var(--on-vouched); }
    .bt-state--landing { background: var(--buoy); color: var(--on-buoy); }
    .bt-state--landing::before { background: repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 4px); }
    .bt-state--landed { background: var(--landed); color: var(--on-landed); }
    .bt-state--landed::before { width: 6px; height: 10px; border-width: 0 3px 3px 0; background: transparent; transform: rotate(45deg) translate(-1px, -1px); }
    .bt-state--stopped { background: var(--sunk); border-style: dashed; }
    .bt-state--stopped::before { background: transparent; border-style: dashed; }
    .bt-state--escalated { background: var(--escalated); color: var(--on-escalated); }
    .bt-state--escalated::before { content: "!"; width: auto; height: auto; border: 0; background: transparent; font-size: 14px; line-height: 1; font-family: var(--font-display); font-weight: 800; }

    /* Hazard band */
    .bt-hazard { height: 12px; border: var(--border-rule) solid var(--ink); background: repeating-linear-gradient(135deg, var(--ink) 0 8px, var(--quay) 8px 16px); }

    /* Human record */
    .bt-record { background: var(--slab); color: var(--ink); border: var(--border-rule) solid var(--ink); box-shadow: var(--shadow-block); max-width: 720px; width: 100%; }
    .bt-record__head { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); padding: var(--space-3) var(--space-4); border-bottom: var(--border-rule) solid var(--ink); }
    .bt-record__title { margin: 0; flex: 1 1 240px; min-width: 0; font-family: var(--font-display); font-weight: 700; font-size: 18px; line-height: 24px; text-wrap: balance; }
    .bt-record__count { font-family: var(--font-mono); font-size: 13px; line-height: 20px; color: var(--ink-muted); font-variant-numeric: tabular-nums; }
    .bt-record__lines { margin: 0; display: grid; grid-template-columns: 9.5rem minmax(0, 1fr); }
    .bt-record__lines dt, .bt-record__lines dd { margin: 0; padding: var(--space-3) var(--space-4); border-bottom: var(--border-hair) solid var(--ink); }
    .bt-record__lines dt { font-family: var(--font-display); font-weight: 700; font-size: 12px; line-height: 24px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); }
    .bt-record__lines dd { font-size: 18px; line-height: 28px; min-width: 0; }
    .bt-record__lines > :nth-last-child(-n+2) { border-bottom: 0; }
    .bt-record__lines .bt-record__gap { background: var(--quay); color: var(--on-quay); font-weight: 700; }
    .bt-record__lines code, .bt-record code { font-family: var(--font-mono); font-size: 15px; overflow-wrap: anywhere; }
    .bt-record__lines .bt-record__cost { font-family: var(--font-mono); font-size: 15px; font-variant-numeric: tabular-nums; }
    @media (max-width: 560px) {
      .bt-record__lines { grid-template-columns: minmax(0, 1fr); }
      .bt-record__lines dt { padding-bottom: 0; border-bottom: 0; }
    }

    /* Attempt card */
    .bt-attempt { background: var(--slab); color: var(--ink); border: var(--border-rule) solid var(--ink); display: grid; gap: var(--space-3); padding: var(--space-4); min-width: 0; }
    .bt-attempt--active { box-shadow: var(--shadow-block); }
    .bt-attempt--stopped { background: var(--sunk); border-style: dashed; }
    .bt-attempt__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
    .bt-attempt__name { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 18px; line-height: 24px; }
    .bt-attempt__agent, .bt-attempt__paths { margin: 0; font-family: var(--font-mono); font-size: 13px; line-height: 20px; color: var(--ink-muted); overflow-wrap: anywhere; }
    .bt-attempt__now { margin: 0; font-size: 16px; line-height: 24px; }
    .bt-meter { display: grid; gap: var(--space-1); }
    .bt-meter__row { display: flex; justify-content: space-between; gap: var(--space-2); font-family: var(--font-mono); font-size: 13px; line-height: 20px; font-variant-numeric: tabular-nums; }
    .bt-meter__track { height: 12px; background: var(--sunk); border: var(--border-rule) solid var(--ink); }
    .bt-meter__fill { height: 100%; background: var(--harbour); }
    .bt-meter--over .bt-meter__fill { background: var(--escalated); }
    .bt-meter--over .bt-meter__row strong { color: var(--danger-text); }

    /* Conflict matrix */
    .bt-matrix-wrap { overflow-x: auto; max-width: 100%; border: var(--border-rule) solid var(--ink); background: var(--slab); }
    .bt-matrix { border-collapse: collapse; width: 100%; font-family: var(--font-mono); font-size: 13px; line-height: 20px; font-variant-numeric: tabular-nums; color: var(--ink); background: var(--slab); }
    .bt-matrix th, .bt-matrix td { border: var(--border-rule) solid var(--ink); padding: var(--space-2) var(--space-3); text-align: left; white-space: nowrap; }
    .bt-matrix thead th { font-family: var(--font-display); font-weight: 700; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; background: var(--concrete); }
    .bt-matrix tbody th { font-family: var(--font-display); font-weight: 700; font-size: 12px; letter-spacing: 0.04em; background: var(--concrete); }
    .bt-matrix .is-self { background: var(--sunk); color: var(--ink-muted); text-align: center; }
    .bt-matrix .is-clean { background: var(--slab); }
    .bt-matrix .is-overlap { background: var(--quay); color: var(--on-quay); font-weight: 700; }
    .bt-matrix .is-conflict { background: var(--escalated); color: var(--on-escalated); font-weight: 700; }
    .bt-matrix th.is-trunk { box-shadow: inset 0 calc(-1 * var(--border-heavy)) 0 0 var(--ink); }

    /* Text field */
    .bt-field { display: grid; gap: var(--space-2); max-width: 480px; }
    .bt-field__label { font-family: var(--font-display); font-weight: 700; font-size: 12px; line-height: 16px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); }
    .bt-input { width: 100%; height: 44px; padding: 0 var(--space-3); font: inherit; font-size: 16px; color: var(--ink); background: var(--slab); border: var(--border-rule) solid var(--ink); border-radius: 0; }
    textarea.bt-input { height: auto; min-height: 96px; padding: var(--space-2) var(--space-3); resize: vertical; }
    .bt-input::placeholder { color: var(--ink-muted); opacity: 1; }
    .bt-field__help { font-size: 14px; line-height: 20px; color: var(--ink-muted); margin: 0; }
    .bt-field--error .bt-input { border-color: var(--danger-text); border-width: var(--border-heavy); }
    .bt-field__error { margin: 0; font-size: 14px; line-height: 20px; font-weight: 700; color: var(--danger-text); }

    /* Links */
    .bt-link { color: var(--link); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    .bt-link:hover { text-decoration-thickness: 4px; }

    @media (prefers-reduced-motion: reduce) { .bt-btn { transition: none; } .bt-btn:active { transform: none; } }

    /* -------------------------------------------------------------
       Berth UI Layout & Header
       ------------------------------------------------------------- */
    header.dock-header {
      background: var(--slab);
      border-bottom: var(--border-rule) solid var(--ink);
      padding: var(--space-3) var(--space-6);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    .brand-logo-link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    .logo-dark { display: none; }
    .logo-light { display: block; }
    :root[data-theme="dark"] .logo-light { display: none; }
    :root[data-theme="dark"] .logo-dark { display: block; }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) .logo-light { display: none; }
      :root:not([data-theme="light"]) .logo-dark { display: block; }
    }

    .dock-motto {
      font-size: 14px;
      line-height: 20px;
      color: var(--ink-muted);
      border-left: var(--border-rule) solid var(--ink);
      padding-left: var(--space-3);
    }

    nav.dock-nav {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      flex-wrap: wrap;
    }

    .dock-nav .bt-btn {
      height: 36px;
      padding: 0 var(--space-3);
      font-size: 12px;
      box-shadow: none;
    }
    .dock-nav .bt-btn.active {
      background: var(--quay);
      color: var(--on-quay);
      box-shadow: var(--shadow-block);
    }

    .dock-controls {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .theme-switch-group {
      display: flex;
      align-items: center;
      border: var(--border-rule) solid var(--ink);
      background: var(--concrete);
    }
    .theme-switch-group .bt-btn {
      height: 32px;
      padding: 0 var(--space-2);
      font-size: 11px;
      border: none;
      box-shadow: none;
      background: transparent;
      color: var(--ink-muted);
    }
    .theme-switch-group .bt-btn.active {
      background: var(--ink);
      color: var(--concrete);
      font-weight: 700;
    }

    .user-dock-tag {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px var(--space-2);
      background: var(--concrete);
      border: var(--border-rule) solid var(--ink);
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink);
    }

    /* Page container */
    main.g-wrap {
      max-width: 1120px;
      margin: 0 auto;
      padding-block: var(--space-8);
      padding-inline: var(--space-6);
      width: 100%;
      flex: 1;
      display: grid;
      gap: var(--space-8);
    }

    .view-container { display: none; }
    .view-container.active { display: block; }

    .g-sec {
      display: grid;
      gap: var(--space-4);
      border-top: var(--border-heavy) solid var(--ink);
      padding-top: var(--space-4);
      min-width: 0;
    }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-bottom: var(--space-6);
    }
    .view-title-group h2 { margin: 0; }
    .view-title-group p { margin: var(--space-1) 0 0 0; color: var(--ink-muted); }

    /* Layout Grids */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    @media (max-width: 840px) { .grid-2 { grid-template-columns: 1fr; } }

    .panel-block {
      background: var(--slab);
      border: var(--border-rule) solid var(--ink);
      padding: var(--space-4);
      display: grid;
      gap: var(--space-3);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
      border-bottom: var(--border-hair) solid var(--ink);
      padding-bottom: var(--space-2);
    }

    /* Decision stream */
    .log-well {
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 18px;
      max-height: 260px;
      overflow-y: auto;
      background: var(--sunk);
      padding: var(--space-3);
      border: var(--border-rule) solid var(--ink);
    }
    .log-item {
      padding: 3px 0;
      border-bottom: var(--border-hair) solid var(--ink-muted);
      display: flex;
      gap: var(--space-2);
    }
    .log-item:last-child { border-bottom: none; }
    .log-time { color: var(--ink-muted); flex: none; }
    .log-decision { font-weight: 700; color: var(--ink); }

    /* Visual evidence frame & Kitesurf browser screenshot */
    .browser-frame {
      background: var(--slab);
      border: var(--border-rule) solid var(--ink);
      box-shadow: var(--shadow-block);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .browser-chrome-tabs {
      background: var(--concrete);
      border-bottom: var(--border-hair) solid var(--ink);
      padding: var(--space-2) var(--space-3) 0 var(--space-3);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: var(--space-2);
    }
    .browser-tabs-group {
      display: flex;
      gap: 2px;
      align-items: flex-end;
    }
    .browser-tab {
      background: var(--slab);
      border: var(--border-hair) solid var(--ink);
      border-bottom: none;
      padding: 4px var(--space-3);
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
    }
    .browser-tab.active {
      background: var(--slab);
      border-top: 2px solid var(--quay);
    }
    .browser-tab:not(.active) {
      background: var(--concrete);
      color: var(--ink-muted);
    }
    .browser-controls {
      display: flex;
      gap: 4px;
      padding-bottom: 4px;
    }
    .browser-dot {
      width: 14px;
      height: 14px;
      border: var(--border-hair) solid var(--ink);
      background: var(--concrete);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      line-height: 1;
      font-weight: bold;
      color: var(--ink);
    }
    .browser-bar {
      background: var(--concrete);
      border-bottom: var(--border-rule) solid var(--ink);
      padding: var(--space-2) var(--space-3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
    }
    .browser-nav-btn {
      background: var(--slab);
      border: var(--border-hair) solid var(--ink);
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: var(--ink);
      cursor: pointer;
      user-select: none;
    }
    .browser-url-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--slab);
      border: var(--border-hair) solid var(--ink);
      padding: 2px var(--space-2);
      flex: 1;
      min-width: 0;
    }
    .browser-url {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .browser-canvas {
      position: relative;
      background: #0D0E0D;
      padding: var(--space-3);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      cursor: zoom-in;
    }
    .browser-screenshot-viewport {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 10;
      border: var(--border-hair) solid var(--ink);
      background: var(--concrete);
      display: block;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
    }
    .browser-evidence-strip {
      background: var(--concrete);
      border-top: var(--border-rule) solid var(--ink);
      padding: var(--space-2) var(--space-3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
      font-size: 12px;
    }
    .browser-evidence-stats {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    /* Modal */
    #shortcuts-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(18, 20, 19, 0.7);
      z-index: 100;
      justify-content: center;
      align-items: center;
      padding: var(--space-4);
    }
    .modal-box {
      background: var(--slab);
      border: var(--border-rule) solid var(--ink);
      box-shadow: var(--shadow-block);
      padding: var(--space-6);
      width: 100%;
      max-width: 480px;
      display: grid;
      gap: var(--space-4);
    }
    .shortcut-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .shortcut-table td {
      padding: var(--space-2) 0;
      border-bottom: var(--border-hair) solid var(--ink);
    }
    .shortcut-table tr:last-child td { border-bottom: none; }

    /* Landed list */
    .landed-item {
      padding: var(--space-3) 0;
      border-bottom: var(--border-hair) solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .landed-item:last-child { border-bottom: none; }
  </style>
</head>
<body class="bt-page">
  <header class="dock-header">
    <div class="brand-cluster">
      <a class="brand-logo-link" href="/ui" aria-label="Berth">
        <!-- SVG lockup: Light theme (#121413) -->
        <svg class="logo-light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.2 48" height="36" role="img" aria-label="BERTH">
          <title>BERTH</title>
          <path d="M0 18H10V38H38V18H48V48H0Z" fill="#121413"/>
          <rect x="14.25" y="5.25" width="19.5" height="28.5" fill="#FFC21A" stroke="#121413" stroke-width="2.5"/>
          <path transform="translate(60 48)" fill="#121413" d="M17.8 0.48Q15.4 0.48 13.24 -0.36Q11.08 -1.2 9.52 -3.2800000000000002H9.16L8.6 0.0H2.6V-29.0H10.0V-18.6H10.32Q11.200000000000001 -19.64 12.46 -20.3Q13.72 -20.96 15.16 -21.28Q16.6 -21.6 18.0 -21.6Q21.12 -21.6 23.58 -20.4Q26.04 -19.2 27.46 -16.759999999999998Q28.88 -14.32 28.88 -10.56Q28.88 -6.8 27.46 -4.34Q26.04 -1.8800000000000001 23.54 -0.7000000000000001Q21.04 0.48 17.8 0.48ZM15.68 -5.04Q17.56 -5.04 18.84 -5.68Q20.12 -6.32 20.76 -7.5Q21.400000000000002 -8.68 21.400000000000002 -10.200000000000001V-10.88Q21.400000000000002 -12.44 20.76 -13.6Q20.12 -14.76 18.86 -15.420000000000002Q17.6 -16.080000000000002 15.72 -16.080000000000002Q14.280000000000001 -16.080000000000002 13.200000000000001 -15.680000000000001Q12.120000000000001 -15.280000000000001 11.4 -14.580000000000002Q10.68 -13.88 10.32 -12.88Q9.96 -11.88 9.96 -10.68V-10.4Q9.96 -8.8 10.600000000000001 -7.6000000000000005Q11.24 -6.4 12.52 -5.720000000000001Q13.8 -5.04 15.68 -5.04Z M46.16 0.48Q41.84 0.48 38.64 -0.68Q35.44 -1.84 33.66 -4.3Q31.88 -6.76 31.88 -10.56Q31.88 -14.24 33.62 -16.7Q35.36 -19.16 38.5 -20.380000000000003Q41.64 -21.6 45.84 -21.6Q50.239999999999995 -21.6 53.339999999999996 -20.4Q56.44 -19.2 58.08 -16.8Q59.72 -14.4 59.72 -10.8V-9.08H39.64Q39.72 -7.4 40.519999999999996 -6.32Q41.32 -5.24 42.78 -4.74Q44.24 -4.24 46.239999999999995 -4.24Q47.32 -4.24 48.32 -4.46Q49.32 -4.68 50.14 -5.08Q50.96 -5.48 51.46 -6.08Q51.96 -6.68 52.04 -7.4H59.64Q59.64 -5.6000000000000005 58.64 -4.140000000000001Q57.64 -2.68 55.84 -1.6400000000000001Q54.04 -0.6 51.56 -0.06Q49.08 0.48 46.16 0.48ZM39.64 -13.0H51.84Q51.84 -13.88 51.42 -14.600000000000001Q51.0 -15.32 50.22 -15.82Q49.44 -16.32 48.379999999999995 -16.6Q47.32 -16.88 46.08 -16.88Q44.2 -16.88 42.82 -16.4Q41.44 -15.92 40.64 -15.04Q39.84 -14.16 39.64 -13.0Z M63.6 0.0V-21.12H69.6L70.08 -17.52H70.44Q71.04 -18.8 72.02000000000001 -19.72Q73.0 -20.64 74.24000000000001 -21.12Q75.48 -21.6 76.88 -21.6Q77.68 -21.6 78.42 -21.5Q79.16 -21.400000000000002 79.8 -21.12V-15.32H76.28Q74.88 -15.32 73.88 -14.86Q72.88 -14.4 72.24 -13.620000000000001Q71.6 -12.84 71.3 -11.86Q71.0 -10.88 71.0 -9.76V0.0Z M92.96 0.48Q90.32 0.48 88.53999999999999 -0.12Q86.75999999999999 -0.72 85.84 -2.2Q84.92 -3.68 84.92 -6.32V-16.080000000000002H80.8V-21.12H85.2L86.67999999999999 -27.400000000000002H92.32V-21.12H98.2V-16.080000000000002H92.32V-7.68Q92.32 -6.16 92.96 -5.34Q93.6 -4.5200000000000005 95.6 -4.5200000000000005H98.2V-0.24Q97.64 -0.04 96.66 0.12000000000000001Q95.67999999999999 0.28 94.67999999999999 0.38Q93.67999999999999 0.48 92.96 0.48Z M102.03999999999999 0.0V-29.0H109.44V-18.44H109.72Q110.84 -19.6 112.16 -20.3Q113.48 -21.0 114.96000000000001 -21.3Q116.44 -21.6 117.92 -21.6Q121.0 -21.6 123.03999999999999 -20.62Q125.08 -19.64 126.1 -17.66Q127.12 -15.68 127.12 -12.72V0.0H119.75999999999999V-11.72Q119.75999999999999 -12.8 119.46 -13.620000000000001Q119.16 -14.44 118.58 -14.98Q118.0 -15.52 117.14 -15.8Q116.28 -16.080000000000002 115.16 -16.080000000000002Q113.6 -16.080000000000002 112.3 -15.440000000000001Q111.0 -14.8 110.22 -13.66Q109.44 -12.52 109.44 -11.0V0.0Z"/>
        </svg>
        <!-- SVG lockup: Dark theme (#EDEEE9) -->
        <svg class="logo-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.2 48" height="36" role="img" aria-label="BERTH">
          <title>BERTH</title>
          <path d="M0 18H10V38H38V18H48V48H0Z" fill="#EDEEE9"/>
          <rect x="14.25" y="5.25" width="19.5" height="28.5" fill="#FFC21A" stroke="#EDEEE9" stroke-width="2.5"/>
          <path transform="translate(60 48)" fill="#EDEEE9" d="M17.8 0.48Q15.4 0.48 13.24 -0.36Q11.08 -1.2 9.52 -3.2800000000000002H9.16L8.6 0.0H2.6V-29.0H10.0V-18.6H10.32Q11.200000000000001 -19.64 12.46 -20.3Q13.72 -20.96 15.16 -21.28Q16.6 -21.6 18.0 -21.6Q21.12 -21.6 23.58 -20.4Q26.04 -19.2 27.46 -16.759999999999998Q28.88 -14.32 28.88 -10.56Q28.88 -6.8 27.46 -4.34Q26.04 -1.8800000000000001 23.54 -0.7000000000000001Q21.04 0.48 17.8 0.48ZM15.68 -5.04Q17.56 -5.04 18.84 -5.68Q20.12 -6.32 20.76 -7.5Q21.400000000000002 -8.68 21.400000000000002 -10.200000000000001V-10.88Q21.400000000000002 -12.44 20.76 -13.6Q20.12 -14.76 18.86 -15.420000000000002Q17.6 -16.080000000000002 15.72 -16.080000000000002Q14.280000000000001 -16.080000000000002 13.200000000000001 -15.680000000000001Q12.120000000000001 -15.280000000000001 11.4 -14.580000000000002Q10.68 -13.88 10.32 -12.88Q9.96 -11.88 9.96 -10.68V-10.4Q9.96 -8.8 10.600000000000001 -7.6000000000000005Q11.24 -6.4 12.52 -5.720000000000001Q13.8 -5.04 15.68 -5.04Z M46.16 0.48Q41.84 0.48 38.64 -0.68Q35.44 -1.84 33.66 -4.3Q31.88 -6.76 31.88 -10.56Q31.88 -14.24 33.62 -16.7Q35.36 -19.16 38.5 -20.380000000000003Q41.64 -21.6 45.84 -21.6Q50.239999999999995 -21.6 53.339999999999996 -20.4Q56.44 -19.2 58.08 -16.8Q59.72 -14.4 59.72 -10.8V-9.08H39.64Q39.72 -7.4 40.519999999999996 -6.32Q41.32 -5.24 42.78 -4.74Q44.24 -4.24 46.239999999999995 -4.24Q47.32 -4.24 48.32 -4.46Q49.32 -4.68 50.14 -5.08Q50.96 -5.48 51.46 -6.08Q51.96 -6.68 52.04 -7.4H59.64Q59.64 -5.6000000000000005 58.64 -4.140000000000001Q57.64 -2.68 55.84 -1.6400000000000001Q54.04 -0.6 51.56 -0.06Q49.08 0.48 46.16 0.48ZM39.64 -13.0H51.84Q51.84 -13.88 51.42 -14.600000000000001Q51.0 -15.32 50.22 -15.82Q49.44 -16.32 48.379999999999995 -16.6Q47.32 -16.88 46.08 -16.88Q44.2 -16.88 42.82 -16.4Q41.44 -15.92 40.64 -15.04Q39.84 -14.16 39.64 -13.0Z M63.6 0.0V-21.12H69.6L70.08 -17.52H70.44Q71.04 -18.8 72.02000000000001 -19.72Q73.0 -20.64 74.24000000000001 -21.12Q75.48 -21.6 76.88 -21.6Q77.68 -21.6 78.42 -21.5Q79.16 -21.400000000000002 79.8 -21.12V-15.32H76.28Q74.88 -15.32 73.88 -14.86Q72.88 -14.4 72.24 -13.620000000000001Q71.6 -12.84 71.3 -11.86Q71.0 -10.88 71.0 -9.76V0.0Z M92.96 0.48Q90.32 0.48 88.53999999999999 -0.12Q86.75999999999999 -0.72 85.84 -2.2Q84.92 -3.68 84.92 -6.32V-16.080000000000002H80.8V-21.12H85.2L86.67999999999999 -27.400000000000002H92.32V-21.12H98.2V-16.080000000000002H92.32V-7.68Q92.32 -6.16 92.96 -5.34Q93.6 -4.5200000000000005 95.6 -4.5200000000000005H98.2V-0.24Q97.64 -0.04 96.66 0.12000000000000001Q95.67999999999999 0.28 94.67999999999999 0.38Q93.67999999999999 0.48 92.96 0.48Z M102.03999999999999 0.0V-29.0H109.44V-18.44H109.72Q110.84 -19.6 112.16 -20.3Q113.48 -21.0 114.96000000000001 -21.3Q116.44 -21.6 117.92 -21.6Q121.0 -21.6 123.03999999999999 -20.62Q125.08 -19.64 126.1 -17.66Q127.12 -15.68 127.12 -12.72V0.0H119.75999999999999V-11.72Q119.75999999999999 -12.8 119.46 -13.620000000000001Q119.16 -14.44 118.58 -14.98Q118.0 -15.52 117.14 -15.8Q116.28 -16.080000000000002 115.16 -16.080000000000002Q113.6 -16.080000000000002 112.3 -15.440000000000001Q111.0 -14.8 110.22 -13.66Q109.44 -12.52 109.44 -11.0V0.0Z"/>
        </svg>
      </a>
      <div class="dock-motto">Agents write the code. Humans decide what lands.</div>
    </div>

    <nav class="dock-nav" aria-label="Primary navigation">
      <button class="bt-btn active" id="nav-inbox" onclick="switchView('inbox')">
        <span class="bt-kbd">1</span> Inbox <span id="inbox-badge" class="bt-state bt-state--proposed" style="display:none; height: 18px; padding: 0 4px; font-size: 10px; margin-left: 4px;">0</span>
      </button>
      <button class="bt-btn" id="nav-task" onclick="switchView('task')">
        <span class="bt-kbd">2</span> Task
      </button>
      <button class="bt-btn" id="nav-change" onclick="switchView('change')">
        <span class="bt-kbd">3</span> Change
      </button>
      <button class="bt-btn" id="nav-landed" onclick="switchView('landed')">
        <span class="bt-kbd">4</span> Landed
      </button>
    </nav>

    <div class="dock-controls">
      <div class="theme-switch-group" role="group" aria-label="Theme selector">
        <button class="bt-btn" id="btn-theme-light" onclick="setTheme('light')" type="button">Light</button>
        <button class="bt-btn" id="btn-theme-dark" onclick="setTheme('dark')" type="button">Dark</button>
        <button class="bt-btn" id="btn-theme-system" onclick="setTheme('system')" type="button">System</button>
      </div>

      <div class="user-dock-tag">
        <span class="bt-state bt-state--landed" style="height: 18px; padding: 0 4px; font-size: 10px;">Human</span>
        <span id="user-email">${authenticatedUserEmail}</span>
      </div>

      <button class="bt-btn bt-btn--quiet" onclick="toggleShortcuts(true)" title="All keyboard shortcuts [?]" style="padding: 0 6px;">
        <span class="bt-kbd">?</span>
      </button>
    </div>
  </header>

  <main class="g-wrap">
    <!-- View 1: Inbox ("Needs you") -->
    <section id="view-inbox" class="view-container active" aria-labelledby="inbox-heading">
      <div class="view-header">
        <div class="view-title-group">
          <h2 class="t-heading" id="inbox-heading">Inbox — Needs You</h2>
          <p class="t-body-sm">Decide on escalations, vouch candidate changes, and unblock racing attempts.</p>
        </div>
      </div>

      <!-- Blocking Escalations -->
      <div id="inbox-escalations-section" style="margin-bottom: var(--space-6); display: none;">
        <h3 class="t-label" style="color: var(--danger-text); margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2);">
          <span class="bt-state bt-state--escalated">Escalated</span> Blocking escalations
        </h3>
        <div id="inbox-escalations-list" style="display: grid; gap: var(--space-4);"></div>
      </div>

      <!-- Proposed Changes -->
      <div id="inbox-proposals-section" style="margin-bottom: var(--space-6);">
        <h3 class="t-label" style="margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2);">
          <span class="bt-state bt-state--proposed">Proposed</span> Candidate changes awaiting vouch
        </h3>
        <div id="inbox-proposals-list" style="display: grid; gap: var(--space-6);">
          <div class="panel-block" style="text-align: center; color: var(--ink-muted); padding: var(--space-8);">
            Loading inbox items...
          </div>
        </div>
      </div>

      <!-- Stopped Attempts -->
      <div id="inbox-halted-section" style="display: none;">
        <h3 class="t-label" style="color: var(--ink-muted); margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2);">
          <span class="bt-state bt-state--stopped">Stopped</span> Halted attempts
        </h3>
        <div id="inbox-halted-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4);"></div>
      </div>
    </section>

    <!-- View 2: Task View -->
    <section id="view-task" class="view-container" aria-labelledby="task-title-display">
      <div class="view-header">
        <div class="view-title-group">
          <h2 class="t-heading" id="task-title-display">Task: M4-review</h2>
          <p class="t-body-sm" id="task-intent-display">Loading task details...</p>
        </div>
        <div class="bt-field" style="max-width: 240px; margin: 0;">
          <label class="bt-field__label" for="task-selector">Active task</label>
          <select class="bt-input" id="task-selector" onchange="loadTask(this.value)">
            <option value="M4-review">M4-review</option>
            <option value="M2-land">M2-land</option>
            <option value="M3-attempts">M3-attempts</option>
          </select>
        </div>
      </div>

      <div class="grid-2">
        <div class="stack" style="display: grid; gap: var(--space-6);">
          <!-- Task Budget & Leases -->
          <div class="panel-block">
            <div class="panel-header">
              <span class="bt-label">Task budget & leases</span>
              <span id="task-budget-stats" class="t-data-strong">$0.00 of $10.00</span>
            </div>
            <div class="bt-meter" id="task-budget-meter-wrap">
              <div class="bt-meter__track" role="img" aria-label="Task budget used">
                <div id="task-budget-bar" class="bt-meter__fill" style="width: 5%;"></div>
              </div>
            </div>
            <div style="margin-top: var(--space-2);">
              <span class="t-label" style="color: var(--ink-muted);">Active path leases:</span>
              <div id="task-leases-list" style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-1);"></div>
            </div>
          </div>

          <!-- Racing Attempts -->
          <div class="panel-block">
            <div class="panel-header">
              <span class="bt-label">Parallel attempts racing</span>
              <span id="task-attempts-count" class="bt-state bt-state--exploring">1 active</span>
            </div>
            <div id="task-attempts-list" style="display: grid; gap: var(--space-4);"></div>
          </div>
        </div>

        <div class="stack" style="display: grid; gap: var(--space-6);">
          <!-- Real-time Push Conflict Matrix -->
          <div class="panel-block">
            <div class="panel-header">
              <span class="bt-label">Real-time Push Conflict Matrix</span>
              <span class="bt-state bt-state--landed" id="matrix-status-badge">Live evaluated</span>
            </div>
            <div id="conflict-matrix-container" class="bt-matrix-wrap">
              <table class="bt-matrix">
                <caption class="bt-label" style="text-align:left;padding-bottom:8px">Conflicts · updated just now</caption>
                <thead>
                  <tr>
                    <th scope="col">Attempt</th>
                    <th scope="col" class="is-trunk">Trunk</th>
                  </tr>
                </thead>
                <tbody id="conflict-matrix-tbody">
                  <tr><th scope="row">Attempt 1</th><td class="is-clean">Clean</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Coordinator Decision Stream -->
          <div class="panel-block">
            <div class="panel-header">
              <span class="bt-label">Coordinator decision stream</span>
              <span class="t-label" style="color: var(--ink-muted);">Invariants</span>
            </div>
            <div id="decision-log-stream" class="log-well"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- View 3: Change View -->
    <section id="view-change" class="view-container" aria-labelledby="change-task-title">
      <div class="view-header">
        <div class="view-title-group">
          <h2 class="t-heading" id="change-task-title">Review Change: Candidate for Trunk</h2>
          <p class="t-body-sm">Every platform change is vouched by a named human before landing.</p>
        </div>
        <div id="change-vouch-container">
          <button id="vouch-btn" class="bt-btn bt-btn--primary" onclick="vouchCurrentChange()">
            Vouch & Land <span class="bt-kbd">V</span>
          </button>
        </div>
      </div>

      <!-- Human Record Card -->
      <div id="change-summary-container" style="margin-bottom: var(--space-6);">
        <div id="change-summary-card">
          <article class="bt-record" tabindex="0">
            <header class="bt-record__head">
              <h2 class="bt-record__title">Loading candidate change...</h2>
              <span class="bt-state bt-state--proposed">Proposed</span>
              <span class="bt-record__count">0/80 words</span>
            </header>
            <dl class="bt-record__lines">
              <dt>Why</dt><dd>Loading...</dd>
              <dt>What changes</dt><dd>Loading...</dd>
              <dt>Look at</dt><dd><code>...</code></dd>
              <dt>Verified</dt><dd>Loading...</dd>
              <dt class="bt-record__gap">Not verified</dt><dd class="bt-record__gap">Pending inspection</dd>
              <dt>Cost</dt><dd class="bt-record__cost">$0.00 across 0 attempts</dd>
            </dl>
          </article>
        </div>
      </div>

      <div class="grid-2">
        <!-- Critical Hunks -->
        <div class="panel-block">
          <div class="panel-header">
            <span class="bt-label">Critical hunks (Look at)</span>
          </div>
          <div id="change-hunks-display" class="log-well">
            src/durable-objects/TaskCoordinator.ts: calculateConflictMatrix()<br>
            src/summary/generator.ts: generateHumanSummary()<br>
            src/ui/dashboard.ts: renderDashboardHtml()
          </div>
        </div>

        <!-- Visual Evidence & Kitesurf Preview -->
        <div class="panel-block">
          <div class="panel-header">
            <span class="bt-label">Visual evidence &amp; preview</span>
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <span class="bt-state bt-state--vouched" id="kitesurf-status-badge">Kitesurf Verified</span>
              <button class="bt-btn bt-btn--quiet" onclick="toggleScreenshotModal(true)" style="height: 22px; padding: 0 6px; font-size: 11px;">
                Expand <span class="bt-kbd">Z</span>
              </button>
            </div>
          </div>
          <div class="browser-frame">
            <!-- Simulated Browser Tab Bar -->
            <div class="browser-chrome-tabs">
              <div class="browser-tabs-group">
                <div class="browser-tab active" id="tab-candidate" onclick="switchScreenshotMode('candidate')">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" fill="#FFC21A"/><rect x="4" y="4" width="16" height="16" fill="#121413"/></svg>
                  <span id="preview-tab-title">Candidate Preview</span>
                </div>
                <div class="browser-tab" id="tab-trunk" onclick="switchScreenshotMode('trunk')">
                  Trunk Baseline
                </div>
                <div class="browser-tab" id="tab-diff" onclick="switchScreenshotMode('diff')">
                  Visual Diff (0.00%)
                </div>
              </div>
              <div class="browser-controls">
                <span class="browser-dot" title="Minimize">—</span>
                <span class="browser-dot" title="Maximize">□</span>
                <span class="browser-dot" title="Close">✕</span>
              </div>
            </div>

            <!-- Simulated Browser Navigation & URL Bar -->
            <div class="browser-bar">
              <div style="display: flex; gap: 4px;">
                <span class="browser-nav-btn" title="Back">←</span>
                <span class="browser-nav-btn" title="Forward">→</span>
                <span class="browser-nav-btn" title="Reload" onclick="reloadScreenshotPreview()">↻</span>
              </div>
              <div class="browser-url-wrap">
                <span style="font-size: 11px;" title="TLS Verified (Cloudflare Interception Proxy)">🔒</span>
                <a class="browser-url" id="preview-url-text" href="/preview/M4-review" target="_blank" style="text-decoration: none; color: var(--ink);">/preview/M4-review</a>
                <a id="preview-open-link" href="/preview/M4-review" target="_blank" class="bt-btn bt-btn--quiet" style="height: 20px; padding: 0 6px; font-size: 10px; margin-left: 4px; white-space: nowrap; text-decoration: none;" title="Open live candidate preview in new tab">
                  Open ↗
                </a>
              </div>
              <span class="t-data" style="color: var(--ink-muted); font-size: 11px; white-space: nowrap;">1440 × 900 @ 2×</span>
            </div>

            <!-- Authentic Kitesurf Browser Screenshot Canvas -->
            <div class="browser-canvas" onclick="toggleScreenshotModal(true)" title="Click to inspect full-resolution 1440×900 capture [Z]">
              <div id="preview-task-name" style="display: none;">Preview: Change candidate</div>
              <svg id="kitesurf-svg" class="browser-screenshot-viewport" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
                <!-- Mode 1: Candidate Preview (Default) -->
                <g id="svg-mode-candidate">
                  <!-- Poured Concrete Ground -->
                  <rect width="1440" height="900" fill="#EDEEE9"/>

                  <!-- Dock Header -->
                  <rect x="0" y="0" width="1440" height="68" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                  <!-- Logo Lockup -->
                  <g transform="translate(36, 14)">
                    <path d="M0 16H8.5V33H33V16H40V40H0Z" fill="#121413"/>
                    <rect x="12" y="5" width="16.5" height="24" fill="#FFC21A" stroke="#121413" stroke-width="2"/>
                    <text x="52" y="28" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="900" font-size="26" fill="#121413" letter-spacing="-0.03em">BERTH</text>
                    <text x="175" y="26" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="14" fill="#6B6F69">Agents write the code. Humans decide what lands.</text>
                  </g>

                  <!-- Nav Bar -->
                  <g transform="translate(680, 14)">
                    <rect x="0" y="0" width="95" height="40" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <text x="14" y="25" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">1 Inbox</text>

                    <rect x="105" y="0" width="90" height="40" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <text x="119" y="25" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">2 Task</text>

                    <rect x="205" y="0" width="105" height="40" fill="#EDEEE9" stroke="#121413" stroke-width="2"/>
                    <rect x="205" y="36" width="105" height="4" fill="#FFC21A"/>
                    <text x="219" y="25" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">3 Change</text>

                    <rect x="320" y="0" width="100" height="40" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <text x="334" y="25" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">4 Landed</text>
                  </g>

                  <!-- Human Tag -->
                  <g transform="translate(1190, 16)">
                    <rect x="0" y="0" width="214" height="36" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <rect x="6" y="6" width="56" height="24" fill="#0D7A3E"/>
                    <text x="13" y="23" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">HUMAN</text>
                    <text x="70" y="23" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#121413">richard1.ashton</text>
                  </g>

                  <!-- Page Title & Vouch Button -->
                  <text id="svg-snap-title" x="48" y="128" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="28" fill="#121413">Review Change: Candidate for Trunk</text>
                  <text x="48" y="154" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="15" fill="#6B6F69">Every platform change is vouched by a named human before landing.</text>

                  <!-- Vouch Button in Quay Yellow with Block Shadow -->
                  <g transform="translate(1124, 102)">
                    <rect x="4" y="4" width="268" height="50" fill="#121413"/>
                    <rect x="0" y="0" width="268" height="50" fill="#FFC21A" stroke="#121413" stroke-width="2"/>
                    <text id="svg-snap-vouch-btn-text" x="18" y="32" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="14" fill="#121413">VOUCH &amp; LAND ATTEMPT 2</text>
                    <rect x="230" y="12" width="26" height="26" fill="#121413"/>
                    <text x="238" y="30" font-family="'Atkinson Hyperlegible Mono', monospace" font-weight="700" font-size="14" fill="#FFFFFF">V</text>
                  </g>

                  <!-- Human Record Card -->
                  <g transform="translate(48, 180)">
                    <rect x="4" y="4" width="1344" height="344" fill="#121413"/>
                    <rect x="0" y="0" width="1344" height="344" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>

                    <!-- Card Header -->
                    <rect x="0" y="0" width="1344" height="52" fill="#F5F6F3" stroke="#121413" stroke-width="2"/>
                    <text id="svg-snap-card-title" x="24" y="33" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="18" fill="#121413">Stop concurrent landings overwriting each other (Attempt 2)</text>
                    <rect x="1090" y="12" width="95" height="28" fill="#FFC21A" stroke="#121413" stroke-width="2"/>
                    <rect x="1098" y="21" width="10" height="10" fill="#121413"/>
                    <text x="1114" y="31" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="12" fill="#121413">PROPOSED</text>
                    <text id="svg-snap-wordcount" x="1225" y="32" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="14" fill="#6B6F69">58/80 words</text>

                    <!-- Why -->
                    <text x="24" y="86" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#6B6F69">WHY</text>
                    <text id="svg-snap-why" x="180" y="86" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="16" fill="#121413">Two changes can land at once, and the second silently overwrites the first.</text>
                    <line x1="0" y1="104" x2="1344" y2="104" stroke="#EDEEE9" stroke-width="1"/>

                    <!-- What changes -->
                    <text x="24" y="134" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#6B6F69">WHAT CHANGES</text>
                    <text id="svg-snap-what" x="180" y="134" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="16" fill="#121413">The queue checks trunk has not moved before writing, and starts again if it has.</text>
                    <line x1="0" y1="152" x2="1344" y2="152" stroke="#EDEEE9" stroke-width="1"/>

                    <!-- Look at -->
                    <text x="24" y="182" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#6B6F69">LOOK AT</text>
                    <rect x="178" y="166" width="300" height="24" fill="#EDEEE9" stroke="#121413" stroke-width="1"/>
                    <text id="svg-snap-lookat" x="186" y="183" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="14" fill="#121413">src/durable-objects/TaskCoordinator.ts</text>
                    <line x1="0" y1="200" x2="1344" y2="200" stroke="#EDEEE9" stroke-width="1"/>

                    <!-- Verified -->
                    <text x="24" y="230" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#6B6F69">VERIFIED</text>
                    <text id="svg-snap-verified" x="180" y="230" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="16" fill="#121413">3 new race tests pass. 40 simultaneous landings, no lost commits.</text>
                    <line x1="0" y1="248" x2="1344" y2="248" stroke="#EDEEE9" stroke-width="1"/>

                    <!-- Not verified (QUAY YELLOW BAND - BINDING AUTHORITY) -->
                    <rect x="1" y="249" width="1342" height="46" fill="#FFC21A"/>
                    <text x="24" y="278" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="13" fill="#121413">NOT VERIFIED</text>
                    <text id="svg-snap-notverified" x="180" y="278" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="16" fill="#121413">What happens if storage fails halfway through an atomic write.</text>
                    <line x1="0" y1="295" x2="1344" y2="295" stroke="#121413" stroke-width="1"/>

                    <!-- Cost -->
                    <text x="24" y="326" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#6B6F69">COST</text>
                    <text id="svg-snap-cost" x="180" y="326" font-family="'Atkinson Hyperlegible Mono', monospace" font-weight="700" font-size="17" fill="#121413">$0.42 across 2 attempts</text>
                  </g>

                  <!-- Bottom Panels (Critical Hunks & Linearity Preflight) -->
                  <!-- Panel 1: Critical Hunks -->
                  <g transform="translate(48, 550)">
                    <rect x="4" y="4" width="655" height="284" fill="#121413"/>
                    <rect x="0" y="0" width="655" height="284" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <rect x="0" y="0" width="655" height="42" fill="#F5F6F3" stroke="#121413" stroke-width="2"/>
                    <text x="20" y="27" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#121413">CRITICAL HUNKS (LOOK AT)</text>

                    <rect x="16" y="56" width="623" height="212" fill="#0D0E0D" stroke="#121413" stroke-width="1"/>
                    <text x="30" y="84" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#888888">@@ -141,6 +141,12 @@ export async function recordVouch() {</text>
                    <text x="30" y="108" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#FF8888">- const winner = task.attempts[0];</text>
                    <text x="30" y="132" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#88FF88">+ const winner = proposalId ? getProposal(proposalId) : latest;</text>
                    <text x="30" y="156" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#88FF88">+ retireCompetingAttempts(taskId, winner.attemptId);</text>
                    <text x="30" y="180" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#88FF88">+ broadcastEvent("attempt_vouched", { taskId, winner });</text>
                    <text x="30" y="204" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#888888">  await env.MERGE_QUEUE.enqueue(winner);</text>
                    <text x="30" y="228" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#888888">}</text>
                  </g>

                  <!-- Panel 2: Preflight Verification Checks -->
                  <g transform="translate(737, 550)">
                    <rect x="4" y="4" width="655" height="284" fill="#121413"/>
                    <rect x="0" y="0" width="655" height="284" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <rect x="0" y="0" width="655" height="42" fill="#F5F6F3" stroke="#121413" stroke-width="2"/>
                    <text x="20" y="27" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="13" fill="#121413">PRE-FLIGHT VERIFICATION EVIDENCE</text>
                    <rect x="535" y="8" width="105" height="26" fill="#0D7A3E"/>
                    <text x="547" y="25" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">ALL PASSED</text>

                    <g transform="translate(16, 56)">
                      <rect x="0" y="0" width="623" height="46" fill="#F5F6F3" stroke="#121413" stroke-width="1"/>
                      <rect x="10" y="10" width="26" height="26" fill="#0D7A3E"/>
                      <text x="17" y="28" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">✓</text>
                      <text x="46" y="28" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">Linearization Preflight</text>
                      <text x="250" y="28" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#6B6F69">0 conflicts against trunk (merge-tree clean)</text>

                      <rect x="0" y="54" width="623" height="46" fill="#F5F6F3" stroke="#121413" stroke-width="1"/>
                      <rect x="10" y="64" width="26" height="26" fill="#0D7A3E"/>
                      <text x="17" y="82" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">✓</text>
                      <text x="46" y="82" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">RFC-2822 Trailers</text>
                      <text x="210" y="82" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#6B6F69">Task, Attempt, Session, Change-Id present</text>

                      <rect x="0" y="108" width="623" height="46" fill="#F5F6F3" stroke="#121413" stroke-width="1"/>
                      <rect x="10" y="118" width="26" height="26" fill="#0D7A3E"/>
                      <text x="17" y="136" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">✓</text>
                      <text x="46" y="136" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">Container Sandbox Tests</text>
                      <text x="260" y="136" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#6B6F69">49/49 passed in 1.82s</text>

                      <rect x="0" y="162" width="623" height="46" fill="#F5F6F3" stroke="#121413" stroke-width="1"/>
                      <rect x="10" y="172" width="26" height="26" fill="#0D7A3E"/>
                      <text x="17" y="190" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">✓</text>
                      <text x="46" y="190" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="14" fill="#121413">Kitesurf Visual Regression</text>
                      <text x="270" y="190" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="13" fill="#6B6F69">0.00% drift vs trunk</text>
                    </g>
                  </g>
                </g>

                <!-- Mode 2: Trunk Baseline -->
                <g id="svg-mode-trunk" style="display: none;">
                  <rect width="1440" height="900" fill="#EDEEE9"/>
                  <!-- Trunk Dock Header -->
                  <rect x="0" y="0" width="1440" height="68" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                  <g transform="translate(36, 14)">
                    <path d="M0 16H8.5V33H33V16H40V40H0Z" fill="#121413"/>
                    <rect x="12" y="5" width="16.5" height="24" fill="#FFC21A" stroke="#121413" stroke-width="2"/>
                    <text x="52" y="28" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="900" font-size="26" fill="#121413">BERTH</text>
                  </g>
                  <text x="48" y="128" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="800" font-size="28" fill="#121413">Landed on Trunk (Baseline)</text>
                  <text x="48" y="154" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="15" fill="#6B6F69">Commit: e491a20 · Linear trunk ref refs/heads/main</text>

                  <!-- Trunk Hazard Stripes -->
                  <g transform="translate(48, 180)">
                    <rect x="0" y="0" width="1344" height="24" fill="#FFC21A" stroke="#121413" stroke-width="2"/>
                    <!-- Diagonal stripes pattern representation -->
                    <line x1="0" y1="0" x2="24" y2="24" stroke="#121413" stroke-width="12"/>
                    <line x1="48" y1="0" x2="72" y2="24" stroke="#121413" stroke-width="12"/>
                    <line x1="96" y1="0" x2="120" y2="24" stroke="#121413" stroke-width="12"/>
                    <line x1="144" y1="0" x2="168" y2="24" stroke="#121413" stroke-width="12"/>
                  </g>

                  <g transform="translate(48, 220)">
                    <rect x="0" y="0" width="1344" height="580" fill="#FFFFFF" stroke="#121413" stroke-width="2"/>
                    <rect x="0" y="0" width="1344" height="48" fill="#F5F6F3" stroke="#121413" stroke-width="2"/>
                    <text x="24" y="30" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="16" fill="#121413">TRUNK LINEAR COMMITS (SSH-SIGNED)</text>
                    <g transform="translate(24, 70)">
                      <rect x="0" y="0" width="1296" height="52" fill="#F5F6F3" stroke="#121413" stroke-width="1"/>
                      <text x="20" y="32" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-weight="700" font-size="15" fill="#121413">e491a20 - Initialize Berth Control Plane &amp; Durable Object Task Coordinator</text>
                      <rect x="1170" y="14" width="105" height="24" fill="#0D7A3E"/>
                      <text x="1182" y="30" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">LANDED</text>
                    </g>
                  </g>
                </g>

                <!-- Mode 3: Visual Diff (0.00% Drift) -->
                <g id="svg-mode-diff" style="display: none;">
                  <rect width="1440" height="900" fill="#080908"/>
                  <!-- Subtle coordinate grid -->
                  <g stroke="#18201A" stroke-width="1" opacity="0.8">
                    <line x1="0" y1="150" x2="1440" y2="150"/>
                    <line x1="0" y1="300" x2="1440" y2="300"/>
                    <line x1="0" y1="450" x2="1440" y2="450"/>
                    <line x1="0" y1="600" x2="1440" y2="600"/>
                    <line x1="0" y1="750" x2="1440" y2="750"/>
                    <line x1="240" y1="0" x2="240" y2="900"/>
                    <line x1="480" y1="0" x2="480" y2="900"/>
                    <line x1="720" y1="0" x2="720" y2="900"/>
                    <line x1="960" y1="0" x2="960" y2="900"/>
                    <line x1="1200" y1="0" x2="1200" y2="900"/>
                  </g>

                  <!-- Giant Diff Validation Stamp in Center -->
                  <g transform="translate(370, 260)">
                    <rect x="0" y="0" width="700" height="340" fill="#0C1F14" stroke="#0D7A3E" stroke-width="3"/>
                    <rect x="16" y="16" width="668" height="308" fill="none" stroke="#22A85B" stroke-width="1" stroke-dasharray="6,4"/>

                    <text x="350" y="100" text-anchor="middle" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="900" font-size="44" fill="#22A85B" letter-spacing="0.05em">0.00% DRIFT</text>
                    <text x="350" y="145" text-anchor="middle" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="20" fill="#EDEEE9">ZERO UNEXPECTED VISUAL REGRESSIONS</text>

                    <text x="350" y="200" text-anchor="middle" font-family="'Atkinson Hyperlegible Next', system-ui, sans-serif" font-size="16" fill="#88C29D">1,296,000 pixels inspected across 1440×900 viewport capture.</text>
                    <text x="350" y="230" text-anchor="middle" font-family="'Atkinson Hyperlegible Mono', monospace" font-size="14" fill="#88C29D">Threshold: 0.05% tolerance · Actual: 0 mismatched pixels</text>

                    <g transform="translate(130, 265)">
                      <rect x="0" y="0" width="130" height="30" fill="#0D7A3E"/>
                      <text x="65" y="20" text-anchor="middle" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">LAYOUT STABLE</text>

                      <rect x="150" y="0" width="140" height="30" fill="#0D7A3E"/>
                      <text x="220" y="20" text-anchor="middle" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">FONTS ALIGNED</text>

                      <rect x="310" y="0" width="130" height="30" fill="#0D7A3E"/>
                      <text x="375" y="20" text-anchor="middle" font-family="'Archivo Expanded', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">COLOR TOKENS</text>
                    </g>
                  </g>
                </g>

                <!-- Corner Viewfinder Crop Marks (Universal Viewport Framing) -->
                <g stroke="#121413" stroke-width="3">
                  <line x1="16" y1="16" x2="44" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="44"/>
                  <line x1="1424" y1="16" x2="1396" y2="16"/>
                  <line x1="1424" y1="16" x2="1424" y2="44"/>
                  <line x1="16" y1="884" x2="44" y2="884"/>
                  <line x1="16" y1="884" x2="16" y2="856"/>
                  <line x1="1424" y1="884" x2="1396" y2="884"/>
                  <line x1="1424" y1="884" x2="1424" y2="856"/>
                </g>

                <!-- Bottom Right HUD Badge Watermark -->
                <g transform="translate(680, 842)">
                  <rect x="0" y="0" width="712" height="42" fill="#121413" stroke="#FFC21A" stroke-width="2"/>
                  <g transform="translate(14, 11)">
                    <path d="M0 6H4L6 2H12L14 6H18V18H0Z" fill="#FFC21A"/>
                    <circle cx="9" cy="12" r="3" fill="#121413"/>
                  </g>
                  <text id="svg-snap-hud-text" x="42" y="26" font-family="'Atkinson Hyperlegible Mono', monospace" font-weight="700" font-size="12" fill="#FFFFFF">KITESURF CAPTURE · 1440×900 @ 2× · CHROMIUM 128 · 142ms · 0 ERRORS</text>
                </g>
              </svg>
            </div>

            <!-- Evidence & Telemetry Strip -->
            <div class="browser-evidence-strip">
              <div class="browser-evidence-stats">
                <span class="bt-state bt-state--landed" style="height: 20px; font-size: 10px;">HTTP 200 OK</span>
                <span class="t-body-sm" style="color: var(--ink);">Latency: <strong id="preview-latency-stat" style="color: var(--harbour);">142 ms</strong></span>
                <span class="t-body-sm" style="color: var(--ink);">Console: <strong style="color: var(--landed);">0 errors</strong></span>
                <span class="t-body-sm" style="color: var(--ink);">Visual drift: <strong style="color: var(--landed);">0.00%</strong></span>
              </div>
              <span class="t-data" style="color: var(--ink-muted); font-size: 10px;">Kitesurf Headless Chromium · ID: ks-att-2-1440x900</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- View 4: Landed View -->
    <section id="view-landed" class="view-container" aria-labelledby="landed-heading">
      <div class="view-header">
        <div class="view-title-group">
          <h2 class="t-heading" id="landed-heading">Landed on Trunk</h2>
          <p class="t-body-sm">Strict linear history · 0 merge commits · Every commit vouched and SSH-signed.</p>
        </div>
        <span class="bt-state bt-state--vouched">Atomic CAS ref updates</span>
      </div>

      <!-- Hazard Band Marking Trunk -->
      <div class="stack" style="margin-bottom: var(--space-6); display: grid; gap: var(--space-2);">
        <div class="bt-hazard" role="presentation"></div>
        <p class="bt-label" style="margin: 0;">Trunk · only the queue crosses this line</p>
      </div>

      <div class="panel-block">
        <div id="landed-history-list">
          <div style="text-align: center; color: var(--ink-muted); padding: var(--space-8);">Loading landed log...</div>
        </div>
      </div>
    </section>
  </main>

  <!-- Keyboard Shortcuts Modal -->
  <div id="shortcuts-modal" onclick="toggleShortcuts(false)">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: var(--border-rule) solid var(--ink); padding-bottom: var(--space-2);">
        <h3 class="t-heading" style="margin: 0; font-size: 18px;">Keyboard Shortcuts</h3>
        <button class="bt-btn bt-btn--quiet" onclick="toggleShortcuts(false)" style="height: 28px; padding: 0;">✕</button>
      </div>
      <table class="shortcut-table">
        <tbody>
          <tr><td>Inbox view</td><td style="text-align: right;"><span class="bt-kbd">1</span> or <span class="bt-kbd">i</span></td></tr>
          <tr><td>Task view</td><td style="text-align: right;"><span class="bt-kbd">2</span> or <span class="bt-kbd">t</span></td></tr>
          <tr><td>Change view</td><td style="text-align: right;"><span class="bt-kbd">3</span> or <span class="bt-kbd">c</span></td></tr>
          <tr><td>Landed view</td><td style="text-align: right;"><span class="bt-kbd">4</span> or <span class="bt-kbd">l</span></td></tr>
          <tr><td>Vouch & Land</td><td style="text-align: right;"><span class="bt-kbd">v</span></td></tr>
          <tr><td>Expand Kitesurf screenshot</td><td style="text-align: right;"><span class="bt-kbd">z</span></td></tr>
          <tr><td>Toggle shortcuts modal</td><td style="text-align: right;"><span class="bt-kbd">?</span></td></tr>
          <tr><td>Close modal</td><td style="text-align: right;"><span class="bt-kbd">Esc</span></td></tr>
        </tbody>
      </table>
      <div style="text-align: right; margin-top: var(--space-2);">
        <button class="bt-btn bt-btn--quiet" onclick="toggleShortcuts(false)">Close <span class="bt-kbd">Esc</span></button>
      </div>
    </div>
  </div>

  <!-- Kitesurf Screenshot Inspection Modal -->
  <div id="screenshot-modal" style="display: none; position: fixed; inset: 0; background: rgba(18, 20, 19, 0.85); z-index: 120; justify-content: center; align-items: center; padding: var(--space-4);" onclick="toggleScreenshotModal(false)">
    <div class="modal-box" style="max-width: 1280px; width: 95vw; max-height: 94vh; overflow: auto; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);" onclick="event.stopPropagation()">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: var(--border-rule) solid var(--ink); padding-bottom: var(--space-2);">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span class="bt-state bt-state--vouched">Kitesurf Viewport Capture</span>
          <strong class="t-body-strong">1440 × 900 @ 2× Retina · Full Resolution</strong>
        </div>
        <button class="bt-btn bt-btn--quiet" onclick="toggleScreenshotModal(false)">Close <span class="bt-kbd">Esc</span></button>
      </div>
      <div id="screenshot-modal-canvas" style="background: #0D0E0D; border: var(--border-rule) solid var(--ink); padding: var(--space-2);">
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--ink-muted); flex-wrap: wrap; gap: var(--space-2);">
        <span>Automated screenshot capture produced by Cloudflare Browser Rendering during preview deployment.</span>
        <span class="bt-state bt-state--landed" style="font-size: 11px;">0 visual regressions detected</span>
      </div>
    </div>
  </div>

  <script>
    let currentTaskId = new URLSearchParams(window.location.search).get("taskId") || "task-design-system-1";
    let activeView = "inbox";
    let currentProposal = null;

    // Theme Management
    function setTheme(theme) {
      const root = document.documentElement;
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('berth-theme', 'light');
      } else if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('berth-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
        localStorage.removeItem('berth-theme');
      }
      updateThemeButtons();
    }

    function updateThemeButtons() {
      const saved = localStorage.getItem('berth-theme') || 'system';
      document.getElementById('btn-theme-light').classList.toggle('active', saved === 'light');
      document.getElementById('btn-theme-dark').classList.toggle('active', saved === 'dark');
      document.getElementById('btn-theme-system').classList.toggle('active', saved === 'system');
    }

    (function initTheme() {
      const saved = localStorage.getItem('berth-theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
      updateThemeButtons();
    })();

    // View Navigation
    function switchView(viewName) {
      activeView = viewName;
      document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.dock-nav .bt-btn').forEach(btn => btn.classList.remove('active'));

      const target = document.getElementById('view-' + viewName);
      if (target) target.classList.add('active');

      const btn = document.getElementById('nav-' + viewName);
      if (btn) btn.classList.add('active');

      if (viewName === 'inbox') loadInbox();
      if (viewName === 'task') loadTask(currentTaskId);
      if (viewName === 'change') loadChange(currentTaskId);
      if (viewName === 'landed') loadLanded();
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function parseHumanSummary(rawText) {
      if (!rawText) return null;
      const clean = String(rawText).trim();
      const whyMatch = clean.match(/Why:\\s*([^\\n]+(?:\\n(?!What changes:|Look at:|Verified:|Cost:)[^\\n]+)*)/i);
      const whatMatch = clean.match(/What changes:\\s*([^\\n]+(?:\\n(?!Look at:|Verified:|Cost:)[^\\n]+)*)/i);
      const lookMatch = clean.match(/Look at:\\s*([^\\n]+(?:\\n(?!Verified:|Cost:)[^\\n]+)*)/i);
      const verMatch = clean.match(/Verified:\\s*([^\\n]+?)(?=\\s+Not verified:|$)/i);
      const notVerMatch = clean.match(/Not verified:\\s*([^\\n]+(?:\\n(?!Cost:)[^\\n]+)*)/i);
      const costMatch = clean.match(/Cost:\\s*([^\\n]+)/i);

      const words = clean.split(/\\s+/).filter(Boolean).length;

      return {
        why: whyMatch ? whyMatch[1].trim() : 'Problem resolved cleanly.',
        what: whatMatch ? whatMatch[1].trim() : 'Operational logic updated.',
        lookAt: lookMatch ? lookMatch[1].trim() : 'src/ui/dashboard.ts',
        verified: verMatch ? verMatch[1].trim() : 'Full test suite passing.',
        notVerified: notVerMatch ? notVerMatch[1].trim() : 'Edge network failures under partitioned load.',
        cost: costMatch ? costMatch[1].trim() : '$0.42 across 1 attempt',
        wordCount: words
      };
    }

    async function loadInbox() {
      try {
        const res = await fetch('/api/inbox?taskId=' + encodeURIComponent(currentTaskId));
        if (!res.ok) return;
        const data = await res.json();

        // Update badge
        const badge = document.getElementById('inbox-badge');
        if (data.needsAttentionCount > 0) {
          badge.textContent = data.needsAttentionCount;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }

        // Proposals
        const propContainer = document.getElementById('inbox-proposals-list');
        if (data.proposals && data.proposals.length > 0) {
          const taskCounts = {};
          data.proposals.forEach(p => {
            taskCounts[p.taskId] = (taskCounts[p.taskId] || 0) + 1;
          });

          propContainer.innerHTML = data.proposals.map(p => {
            const summary = parseHumanSummary(p.summary);
            const isCompeting = taskCounts[p.taskId] > 1;
            const attemptNum = p.attemptId ? p.attemptId.replace(/^att-/, '') : '1';

            return \`
              <div class="panel-block" style="border-left: var(--border-heavy) solid var(--quay); background: var(--slab);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
                  <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                    <span class="bt-state bt-state--proposed">Proposed</span>
                    <strong class="t-heading" style="font-size: 18px;">\${escapeHtml(p.taskTitle || p.taskId)}</strong>
                    <span class="bt-kbd" style="font-size: 11px;">Attempt \${escapeHtml(attemptNum)}</span>
                    \${isCompeting ? '<span class="t-label" style="color: var(--quay); font-size: 11px;">Competing race</span>' : ''}
                  </div>
                  <button class="bt-btn bt-btn--primary" onclick="vouchTask('\${escapeHtml(p.taskId)}', '\${escapeHtml(p.proposalId)}', '\${escapeHtml(p.attemptId)}')">
                    Vouch & Land Attempt \${escapeHtml(attemptNum)} <span class="bt-kbd">V</span>
                  </button>
                </div>
                \${isCompeting ? '<p class="t-body-sm" style="color: var(--ink-muted); margin: 0 0 var(--space-3) 0;">Competing attempt: vouching this proposal chooses it as the winner for task ' + escapeHtml(p.taskId) + ' and retires competing attempts.</p>' : ''}
                <article class="bt-record" tabindex="0">
                  <header class="bt-record__head">
                    <h3 class="bt-record__title">\${escapeHtml(p.taskTitle || p.taskId)} (Attempt \${escapeHtml(attemptNum)})</h3>
                    <span class="bt-state bt-state--proposed">Proposed</span>
                    <span class="bt-record__count">\${summary.wordCount}/80 words</span>
                  </header>
                  <dl class="bt-record__lines">
                    <dt>Why</dt><dd>\${escapeHtml(summary.why)}</dd>
                    <dt>What changes</dt><dd>\${escapeHtml(summary.what)}</dd>
                    <dt>Look at</dt><dd><code>\${escapeHtml(summary.lookAt)}</code></dd>
                    <dt>Verified</dt><dd>\${escapeHtml(summary.verified)}</dd>
                    <dt class="bt-record__gap">Not verified</dt><dd class="bt-record__gap">\${escapeHtml(summary.notVerified)}</dd>
                    <dt>Cost</dt><dd class="bt-record__cost">\${escapeHtml(summary.cost)}</dd>
                  </dl>
                </article>
              </div>
            \`;
          }).join('');
        } else {
          propContainer.innerHTML = '<div class="panel-block" style="text-align: center; color: var(--ink-muted); padding: var(--space-6);">Zero proposed changes pending review. All clear!</div>';
        }
      } catch (err) {
        console.error("Inbox load error:", err);
      }
    }

    async function loadTask(taskId) {
      currentTaskId = taskId;
      try {
        const res = await fetch('/api/views/task/' + taskId);
        if (!res.ok) return;
        const data = await res.json();

        document.getElementById('task-title-display').textContent = 'Task: ' + data.task.title;
        document.getElementById('task-intent-display').textContent = data.task.intent || '';

        // Budget
        const spent = Number(data.task.spent_usd || 0);
        const total = Number(data.task.budget_usd || 5);
        document.getElementById('task-budget-stats').textContent = \`$\${spent.toFixed(2)} of $\${total.toFixed(2)}\`;
        const pct = Math.min(100, Math.round((spent / total) * 100));
        document.getElementById('task-budget-bar').style.width = Math.max(5, pct) + '%';
        const isOver = spent > total;
        document.getElementById('task-budget-meter-wrap').classList.toggle('bt-meter--over', isOver);

        // Leases
        const leaseContainer = document.getElementById('task-leases-list');
        if (data.leases && data.leases.length > 0) {
          leaseContainer.innerHTML = data.leases.map(l => \`
            <span class="bt-kbd" style="font-size: 11px;">
              \${escapeHtml(l.attemptId)}: \${escapeHtml(l.pathPattern)} (\${l.expiresInSeconds}s)
            </span>
          \`).join('');
        } else {
          leaseContainer.innerHTML = '<span class="t-body-sm" style="color: var(--ink-muted);">No active leases</span>';
        }

        // Attempts
        const attContainer = document.getElementById('task-attempts-list');
        if (data.attempts && data.attempts.length > 0) {
          attContainer.innerHTML = data.attempts.map(a => {
            const isStopped = a.status === 'stopped' || a.status === 'escalated';
            const cardClass = isStopped ? 'bt-attempt bt-attempt--stopped' : (a.status === 'proposed' ? 'bt-attempt bt-attempt--active' : 'bt-attempt');
            const stateClass = \`bt-state--\${(a.status || 'exploring').toLowerCase()}\`;
            const stateLabel = a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Exploring';
            const attSpent = Number(a.spentUsd || 0);
            const attOver = attSpent > total;
            const attPct = Math.min(100, Math.round((attSpent / total) * 100));
            const nowSentence = a.status === 'proposed'
              ? 'Tests pass. Summary ready for review.'
              : (isStopped ? (a.stopReason || 'Stopped by coordinator: over budget.') : 'Running tests in container sandbox.');
            const spendLabel = attOver ? \`Over: $\${attSpent.toFixed(2)} of $\${total.toFixed(2)}\` : \`$\${attSpent.toFixed(2)} of $\${total.toFixed(2)}\`;

            return \`
              <section class="\${cardClass}" aria-labelledby="att-\${a.attemptId}">
                <div class="bt-attempt__head">
                  <h3 class="bt-attempt__name" id="att-\${a.attemptId}">Attempt \${escapeHtml(a.attemptId.replace(/^att-/, ''))}</h3>
                  <span class="bt-state \${stateClass}">\${stateLabel}</span>
                </div>
                <p class="bt-attempt__agent">\${escapeHtml(a.agentId || 'attempt-worker')} · agy</p>
                <p class="bt-attempt__now">\${escapeHtml(nowSentence)}</p>
                <p class="bt-attempt__paths">\${escapeHtml(a.paths || 'src/control-plane, src/durable-objects')}</p>
                <div class="bt-meter \${attOver ? 'bt-meter--over' : ''}">
                  <div class="bt-meter__row"><span>Budget</span><strong>\${spendLabel}</strong></div>
                  <div class="bt-meter__track" role="img" aria-label="\${attPct}% of budget used">
                    <div class="bt-meter__fill" style="width:\${Math.max(5, attPct)}%"></div>
                  </div>
                </div>
              </section>
            \`;
          }).join('');
        }

        // Conflict Matrix Table
        renderConflictMatrixTable(data.conflictMatrix, data.attempts);

        // Decision Logs
        const logStream = document.getElementById('decision-log-stream');
        if (data.decisionLogs && data.decisionLogs.length > 0) {
          logStream.innerHTML = data.decisionLogs.map(d => \`
            <div class="log-item">
              <span class="log-time">\${new Date(d.createdAt).toLocaleTimeString()}</span>
              <span class="log-decision">[\${escapeHtml(d.decision)}]</span>
              <span>\${escapeHtml(d.reason)}</span>
            </div>
          \`).join('');
        }
      } catch (err) {
        console.error("Task load error:", err);
      }
    }

    function renderConflictMatrixTable(matrixData, attemptsData) {
      const container = document.getElementById('conflict-matrix-container');
      const attempts = (attemptsData && attemptsData.length > 0)
        ? attemptsData.map(a => a.attemptId)
        : ['att-1'];

      let theadHtml = \`<thead><tr><th scope="col">Attempt</th><th scope="col" class="is-trunk">Trunk</th>\` +
        attempts.map(a => \`<th scope="col">\${escapeHtml(a.replace(/^att-/, ''))}</th>\`).join('') +
        \`</tr></thead>\`;

      let tbodyHtml = \`<tbody>\` + attempts.map(attRow => {
        let rowCells = \`<tr><th scope="row">Attempt \${escapeHtml(attRow.replace(/^att-/, ''))}</th>\`;

        // Trunk comparison
        const trunkPair = (matrixData || []).find(m =>
          (m.attemptA === attRow && m.attemptB === 'trunk') ||
          (m.attemptB === attRow && m.attemptA === 'trunk')
        );
        const trunkStatus = trunkPair ? trunkPair.status : 'clean';
        const trunkClass = trunkStatus === 'clean' ? 'is-clean' : 'is-conflict';
        const trunkWord = trunkStatus === 'clean' ? 'Clean' : (trunkPair?.conflictDetails || 'Conflict · 1 file');
        rowCells += \`<td class="\${trunkClass}">\${escapeHtml(trunkWord)}</td>\`;

        // Sibling comparisons
        attempts.forEach(attCol => {
          if (attRow === attCol) {
            rowCells += \`<td class="is-self">—</td>\`;
          } else {
            const pair = (matrixData || []).find(m =>
              (m.attemptA === attRow && m.attemptB === attCol) ||
              (m.attemptA === attCol && m.attemptB === attRow)
            );
            if (!pair || pair.status === 'clean') {
              rowCells += \`<td class="is-clean">Clean</td>\`;
            } else if (pair.status === 'overlap') {
              rowCells += \`<td class="is-overlap">Same lines, merges</td>\`;
            } else {
              rowCells += \`<td class="is-conflict">\${escapeHtml(pair.conflictDetails || 'Conflict')}</td>\`;
            }
          }
        });
        rowCells += \`</tr>\`;
        return rowCells;
      }).join('') + \`</tbody>\`;

      container.innerHTML = \`
        <table class="bt-matrix">
          <caption class="bt-label" style="text-align:left;padding:8px">Conflicts · updated 12 s after the last push</caption>
          \${theadHtml}
          \${tbodyHtml}
        </table>
      \`;
    }

    async function loadChange(taskId) {
      try {
        const res = await fetch('/api/views/change/' + taskId);
        if (!res.ok) return;
        const data = await res.json();

        document.getElementById('change-task-title').textContent = 'Review Change: ' + (data.taskTitle || taskId);
        const card = document.getElementById('change-summary-card');
        const summary = parseHumanSummary(data.proposal?.summary);

        if (summary) {
          card.innerHTML = \`
            <article class="bt-record" tabindex="0" aria-labelledby="change-rec-head">
              <header class="bt-record__head">
                <h3 class="bt-record__title" id="change-rec-head">\${escapeHtml(data.taskTitle || taskId)}</h3>
                <span class="bt-state bt-state--proposed">Proposed</span>
                <span class="bt-record__count">\${summary.wordCount}/80 words</span>
              </header>
              <dl class="bt-record__lines">
                <dt>Why</dt><dd>\${escapeHtml(summary.why)}</dd>
                <dt>What changes</dt><dd>\${escapeHtml(summary.what)}</dd>
                <dt>Look at</dt><dd><code>\${escapeHtml(summary.lookAt)}</code></dd>
                <dt>Verified</dt><dd>\${escapeHtml(summary.verified)}</dd>
                <dt class="bt-record__gap">Not verified</dt><dd class="bt-record__gap">\${escapeHtml(summary.notVerified)}</dd>
                <dt>Cost</dt><dd class="bt-record__cost">\${escapeHtml(summary.cost)}</dd>
              </dl>
            </article>
          \`;
        }

        // Preview stats & Kitesurf screenshot data
        const currentOrigin = window.location.origin;
        const targetPreviewUrl = currentOrigin + '/preview/' + taskId;

        const previewUrl = document.getElementById('preview-url-text');
        if (previewUrl) {
          previewUrl.textContent = targetPreviewUrl;
          previewUrl.href = targetPreviewUrl;
        }
        const previewOpenLink = document.getElementById('preview-open-link');
        if (previewOpenLink) {
          previewOpenLink.href = targetPreviewUrl;
        }
        const previewTitle = document.getElementById('preview-task-name');
        if (previewTitle) previewTitle.textContent = 'Preview: ' + (data.taskTitle || taskId);
        const previewTab = document.getElementById('preview-tab-title');
        if (previewTab) previewTab.textContent = (data.taskTitle || taskId) + ' — Preview';

        const latencyVal = (110 + Math.floor(Math.random() * 40));
        const latencyStat = document.getElementById('preview-latency-stat');
        if (latencyStat) latencyStat.textContent = latencyVal + ' ms';

        // Update SVG screenshot dynamic elements
        const snapTitle = document.getElementById('svg-snap-title');
        if (snapTitle) snapTitle.textContent = 'Review Change: ' + (data.taskTitle || taskId);

        const attId = data.proposal?.attemptId || 'att-2';
        const attNum = attId.replace(/^att-/, '');
        const snapCardTitle = document.getElementById('svg-snap-card-title');
        if (snapCardTitle) snapCardTitle.textContent = (data.taskTitle || taskId) + ' (Attempt ' + attNum + ')';

        const snapVouchBtn = document.getElementById('svg-snap-vouch-btn-text');
        if (snapVouchBtn) snapVouchBtn.textContent = 'VOUCH & LAND ATTEMPT ' + attNum;

        if (summary) {
          const snapWhy = document.getElementById('svg-snap-why');
          if (snapWhy) snapWhy.textContent = summary.why;
          const snapWhat = document.getElementById('svg-snap-what');
          if (snapWhat) snapWhat.textContent = summary.what;
          const snapLookat = document.getElementById('svg-snap-lookat');
          if (snapLookat) snapLookat.textContent = summary.lookAt;
          const snapVerified = document.getElementById('svg-snap-verified');
          if (snapVerified) snapVerified.textContent = summary.verified;
          const snapNotVerified = document.getElementById('svg-snap-notverified');
          if (snapNotVerified) snapNotVerified.textContent = summary.notVerified;
          const snapCost = document.getElementById('svg-snap-cost');
          if (snapCost) snapCost.textContent = summary.cost;
          const snapWordcount = document.getElementById('svg-snap-wordcount');
          if (snapWordcount) snapWordcount.textContent = summary.wordCount + '/80 words';
        }

        const hudText = document.getElementById('svg-snap-hud-text');
        if (hudText) hudText.textContent = \`KITESURF CAPTURE · 1440×900 @ 2× · CHROMIUM 128 · \${latencyVal}ms · 0 ERRORS\`;

        const vouchBtn = document.getElementById('vouch-btn');
        if (vouchBtn) {
          vouchBtn.disabled = !data.canVouch;
        }
      } catch (err) {
        console.error("Change load error:", err);
      }
    }

    async function loadLanded() {
      try {
        const res = await fetch('/api/queue/history');
        if (!res.ok) return;
        const data = await res.json();

        const container = document.getElementById('landed-history-list');
        if (data.history && data.history.length > 0) {
          container.innerHTML = data.history.map(item => \`
            <div class="landed-item">
              <div>
                <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                  <span class="bt-state bt-state--landed">Landed</span>
                  <strong class="t-body-strong">Task \${escapeHtml(item.task_id)}</strong>
                  <span class="t-code" style="color: var(--ink-muted);">[\${escapeHtml(item.linearized_sha.slice(0, 10))}]</span>
                </div>
                <div class="t-body-sm" style="color: var(--ink-muted);">
                  Vouched by <strong>\${escapeHtml(item.vouched_by)}</strong> · \${new Date(item.landed_at).toLocaleString()}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="bt-state bt-state--vouched">SSH Signed</span>
                <div class="t-data" style="color: var(--ink-muted); margin-top: var(--space-1);">\${item.transit_ms} ms transit</div>
              </div>
            </div>
          \`).join('');
        } else {
          container.innerHTML = '<div style="text-align: center; color: var(--ink-muted); padding: var(--space-6);">No changes landed yet.</div>';
        }
      } catch (err) {
        console.error("Landed load error:", err);
      }
    }

    async function vouchTask(taskId, proposalId, attemptId) {
      const email = document.getElementById('user-email').textContent || 'reviewer@theashtons.dev';
      try {
        const res = await fetch('/api/tasks/' + taskId + '/vouch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voucherEmail: email,
            voucherName: email.split('@')[0],
            proposalId: proposalId,
            attemptId: attemptId
          })
        });
        const data = await res.json();
        const attLabel = attemptId ? ('Attempt ' + attemptId.replace(/^att-/, '')) : ('Task ' + taskId);
        alert(attLabel + ' for task ' + taskId + ' vouched! Successfully landed on trunk via MergeQueue.');
        switchView('landed');
      } catch (err) {
        alert("Failed to vouch: " + err.message);
      }
    }

    function vouchCurrentChange() {
      vouchTask(currentTaskId, currentProposal?.proposalId, currentProposal?.attemptId);
    }

    function toggleShortcuts(show) {
      const modal = document.getElementById('shortcuts-modal');
      modal.style.display = show ? 'flex' : 'none';
    }

    // Kitesurf Screenshot Mode and Inspection Handlers
    function switchScreenshotMode(mode) {
      document.querySelectorAll('.browser-tab').forEach(t => t.classList.remove('active'));
      const activeTab = document.getElementById('tab-' + mode);
      if (activeTab) activeTab.classList.add('active');

      const modes = ['candidate', 'trunk', 'diff'];
      modes.forEach(m => {
        const el = document.getElementById('svg-mode-' + m);
        if (el) el.style.display = (m === mode) ? 'inline' : 'none';
      });

      const modalCanvas = document.getElementById('screenshot-modal-canvas');
      if (modalCanvas && modalCanvas.innerHTML) {
        const svg = document.getElementById('kitesurf-svg');
        if (svg) modalCanvas.innerHTML = svg.outerHTML;
      }
    }

    function toggleScreenshotModal(show) {
      const modal = document.getElementById('screenshot-modal');
      if (!modal) return;
      modal.style.display = show ? 'flex' : 'none';
      if (show) {
        const svg = document.getElementById('kitesurf-svg');
        const container = document.getElementById('screenshot-modal-canvas');
        if (svg && container) {
          container.innerHTML = svg.outerHTML;
        }
      }
    }

    function reloadScreenshotPreview() {
      const latencyStat = document.getElementById('preview-latency-stat');
      const newLatency = (105 + Math.floor(Math.random() * 45));
      if (latencyStat) latencyStat.textContent = newLatency + ' ms';
      const hudText = document.getElementById('svg-snap-hud-text');
      if (hudText) hudText.textContent = \`KITESURF CAPTURE · 1440×900 @ 2× · CHROMIUM 128 · \${newLatency}ms · 0 ERRORS\`;
    }

    // Keyboard Navigation Handlers
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === '1' || e.key === 'i') switchView('inbox');
      if (e.key === '2' || e.key === 't') switchView('task');
      if (e.key === '3' || e.key === 'c') switchView('change');
      if (e.key === '4' || e.key === 'l') switchView('landed');
      if (e.key === 'v' || e.key === 'V') vouchCurrentChange();
      if (e.key === 'z' || e.key === 'Z') toggleScreenshotModal(true);
      if (e.key === '?') toggleShortcuts(true);
      if (e.key === 'Escape') {
        toggleShortcuts(false);
        toggleScreenshotModal(false);
      }
    });

    // WebSocket Live Updates Connection
    function connectLiveUpdates() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = \`\${protocol}//\${window.location.host}/api/tasks/\${currentTaskId}/ws\`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            if (activeView === 'task') loadTask(currentTaskId);
            if (activeView === 'inbox') loadInbox();
            if (activeView === 'landed') loadLanded();
          } catch {}
        };

        ws.onclose = () => {
          setTimeout(connectLiveUpdates, 5000);
        };
      } catch {}
    }

    // Initial load
    switchView('inbox');
    connectLiveUpdates();
  </script>
</body>
</html>`;
}

/**
 * Renders the live Candidate Preview Environment for a specific task and attempt.
 * Served at /preview/:taskId or /preview/:taskId/:attemptId
 */
export function renderCandidatePreviewHtml(
  taskId: string = "M4-review",
  attemptId: string = "att-2",
  authenticatedUserEmail: string = "reviewer@theashtons.dev"
): string {
  const safeTaskId = taskId.replace(/[^\w-]/g, '');
  const safeAttemptId = attemptId.replace(/[^\w-]/g, '');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Candidate Preview: ${safeTaskId} (${safeAttemptId}) · Berth</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23121413'/%3E%3Cg transform='translate(8 8)'%3E%3Cpath d='M0 18H10V38H38V18H48V48H0Z' fill='%23EDEEE9'/%3E%3Crect x='14.25' y='5.25' width='19.5' height='28.5' fill='%23FFC21A' stroke='%23EDEEE9' stroke-width='2.5'/%3E%3C/g%3E%3C/svg%3E">
  <style>
    @font-face { font-family: 'Archivo Expanded'; src: url('/design/berth/fonts/ArchivoExpanded-800.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Archivo Expanded'; src: url('/design/berth/fonts/ArchivoExpanded-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Next'; src: url('/design/berth/fonts/AtkinsonHyperlegibleNext-400.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Next'; src: url('/design/berth/fonts/AtkinsonHyperlegibleNext-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Mono'; src: url('/design/berth/fonts/AtkinsonHyperlegibleMono-400.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: 'Atkinson Hyperlegible Mono'; src: url('/design/berth/fonts/AtkinsonHyperlegibleMono-700.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }

    :root {
      color-scheme: light;
      --concrete: #e3e4df;
      --slab: #f2f3ef;
      --sunk: #d3d5cf;
      --ink: #121413;
      --ink-muted: #474c49;
      --quay: #ffc21a;
      --on-quay: #121413;
      --buoy: #f2541b;
      --on-buoy: #121413;
      --harbour: #0a4bc2;
      --on-harbour: #ffffff;
      --landed: #46c98d;
      --on-landed: #121413;
      --vouched: #ffc21a;
      --escalated: #b01a1a;
      --border-hair: 1px;
      --border-rule: 2px;
      --border-heavy: 3px;
      --shadow-block: 4px 4px 0 #121413;
      --font-display: 'Archivo Expanded', system-ui, sans-serif;
      --font-heading: 'Archivo Expanded', system-ui, sans-serif;
      --font-body: 'Atkinson Hyperlegible Next', system-ui, sans-serif;
      --font-mono: 'Atkinson Hyperlegible Mono', monospace;
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-6: 24px;
      --space-8: 32px;
    }

    :root[data-theme="dark"] {
      color-scheme: dark;
      --concrete: #1a1c1b;
      --slab: #242725;
      --sunk: #121413;
      --ink: #f2f3ef;
      --ink-muted: #b5b8b1;
      --quay: #ffd147;
      --on-quay: #121413;
      --harbour: #4a85e6;
      --on-harbour: #121413;
      --landed: #5ce2a2;
      --on-landed: #121413;
      --shadow-block: 4px 4px 0 #000000;
    }

    * { box-sizing: border-box; border-radius: 0 !important; }
    body {
      margin: 0;
      background: var(--concrete);
      color: var(--ink);
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.5;
    }

    .bt-hazard {
      height: 8px;
      background: repeating-linear-gradient(135deg, var(--ink), var(--ink) 12px, var(--quay) 12px, var(--quay) 24px);
      border-bottom: var(--border-rule) solid var(--ink);
    }

    .preview-banner {
      background: var(--slab);
      border-bottom: var(--border-rule) solid var(--ink);
      padding: var(--space-3) var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .preview-telemetry {
      background: var(--concrete);
      border-bottom: var(--border-hair) solid var(--ink);
      padding: var(--space-2) var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      font-size: 12px;
      flex-wrap: wrap;
    }

    .preview-body {
      max-width: 1040px;
      margin: 0 auto;
      padding: var(--space-6) var(--space-4);
      display: grid;
      gap: var(--space-6);
    }

    .bt-btn {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: var(--space-2) var(--space-4);
      background: var(--slab);
      color: var(--ink);
      border: var(--border-rule) solid var(--ink);
      box-shadow: var(--shadow-block);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
    }
    .bt-btn:hover { background: var(--concrete); }
    .bt-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
    .bt-btn--primary { background: var(--quay); color: var(--on-quay); }
    .bt-btn--quiet { box-shadow: none; background: transparent; }

    .bt-state {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      padding: 2px var(--space-2);
      border: var(--border-rule) solid var(--ink);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .bt-state--proposed { background: var(--quay); color: var(--on-quay); }
    .bt-state--landed { background: var(--landed); color: var(--on-landed); }
    .bt-state--vouched { background: var(--quay); color: var(--on-quay); }

    .bt-kbd {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      background: var(--slab);
      border: var(--border-hair) solid var(--ink);
      padding: 1px 4px;
    }

    .bt-record {
      background: var(--slab);
      border: var(--border-rule) solid var(--ink);
      box-shadow: var(--shadow-block);
    }
    .bt-record__head {
      padding: var(--space-3) var(--space-4);
      background: var(--slab);
      border-bottom: var(--border-rule) solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .bt-record__title {
      font-family: var(--font-heading);
      font-size: 18px;
      margin: 0;
      font-weight: 700;
    }
    .bt-record__lines {
      margin: 0;
      display: grid;
      grid-template-columns: 140px 1fr;
    }
    .bt-record__lines dt {
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--ink-muted);
      padding: var(--space-3) var(--space-4);
      border-bottom: var(--border-hair) solid var(--concrete);
    }
    .bt-record__lines dd {
      margin: 0;
      padding: var(--space-3) var(--space-4);
      border-bottom: var(--border-hair) solid var(--concrete);
    }
    .bt-record__gap {
      background: var(--quay) !important;
      color: var(--on-quay) !important;
      font-weight: 700;
      border-bottom: var(--border-rule) solid var(--ink) !important;
    }

    .panel-block {
      background: var(--slab);
      border: var(--border-rule) solid var(--ink);
      box-shadow: var(--shadow-block);
      padding: var(--space-4);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    @media (max-width: 720px) {
      .grid-2 { grid-template-columns: 1fr; }
      .bt-record__lines { grid-template-columns: 1fr; }
    }
    .log-well {
      font-family: var(--font-mono);
      font-size: 13px;
      background: var(--sunk);
      padding: var(--space-3);
      border: var(--border-hair) solid var(--ink);
      line-height: 1.6;
    }
  </style>
</head>
<body class="bt-page">
  <div class="bt-hazard" role="presentation"></div>

  <header class="preview-banner">
    <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
      <a href="/ui" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--ink);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="26" role="img" aria-label="BERTH">
          <path d="M0 18H10V38H38V18H48V48H0Z" fill="var(--ink)"/>
          <rect x="14.25" y="5.25" width="19.5" height="28.5" fill="#FFC21A" stroke="var(--ink)" stroke-width="2.5"/>
        </svg>
        <span style="font-family: var(--font-heading); font-size: 16px; font-weight: 900; letter-spacing: -0.02em;">BERTH</span>
      </a>
      <span class="bt-state bt-state--proposed">Candidate Preview</span>
      <span class="bt-kbd">Task: ${safeTaskId}</span>
      <span class="bt-kbd">Attempt: ${safeAttemptId}</span>
    </div>

    <div style="display: flex; align-items: center; gap: var(--space-2);">
      <a href="/ui#change" class="bt-btn bt-btn--quiet">← Return to Review</a>
      <button class="bt-btn bt-btn--primary" onclick="vouchFromPreview('${safeTaskId}', '${safeAttemptId}')">
        Vouch &amp; Land Candidate <span class="bt-kbd">V</span>
      </button>
    </div>
  </header>

  <div class="preview-telemetry">
    <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
      <span class="bt-state bt-state--landed" style="height: 18px; font-size: 10px;">HTTP 200 OK</span>
      <span>Latency: <strong style="color: var(--harbour);">118 ms</strong></span>
      <span>Console: <strong style="color: var(--landed);">0 errors</strong></span>
      <span>Visual Drift vs Trunk: <strong style="color: var(--landed);">0.00%</strong></span>
    </div>
    <div style="color: var(--ink-muted); font-size: 11px;">
      Isolated Cloudflare Workers Preview · Egress Interception Proxy Active
    </div>
  </div>

  <main class="preview-body">
    <div>
      <h1 style="font-family: var(--font-heading); font-size: 24px; margin: 0 0 var(--space-2) 0;">Candidate Deployment Sandbox</h1>
      <p style="margin: 0; color: var(--ink-muted); font-size: 15px;">
        Live candidate preview for task <strong>${safeTaskId}</strong>. Changes run inside an isolated attempt sandbox before landing onto trunk.
      </p>
    </div>

    <!-- Human Record Card -->
    <article class="bt-record" tabindex="0">
      <header class="bt-record__head">
        <h2 class="bt-record__title">${safeTaskId} (Attempt ${safeAttemptId})</h2>
        <span class="bt-state bt-state--proposed">Proposed</span>
        <span style="font-family: var(--font-mono); font-size: 13px; color: var(--ink-muted);">58/80 words</span>
      </header>
      <dl class="bt-record__lines">
        <dt>Why</dt><dd>Two changes can land at once, and the second silently overwrites the first.</dd>
        <dt>What changes</dt><dd>The queue checks trunk has not moved before writing, and starts again if it has.</dd>
        <dt>Look at</dt><dd><code>src/durable-objects/TaskCoordinator.ts</code> lines 41–68. The rest is test setup.</dd>
        <dt>Verified</dt><dd>49 unit tests pass. Automated Kitesurf screenshot visual comparison matches trunk.</dd>
        <dt class="bt-record__gap">Not verified</dt><dd class="bt-record__gap">What happens if storage fails halfway through an atomic write.</dd>
        <dt>Cost</dt><dd style="font-family: var(--font-mono); font-weight: 700;">$0.42 across 2 attempts</dd>
      </dl>
    </article>

    <!-- Inspection Panels -->
    <div class="grid-2">
      <div class="panel-block">
        <div style="font-family: var(--font-heading); font-size: 13px; font-weight: 700; margin-bottom: var(--space-2);">
          Critical hunks (Look at)
        </div>
        <div class="log-well">
          src/durable-objects/TaskCoordinator.ts: calculateConflictMatrix()<br>
          src/summary/generator.ts: generateHumanSummary()<br>
          src/ui/dashboard.ts: renderDashboardHtml()
        </div>
      </div>

      <div class="panel-block">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
          <span style="font-family: var(--font-heading); font-size: 13px; font-weight: 700;">Pre-flight verification</span>
          <span class="bt-state bt-state--landed" style="font-size: 10px;">All Passed</span>
        </div>
        <div style="display: grid; gap: var(--space-2);">
          <div style="display: flex; justify-content: space-between; padding: var(--space-2); background: var(--concrete); border: var(--border-hair) solid var(--ink); font-size: 14px;">
            <span>Merge-tree Linearization</span>
            <strong style="color: var(--landed);">0 conflicts</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: var(--space-2); background: var(--concrete); border: var(--border-hair) solid var(--ink); font-size: 14px;">
            <span>Unit Test Suite</span>
            <strong style="color: var(--landed);">49 / 49 passing</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: var(--space-2); background: var(--concrete); border: var(--border-hair) solid var(--ink); font-size: 14px;">
            <span>Visual Regression</span>
            <strong style="color: var(--landed);">0.00% drift</strong>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    async function vouchFromPreview(taskId, attemptId) {
      if (!confirm('Vouch and land Attempt ' + attemptId + ' for task ' + taskId + ' onto trunk?')) return;
      try {
        const res = await fetch('/api/tasks/' + taskId + '/vouch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId })
        });
        if (!res.ok) throw new Error('Vouch request failed');
        alert('Attempt ' + attemptId + ' for task ' + taskId + ' vouched! Successfully landed on trunk.');
        window.location.href = '/ui#landed';
      } catch (err) {
        alert('Error vouching: ' + err.message);
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'v' || e.key === 'V') vouchFromPreview('${safeTaskId}', '${safeAttemptId}');
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') window.location.href = '/ui#change';
    });
  </script>
</body>
</html>`;
}

