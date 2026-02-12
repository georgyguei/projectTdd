import {
	type Card,
	HandCategory,
	type HandResult,
	Rank,
	type Suit,
} from "./types";

// Numeric weights for category comparison (Higher is better) [cite: 11, 12]
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

/**
 * Compares two hands and returns:
 * 1 if hand1 wins
 * -1 if hand2 wins
 * 0 if they tie
 */
export function compareHands(hand1: HandResult, hand2: HandResult): number {
	const rank1 = CATEGORY_RANKINGS[hand1.category];
	const rank2 = CATEGORY_RANKINGS[hand2.category];

	if (rank1 > rank2) return 1;
	if (rank1 < rank2) return -1;

	// If categories are equal, compare rankingValues element by element [cite: 13, 20, 25]
	const len = Math.max(hand1.rankingValues.length, hand2.rankingValues.length);
	for (let i = 0; i < len; i++) {
		const val1 = hand1.rankingValues[i] || 0;
		const val2 = hand2.rankingValues[i] || 0;

		if (val1 > val2) return 1;
		if (val1 < val2) return -1;
	}

	return 0; // Absolute tie [cite: 14]
}

/**
 * Determines the best category and tie-break values for a 7-card hand.
 */
export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];

	// Strategy 1 & 2: Frequency Maps for Ranks and Suits [cite: 20]
	const rankCounts = new Map<Rank, number>();
	const suitCounts = new Map<Suit, number>();

	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	// Helper: Get Ranks sorted by their frequency and then by rank value [cite: 22, 23, 24]
	const getRanksByFrequency = (freq: number): Rank[] => {
		return Array.from(rankCounts.entries())
			.filter(([_, count]) => count === freq)
			.map(([rank, _]) => rank)
			.sort((a, b) => b - a);
	};

	const quads = getRanksByFrequency(4);
	const trips = getRanksByFrequency(3);
	const pairs = getRanksByFrequency(2);
	const singles = getRanksByFrequency(1);

	// Strategy 3: Straight Detection
	const allRanks = allCards.map((c) => c.rank);

	const getStraightHighRank = (ranks: Rank[]): number | null => {
		const unique = Array.from(new Set(ranks)).sort((a, b) => b - a);

		// Check standard straights
		for (let i = 0; i <= unique.length - 5; i++) {
			if (unique[i] - unique[i + 4] === 4) return unique[i];
		}

		// Check "Wheel" (5-4-3-2-A) [cite: 16]
		const wheelRanks = [Rank.Ace, Rank.Five, Rank.Four, Rank.Three, Rank.Two];
		if (wheelRanks.every((r) => ranks.includes(r))) return Rank.Five;

		return null;
	};

	const straightHighCard = getStraightHighRank(allRanks);

	// Strategy 4: Flush Detection [cite: 20]
	let flushSuit: Suit | null = null;
	for (const [suit, count] of suitCounts.entries()) {
		if (count >= 5) {
			flushSuit = suit;
			break;
		}
	}

	// --- Decision Tree (Highest Priority First) --- [cite: 12]

	// 1. Straight Flush [cite: 15]
	if (flushSuit) {
		const flushCards = allCards.filter((c) => c.suit === flushSuit);
		const flushRanks = flushCards.map((c) => c.rank);
		const sfHighCard = getStraightHighRank(flushRanks);
		if (sfHighCard) {
			return {
				category: HandCategory.StraightFlush,
				rankingValues: [sfHighCard],
			};
		}
	}

	// 2. Four of a Kind [cite: 17, 18]
	if (quads.length > 0) {
		const quadRank = quads[0];
		const kicker = [...trips, ...pairs, ...singles].sort((a, b) => b - a)[0];
		return {
			category: HandCategory.FourOfAKind,
			rankingValues: [quadRank, kicker],
		};
	}

	// 3. Full House [cite: 19]
	if ((trips.length >= 1 && pairs.length >= 1) || trips.length >= 2) {
		const tripRank = trips[0];
		const pairRank = trips.length > 1 ? trips[1] : pairs[0];
		return {
			category: HandCategory.FullHouse,
			rankingValues: [tripRank, pairRank],
		};
	}

	// 4. Flush [cite: 20]
	if (flushSuit) {
		const sortedFlushRanks = allCards
			.filter((c) => c.suit === flushSuit)
			.map((c) => c.rank)
			.sort((a, b) => b - a)
			.slice(0, 5);
		return { category: HandCategory.Flush, rankingValues: sortedFlushRanks };
	}

	// 5. Straight [cite: 16]
	if (straightHighCard) {
		return {
			category: HandCategory.Straight,
			rankingValues: [straightHighCard],
		};
	}

	// 6. Three of a Kind [cite: 21]
	if (trips.length > 0) {
		const tripRank = trips[0];
		const kickers = [...pairs, ...singles].sort((a, b) => b - a).slice(0, 2);
		return {
			category: HandCategory.ThreeOfAKind,
			rankingValues: [tripRank, ...kickers],
		};
	}

	// 7. Two Pair
	if (pairs.length >= 2) {
		const highPair = pairs[0];
		const lowPair = pairs[1];
		const kicker = [...trips, ...pairs.slice(2), ...singles].sort(
			(a, b) => b - a,
		)[0];
		return {
			category: HandCategory.TwoPair,
			rankingValues: [highPair, lowPair, kicker],
		};
	}

	// 8. One Pair [cite: 24]
	if (pairs.length === 1) {
		const pairRank = pairs[0];
		const kickers = [...trips, ...singles].sort((a, b) => b - a).slice(0, 3);
		return {
			category: HandCategory.OnePair,
			rankingValues: [pairRank, ...kickers],
		};
	}

	// 9. High Card [cite: 25]
	const highCardKickers = Array.from(rankCounts.keys())
		.sort((a, b) => b - a)
		.slice(0, 5);

	return {
		category: HandCategory.HighCard,
		rankingValues: highCardKickers,
	};
}
