import {
	type Card,
	HandCategory,
	type HandResult,
	type Rank,
	type Suit,
} from "./types";

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	const rankCounts = new Map<Rank, number>();
	const suitCounts = new Map<Suit, number>();

	// Strategy 1 & 2: Frequency Maps
	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	// Strategy 3: Check for Straight
	// Get all unique ranks, sort them ascending
	const uniqueRanks = Array.from(rankCounts.keys()).sort((a, b) => a - b);
	let isStraight = false;

	// Check for 5 consecutive ranks
	let consecutiveCount = 1;
	for (let i = 0; i < uniqueRanks.length - 1; i++) {
		if (uniqueRanks[i + 1] === uniqueRanks[i] + 1) {
			consecutiveCount++;
			if (consecutiveCount >= 5) {
				isStraight = true;
			}
		} else {
			consecutiveCount = 1;
		}
	}

	// ----------------------------------------------------
	// Analysis & Decision
	// ----------------------------------------------------
	let pairCount = 0;
	let threeOfAKindCount = 0;
	let fourOfAKindCount = 0;
	let isFlush = false;

	for (const count of rankCounts.values()) {
		if (count === 4) fourOfAKindCount++;
		if (count === 3) threeOfAKindCount++;
		if (count === 2) pairCount++;
	}

	for (const count of suitCounts.values()) {
		if (count >= 5) isFlush = true;
	}

	// Decision Tree (Highest to Lowest)

	// 1. Straight Flush (Wait! We haven't tested this yet, but it beats Quads)
	// We will implement Straight Flush logic in the next step.

	if (fourOfAKindCount > 0) return { category: HandCategory.FourOfAKind };
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1))
		return { category: HandCategory.FullHouse };
	if (isFlush) return { category: HandCategory.Flush };

	// 4. Straight (Beats Three of a Kind)
	if (isStraight) return { category: HandCategory.Straight };

	if (threeOfAKindCount > 0) return { category: HandCategory.ThreeOfAKind };
	if (pairCount >= 2) return { category: HandCategory.TwoPair };
	if (pairCount === 1) return { category: HandCategory.OnePair };

	return { category: HandCategory.HighCard };
}
