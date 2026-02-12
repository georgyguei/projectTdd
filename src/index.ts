import { Card, HandResult, HandCategory } from './types';

export function evaluateHand(communityCards: Card[], holeCards: Card[]): HandResult {
  // Hardcode the return to make the first test pass.
  // We will force this to change by writing a "Pair" test next.
  return {
    category: HandCategory.HighCard
  };
}