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
	let threeOfAKindCount = 0; // New tracker

	for (const count of rankCounts.values()) {
		if (count === 3) {
			threeOfAKindCount++;
		}
		if (count === 2) {
			pairCount++;
		}
	}

	// Priority Check: Highest Category First
	if (threeOfAKindCount > 0) {
		return { category: HandCategory.ThreeOfAKind };
	}

	if (pairCount >= 2) {
		return { category: HandCategory.TwoPair };
	}

	if (pairCount === 1) {
		return { category: HandCategory.OnePair };
	}

	return { category: HandCategory.HighCard };
}
