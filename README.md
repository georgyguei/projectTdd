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
