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
	let fourOfAKindCount = 0; // New tracker

	for (const count of rankCounts.values()) {
		if (count === 4) fourOfAKindCount++;
		if (count === 3) threeOfAKindCount++;
		if (count === 2) pairCount++;
	}

	// 1. Four of a Kind (Highest Priority)
	if (fourOfAKindCount > 0) {
		return { category: HandCategory.FourOfAKind };
	}

	// 2. Full House
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1)) {
		return { category: HandCategory.FullHouse };
	}

	// 3. Three of a Kind
	if (threeOfAKindCount > 0) {
		return { category: HandCategory.ThreeOfAKind };
	}

	// 4. Two Pair
	if (pairCount >= 2) {
		return { category: HandCategory.TwoPair };
	}

	// 5. One Pair
	if (pairCount === 1) {
		return { category: HandCategory.OnePair };
	}

	return { category: HandCategory.HighCard };
}
