---
name: berth-design
description: Use whenever you build or change any user interface, page, email, image or video frame for Berth. It covers the brand, tokens, components and accessibility rules in design/berth.
---

# Berth design

1. Read `design/berth/README.md` before writing any UI. It is the brand book, and its rules are binding.
2. Load `design/berth/tokens.css`, then `design/berth/components.css`. Wrap pages in `class="bt-page"`.
3. Build from the existing `bt-` components. Copy markup from `design/berth/components/<Name>/example.html` and follow that component's `README.md`.
4. Use tokens only. No hex values, font names, pixel font sizes or border radii outside `design/berth/`. Every corner is square.
5. Use the product's words: task, attempt, change, revision, evidence, vouch, land, escalation, exception. Never show branches, SHAs, rebases or merges. Use the seven lifecycle states, and only those.
6. Accessibility is a gate, not a goal:
   - text holds 4.5:1 in both themes;
   - the `focus` outline stays visible;
   - every state has a word, not just a colour;
   - every primary action has a keyboard shortcut shown as a `bt-kbd`.
7. Check both themes before you propose a UI change. Open the page with `data-theme="light"`, then `data-theme="dark"`, and attach both screenshots as evidence.
8. Need a component that doesn't exist? Escalate with one specific question rather than inventing one. If the request is approved, add it to `components.css` with a README and an `example.html`.
