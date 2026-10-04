# HumanRecord

The five-line, evidence-backed summary of a change, and the only text a reviewer has to read.

- Markup: `<article class="bt-record">` with a `bt-record__head` (a `bt-record__title`, a StateChip and a `bt-record__count` word count), then a `<dl class="bt-record__lines">` with these lines in order: Why, What changes, Look at, Verified, Not verified, Cost.
- You provide the text. Keep it to 80 words in total, and show the count as `58/80 words`.
- "Not verified" is always present and always on a quay band (`bt-record__gap` on its `dt` and `dd`). If everything was checked, it says what was out of scope.
- Paths and code go in `<code>`. Cost uses `bt-record__cost`.
- On narrow screens the labels stack above their text.
- Never put agent reasoning, hedging or an unverified claim in the record. That belongs in the agent record, one click away.
