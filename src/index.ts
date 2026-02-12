import {
	type Card,
	HandCategory,
	type HandResult,
	type Player,
	type PlayerResult,
	Rank,
	type Suit,
} from "./types";

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

export function resolveWinners(
	board: Card[],
	players: Player[],
): PlayerResult[] {
	// 1. Evaluate everyone
	const results: PlayerResult[] = players.map((p) => ({
		id: p.id,
		hand: evaluateHand(board, p.hole),
	}));

	// 2. Find the best hand among all players
	let winners: PlayerResult[] = [results[0]];

	for (let i = 1; i < results.length; i++) {
		const comparison = compareHands(results[i].hand, winners[0].hand);

		if (comparison === 1) {
			// We found a new absolute leader
			winners = [results[i]];
		} else if (comparison === 0) {
			// It's a tie with the current leaders
			winners.push(results[i]);
		}
	}

	return winners;
}

export function compareHands(hand1: HandResult, hand2: HandResult): number {
	const rank1 = CATEGORY_RANKINGS[hand1.category];
	const rank2 = CATEGORY_RANKINGS[hand2.category];

	if (rank1 > rank2) return 1;
	if (rank1 < rank2) return -1;

	const len = Math.max(hand1.rankingValues.length, hand2.rankingValues.length);
	for (let i = 0; i < len; i++) {
		const v1 = hand1.rankingValues[i] ?? 0;
		const v2 = hand2.rankingValues[i] ?? 0;
		if (v1 > v2) return 1;
		if (v1 < v2) return -1;
	}
	return 0;
}

export function evaluateHand(
	communityCards: Card[],
	holeCards: Card[],
): HandResult {
	const allCards = [...communityCards, ...holeCards];
	const rankCounts = new Map<Rank, number>();
	const suitCounts = new Map<Suit, number>();

	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	const getRanksByFreq = (freq: number) =>
		Array.from(rankCounts.entries())
			.filter((e) => e[1] === freq)
			.map((e) => e[0])
			.sort((a, b) => b - a);

	const quads = getRanksByFreq(4);
	const trips = getRanksByFreq(3);
	const pairs = getRanksByFreq(2);
	const _singles = getRanksByFreq(1);

	// Helpers for picking physical cards
	const pick = (rank: Rank, count: number) =>
		allCards.filter((c) => c.rank === rank).slice(0, count);
	const remaining = (exclude: Card[], count: number) =>
		allCards
			.filter((c) => !exclude.includes(c))
			.sort((a, b) => b.rank - a.rank)
			.slice(0, count);

	const getStraightInfo = (cards: Card[]) => {
		const uniqueRanks = Array.from(new Set(cards.map((c) => c.rank))).sort(
			(a, b) => b - a,
		);
		for (let i = 0; i <= uniqueRanks.length - 5; i++) {
			if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
				const ranks = [
					uniqueRanks[i],
					uniqueRanks[i + 1],
					uniqueRanks[i + 2],
					uniqueRanks[i + 3],
					uniqueRanks[i + 4],
				];
				return {
					high: uniqueRanks[i],
					cards: ranks.map((r) => cards.find((c) => c.rank === r) as Card),
				};
			}
		}
		const wheel = [Rank.Ace, Rank.Five, Rank.Four, Rank.Three, Rank.Two];
		if (wheel.every((r) => cards.some((c) => c.rank === r))) {
			return {
				high: Rank.Five,
				cards: wheel.map((r) => cards.find((c) => c.rank === r) as Card),
			};
		}
		return null;
	};

	// 1. Straight Flush
	let flushSuit: Suit | null = null;
	for (const [s, count] of suitCounts) {
		if (count >= 5) flushSuit = s;
	}
	if (flushSuit) {
		const fCards = allCards.filter((c) => c.suit === flushSuit);
		const sf = getStraightInfo(fCards);
		if (sf)
			return {
				category: HandCategory.StraightFlush,
				rankingValues: [sf.high],
				chosen5: sf.cards,
			};
	}

	// 2. Four of a Kind
	if (quads.length > 0) {
		const c4 = pick(quads[0], 4);
		const kicker = remaining(c4, 1);
		return {
			category: HandCategory.FourOfAKind,
			rankingValues: [quads[0], kicker[0].rank],
			chosen5: [...c4, ...kicker],
		};
	}

	// 3. Full House
	if ((trips.length >= 1 && pairs.length >= 1) || trips.length >= 2) {
		const tRank = trips[0],
			pRank = trips[1] ?? pairs[0];
		const c3 = pick(tRank, 3),
			c2 = pick(pRank, 2);
		return {
			category: HandCategory.FullHouse,
			rankingValues: [tRank, pRank],
			chosen5: [...c3, ...c2],
		};
	}

	// 4. Flush
	if (flushSuit) {
		const fCards = allCards
			.filter((c) => c.suit === flushSuit)
			.sort((a, b) => b.rank - a.rank)
			.slice(0, 5);
		return {
			category: HandCategory.Flush,
			rankingValues: fCards.map((c) => c.rank),
			chosen5: fCards,
		};
	}

	// 5. Straight
	const st = getStraightInfo(allCards);
	if (st)
		return {
			category: HandCategory.Straight,
			rankingValues: [st.high],
			chosen5: st.cards,
		};

	// 6. Three of a Kind
	if (trips.length > 0) {
		const c3 = pick(trips[0], 3);
		const kickers = remaining(c3, 2);
		return {
			category: HandCategory.ThreeOfAKind,
			rankingValues: [trips[0], ...kickers.map((k) => k.rank)],
			chosen5: [...c3, ...kickers],
		};
	}

	// 7. Two Pair
	if (pairs.length >= 2) {
		const cP1 = pick(pairs[0], 2),
			cP2 = pick(pairs[1], 2);
		const kicker = remaining([...cP1, ...cP2], 1);
		return {
			category: HandCategory.TwoPair,
			rankingValues: [pairs[0], pairs[1], kicker[0].rank],
			chosen5: [...cP1, ...cP2, ...kicker],
		};
	}

	// 8. One Pair
	if (pairs.length === 1) {
		const cP = pick(pairs[0], 2);
		const kickers = remaining(cP, 3);
		return {
			category: HandCategory.OnePair,
			rankingValues: [pairs[0], ...kickers.map((k) => k.rank)],
			chosen5: [...cP, ...kickers],
		};
	}

	// 9. High Card
	const best5 = [...allCards].sort((a, b) => b.rank - a.rank).slice(0, 5);
	return {
		category: HandCategory.HighCard,
		rankingValues: best5.map((c) => c.rank),
		chosen5: best5,
	};
}
