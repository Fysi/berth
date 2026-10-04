# ConflictMatrix

Which attempts would conflict with trunk and with each other, recomputed on every push.

- Markup: `<div class="bt-matrix-wrap"><table class="bt-matrix">`, with attempts as rows and Trunk plus each attempt as columns. Mark the trunk column header with `is-trunk`.
- Cells: `is-clean` ("Clean"), `is-overlap` ("Same lines, merges": they touch the same lines but merge cleanly), `is-conflict` ("Conflict · 2 files"), and `is-self` ("—").
- You provide the cells and a caption saying how fresh the data is ("updated 12 s after the last push").
- Every cell has words. Never show colour alone, and never a count without its noun.
- The wrapper scrolls sideways on narrow screens. The page never does.
