# TextField

A labelled, square input with optional help text and an error state.

- Markup: `<div class="bt-field">` containing a `<label class="bt-field__label" for="…">`, an `<input class="bt-input" id="…">` (or `<textarea class="bt-input">`), and `bt-field__help` or `bt-field__error`.
- You provide the label, a stable `id`, and the help or error text.
- On an error, add `bt-field--error`, set `aria-invalid="true"`, and point `aria-describedby` at the message. The message starts with "Error:", then says what's wrong and what to try.
- Labels are always visible. Never use placeholder text as the label.
