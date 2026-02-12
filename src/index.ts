import {
	type Card,
	HandCategory,
	type HandResult,
	type Rank,
	type Suit,
} from "./types"; // Import Suit

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	// Strategy 1: Rank Counts (for Pairs, Trips, Quads, Full House)
	const rankCounts = new Map<Rank, number>();
	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
	}

	// Strategy 2: Suit Counts (for Flush)
	const suitCounts = new Map<Suit, number>();
	for (const card of allCards) {
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	// ----------------------------------------------------
	// Analysis
	// ----------------------------------------------------

	// Analyze Ranks
	let pairCount = 0;
	let threeOfAKindCount = 0;
	let fourOfAKindCount = 0;

	for (const count of rankCounts.values()) {
		if (count === 4) fourOfAKindCount++;
		if (count === 3) threeOfAKindCount++;
		if (count === 2) pairCount++;
	}

	// Analyze Suits
	let isFlush = false;
	for (const count of suitCounts.values()) {
		if (count >= 5) {
			isFlush = true;
			break;
		}
	}

	// ----------------------------------------------------
	// Decision Tree (Order matters!)
	// ----------------------------------------------------

	// 1. Four of a Kind
	if (fourOfAKindCount > 0) {
		return { category: HandCategory.FourOfAKind };
	}

	// 2. Full House
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1)) {
		return { category: HandCategory.FullHouse };
	}

	// 3. Flush (Beats Straight, Trips, etc.)
	if (isFlush) {
		return { category: HandCategory.Flush };
	}

	// 4. Three of a Kind
	if (threeOfAKindCount > 0) {
		return { category: HandCategory.ThreeOfAKind };
	}

	// 5. Two Pair
	if (pairCount >= 2) {
		return { category: HandCategory.TwoPair };
	}

	// 6. One Pair
	if (pairCount === 1) {
		return { category: HandCategory.OnePair };
	}

	return { category: HandCategory.HighCard };
}
