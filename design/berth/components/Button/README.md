# Button

A square, ink-bordered button that sits on a hard 4px shadow and drops into it when pressed.

- Markup: `<button class="bt-btn">`. Add `bt-btn--primary` (quay), `bt-btn--danger` (escalated) or `bt-btn--quiet` (no box). You provide the label and, where one exists, a `bt-kbd` shortcut inside it.
- One primary button per view: the action that moves the change on ("Vouch and land"). Everything else is secondary.
- Use danger only for actions that throw work away ("Stop attempt").
- A disabled button turns dashed and says why in its label: "Land (needs a vouch)", not just "Land".
- Labels are verbs naming what happens. Never "OK", "Submit" or "Confirm".
