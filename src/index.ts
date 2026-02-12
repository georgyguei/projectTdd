import {
	type Card,
	HandCategory,
	type HandResult,
	Rank,
	type Suit,
} from "./types";

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	// Strategy 1 & 2: Frequency Maps
	const rankCounts = new Map<Rank, number>();
	const suitCounts = new Map<Suit, number>();

	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	// ----------------------------------------------------
	// Helper: Straight Detector
	// ----------------------------------------------------
	const checkStraight = (ranks: Rank[]): boolean => {
		let uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => a - b);

		// Handle Ace Low (Wheel)
		if (uniqueRanks.includes(Rank.Ace)) {
			uniqueRanks = [1 as Rank, ...uniqueRanks];
		}

		let consecutiveCount = 1;
		for (let i = 0; i < uniqueRanks.length - 1; i++) {
			if (uniqueRanks[i + 1] === uniqueRanks[i] + 1) {
				consecutiveCount++;
				if (consecutiveCount >= 5) return true;
			} else {
				consecutiveCount = 1;
			}
		}
		return false;
	};

	// ----------------------------------------------------
	// Analysis
	// ----------------------------------------------------

	// 1. Check for basic Straight
	const allRanks = allCards.map((c) => c.rank);
	const isStraight = checkStraight(allRanks);

	// 2. Check for Flush & Straight Flush
	let isFlush = false;
	let isStraightFlush = false;
	let flushSuit: Suit | null = null;

	for (const [suit, count] of suitCounts.entries()) {
		if (count >= 5) {
			isFlush = true;
			flushSuit = suit;
			break;
		}
	}

	if (isFlush && flushSuit) {
		const flushCards = allCards.filter((c) => c.suit === flushSuit);
		const flushRanks = flushCards.map((c) => c.rank);
		if (checkStraight(flushRanks)) {
			isStraightFlush = true;
		}
	}

	// 3. Check Counts (Quads, Trips, Pairs)
	let pairCount = 0;
	let threeOfAKindCount = 0;
	let fourOfAKindCount = 0;

	for (const count of rankCounts.values()) {
		if (count === 4) fourOfAKindCount++;
		if (count === 3) threeOfAKindCount++;
		if (count === 2) pairCount++;
	}

	// ----------------------------------------------------
	// Decision Tree
	// ----------------------------------------------------

	if (isStraightFlush) return { category: HandCategory.StraightFlush };
	if (fourOfAKindCount > 0) return { category: HandCategory.FourOfAKind };
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1))
		return { category: HandCategory.FullHouse };
	if (isFlush) return { category: HandCategory.Flush };
	if (isStraight) return { category: HandCategory.Straight };
	if (threeOfAKindCount > 0) return { category: HandCategory.ThreeOfAKind };
	if (pairCount >= 2) return { category: HandCategory.TwoPair };
	if (pairCount === 1) return { category: HandCategory.OnePair };

	return { category: HandCategory.HighCard };
}
