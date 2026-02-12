import {
	type Card,
	HandCategory,
	type HandResult,
	Rank,
	type Suit,
} from "./types";

// Numeric weights for category comparison (Higher is better)
const CATEGORY_RANKINGS: Record<HandCategory, number> = {
	[HandCategory.StraightFlush]: 9,
	[HandCategory.FourOfAKind]: 8,
	[HandCategory.FullHouse]: 7,
	[HandCategory.Flush]: 6,
	[HandCategory.Straight]: 5,
	[HandCategory.ThreeOfAKind]: 4,
	[HandCategory.TwoPair]: 3,
	[HandCategory.OnePair]: 2,
	[HandCategory.HighCard]: 1,
};

// src/index.ts

export function compareHands(hand1: HandResult, hand2: HandResult): number {
	const rank1 = CATEGORY_RANKINGS[hand1.category];
	const rank2 = CATEGORY_RANKINGS[hand2.category];

	if (rank1 > rank2) return 1;
	if (rank1 < rank2) return -1;

	// Categories are equal, compare rankingValues element by element
	//
	const len = Math.max(hand1.rankingValues.length, hand2.rankingValues.length);
	for (let i = 0; i < len; i++) {
		const val1 = hand1.rankingValues[i] || 0;
		const val2 = hand2.rankingValues[i] || 0;

		if (val1 > val2) return 1;
		if (val1 < val2) return -1;
	}

	return 0; // Absolute tie [cite: 14]
}

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

	if (isStraightFlush)
		return { category: HandCategory.StraightFlush, rankingValues: [] };
	if (fourOfAKindCount > 0)
		return { category: HandCategory.FourOfAKind, rankingValues: [] };
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1))
		return { category: HandCategory.FullHouse, rankingValues: [] };
	if (isFlush) return { category: HandCategory.Flush, rankingValues: [] };
	if (isStraight) return { category: HandCategory.Straight, rankingValues: [] };
	if (threeOfAKindCount > 0)
		return { category: HandCategory.ThreeOfAKind, rankingValues: [] };
	if (pairCount >= 2)
		return { category: HandCategory.TwoPair, rankingValues: [] };
	if (pairCount === 1)
		return { category: HandCategory.OnePair, rankingValues: [] };

	return { category: HandCategory.HighCard, rankingValues: [] };
}
