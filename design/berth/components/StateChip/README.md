# StateChip

The fixed lifecycle state of a task or change: Intent, Exploring, Proposed, Vouched, Landing, Landed, or Escalated.

- Markup: `<span class="bt-state bt-state--proposed">Proposed</span>`. You provide the word, and it must be the state's name. The word carries the meaning, and the colour and marker repeat it.
- Markers: hollow (Intent), half-full (Exploring), solid (Proposed, Vouched), striped (Landing), tick (Landed), `!` (Escalated). People who can't tell the colours apart can still tell the shapes apart.
- `bt-state--stopped` (dashed, hollow) is for an attempt the coordinator stopped. It is not a lifecycle state.
- Never add states, rename them, or use a chip as a tag or filter. The lifecycle is not configurable.
