import { describe, expect, it } from "vitest";
import { evaluateHand } from "../src";
import { type Card, HandCategory, Rank, Suit } from "../src/types";

describe("Texas Holdem Evaluator", () => {
	it("should identify a High Card hand", () => {
		// Input: A mix of ranks and suits that form nothing special
		const holeCards: [Card, Card] = [
			{ rank: Rank.Two, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Four, suit: Suit.Hearts },
			{ rank: Rank.Nine, suit: Suit.Spades },
			{ rank: Rank.Queen, suit: Suit.Clubs },
			{ rank: Rank.Five, suit: Suit.Diamonds }, // No straights, no flushes
			{ rank: Rank.King, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.HighCard);
	});
	it("should identify a One Pair hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Ten, suit: Suit.Clubs },
			{ rank: Rank.Eight, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Ten, suit: Suit.Hearts }, // Matches hole card Ten (Pair)
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
			{ rank: Rank.Queen, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.OnePair);
	});
	it("should identify a Two Pair hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Jack, suit: Suit.Clubs },
			{ rank: Rank.Ten, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Jack, suit: Suit.Hearts }, // Pair of Jacks
			{ rank: Rank.Ten, suit: Suit.Spades }, // Pair of Tens
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
			{ rank: Rank.Queen, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.TwoPair);
	});
	it("should identify a Three of a Kind hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Queen, suit: Suit.Clubs },
			{ rank: Rank.Queen, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Queen, suit: Suit.Hearts }, // Trip Queens
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Nine, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.ThreeOfAKind);
	});
});
