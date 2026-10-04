# AttemptCard

One agent's try at a task: its state, what it's doing now, the paths it has leased, and how much of its budget it has spent.

- Markup: `<section class="bt-attempt">` with a `bt-attempt__head` (a `bt-attempt__name` and a StateChip), then `bt-attempt__agent`, `bt-attempt__now`, `bt-attempt__paths` and a `bt-meter`.
- You provide the attempt number, the agent and harness, one sentence on what it is doing now, the leased paths, and the spend against the budget.
- `bt-attempt--active` (with shadow) marks the attempt the coordinator is building on. Use it on one card at most.
- `bt-attempt--stopped` (dashed, sunk) marks an attempt that was stopped. Its sentence gives the coordinator's reason.
- A meter over budget gets `bt-meter--over`, and its figure starts with "Over:".
- Show attempts side by side in a grid that wraps. Never more than six at once.
