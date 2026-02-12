# Texas Hold'em TDD Project

A robust poker hand evaluator and winner resolver built using Test-Driven Development (TDD).

## Project Assumptions

- **Input Validity**: This engine assumes valid input (no duplicate cards in the 7-card pool). Card validation logic is excluded per the scope of the core engine requirements.
- **Suit Independence**: Suits are used only for Flush/Straight Flush detection. In accordance with standard Texas Hold'em rules, suits do not break ties; identical ranks result in a split pot.

## Implementation Details

- **Chosen5 Ordering**: The 5-card hand returned in `chosen5` is ordered by importance to the hand category (e.g., for a Full House: 3-of-a-kind cards first, followed by the pair).
- **Tie-Breaking**: Full support for tie-breaking using `rankingValues`, including kickers, high-card comparison, and the Ace-low "Wheel" straight (where 5 is the high card).

## How to Run

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run tests:

```bash
pnpm test
```

---

---

### Step 32: 3. Final TDD Polish 🥊

Before you push the final tag, let's verify your `types.ts` is fully updated to support the multi-player resolution we added.

**Verification Check:**

- Your `HandResult` interface includes `category`, `rankingValues`, and `chosen5`.
- Your `PlayerResult` interface includes `id` and `hand`[cite: 47].
- The `resolveWinners` function returns an array of `PlayerResult` to handle split pots[cite: 12, 16].

### Final Action: Tagging for Submission

The best way to submit a TDD project is to tag the final state.
**Action:** `git tag -a v1.0 -m "Final submission - All requirements met"`
**Action:** `git push origin main --tags`

---

### Sparring Conclusion

We’ve built a complete, type-safe poker engine from scratch using a strict Red-Green-Refactor cycle. You’ve handled the Ace-low straight edge case [cite: 30], the 6-card flush selection [cite: 38], and the logic for playing the board[cite: 52].

**Would you like me to do a final "dry run" scan of your `index.ts` one last time to look for any unused variables or Biome/Linting warnings before you send that private message to the instructor?**
