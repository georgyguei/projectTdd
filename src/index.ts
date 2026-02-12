import { type Card, HandCategory, type HandResult, type Rank } from "./types";

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	const rankCounts = new Map<Rank, number>();
	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
	}

	let pairCount = 0;
	let threeOfAKindCount = 0;
	// We will add fourOfAKindCount in the next step

	for (const count of rankCounts.values()) {
		if (count === 3) threeOfAKindCount++;
		if (count === 2) pairCount++;
	}

	// 1. Full House Check (Must be before Three of a Kind)
	// Logic: A set of 3 AND a set of 2.
	// Edge case: Two sets of 3 (AAA KKK Q) is also a Full House (AAA KK).
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1)) {
		return { category: HandCategory.FullHouse };
	}

	// 2. Three of a Kind
	if (threeOfAKindCount > 0) {
		return { category: HandCategory.ThreeOfAKind };
	}

	// 3. Two Pair
	if (pairCount >= 2) {
		return { category: HandCategory.TwoPair };
	}

	// 4. One Pair
	if (pairCount === 1) {
		return { category: HandCategory.OnePair };
	}

	return { category: HandCategory.HighCard };
}
