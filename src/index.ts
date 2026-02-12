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

	const rankCounts = new Map<Rank, number>();
	const suitCounts = new Map<Suit, number>();

	for (const card of allCards) {
		rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
		suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
	}

	// Strategy 3: Check for Straight
	// Get all unique ranks, sort them ascending
	// Note: Rank is a number enum, so this array is number[]
	let uniqueRanks = Array.from(rankCounts.keys()).sort((a, b) => a - b);

	// FIX: Handle Ace Low (Wheel)
	// If we have an Ace (14), we also technically have a "1" for straight purposes.
	if (uniqueRanks.includes(Rank.Ace)) {
		// Prepend 1 to the start of the array
		uniqueRanks = [1 as Rank, ...uniqueRanks];
	}

	let isStraight = false;
	let consecutiveCount = 1;

	for (let i = 0; i < uniqueRanks.length - 1; i++) {
		// Check if the next rank is exactly 1 higher than current
		if (uniqueRanks[i + 1] === uniqueRanks[i] + 1) {
			consecutiveCount++;
			if (consecutiveCount >= 5) {
				isStraight = true;
				// We don't break here because we might find a higher straight later
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

	// Decision Tree

	if (fourOfAKindCount > 0) return { category: HandCategory.FourOfAKind };
	if (threeOfAKindCount >= 2 || (threeOfAKindCount === 1 && pairCount >= 1))
		return { category: HandCategory.FullHouse };
	if (isFlush) return { category: HandCategory.Flush };
	if (isStraight) return { category: HandCategory.Straight }; // Correctly identifies Wheel now
	if (threeOfAKindCount > 0) return { category: HandCategory.ThreeOfAKind };
	if (pairCount >= 2) return { category: HandCategory.TwoPair };
	if (pairCount === 1) return { category: HandCategory.OnePair };

	return { category: HandCategory.HighCard };
}
