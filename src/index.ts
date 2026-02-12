import { type Card, HandCategory, type HandResult, type Rank } from "./types";

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	// 1. Count rank frequencies
	const rankCounts = new Map<Rank, number>();
	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
	}

	// 2. Analyze the counts
	let pairCount = 0;

	for (const count of rankCounts.values()) {
		if (count === 2) {
			pairCount++;
		}
	}

	// 3. Determine Category (Priority Order)
	// Note: With 7 cards, you might have 3 pairs (e.g., AA, KK, QQ, 2).
	// The best hand is still "Two Pair" (AA KK Q). So we check >= 2.
	if (pairCount >= 2) {
		return { category: HandCategory.TwoPair };
	}

	if (pairCount === 1) {
		return { category: HandCategory.OnePair };
	}

	return { category: HandCategory.HighCard };
}
