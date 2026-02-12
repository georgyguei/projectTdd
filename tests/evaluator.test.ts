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
	it("should identify a Full House hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.King, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.King, suit: Suit.Hearts }, // Trip Kings
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Two, suit: Suit.Clubs }, // Pair of Twos
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Nine, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.FullHouse);
	});
	it("should identify a Four of a Kind hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.Ace, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Hearts },
			{ rank: Rank.Ace, suit: Suit.Spades }, // 4 Aces
			{ rank: Rank.King, suit: Suit.Clubs },
			{ rank: Rank.Two, suit: Suit.Diamonds },
			{ rank: Rank.Four, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.FourOfAKind);
	});
	it("should identify a Flush hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Two, suit: Suit.Hearts },
			{ rank: Rank.Four, suit: Suit.Hearts },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Nine, suit: Suit.Hearts },
			{ rank: Rank.King, suit: Suit.Hearts },
			{ rank: Rank.Ace, suit: Suit.Hearts }, // 5 Hearts total
			{ rank: Rank.Ten, suit: Suit.Spades },
			{ rank: Rank.Three, suit: Suit.Diamonds },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.Flush);
	});
	it("should identify a Straight hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Nine, suit: Suit.Clubs },
			{ rank: Rank.Eight, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Seven, suit: Suit.Hearts },
			{ rank: Rank.Six, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs }, // 5-6-7-8-9 Straight
			{ rank: Rank.King, suit: Suit.Diamonds },
			{ rank: Rank.Two, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.Straight);
	});
	it("should identify a Wheel Straight (Ace low)", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.Two, suit: Suit.Diamonds },
		];

		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Three, suit: Suit.Hearts },
			{ rank: Rank.Four, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs }, // A-2-3-4-5
			{ rank: Rank.Nine, suit: Suit.Diamonds },
			{ rank: Rank.Jack, suit: Suit.Hearts },
		];

		const result = evaluateHand(communityCards, holeCards);

		expect(result.category).toBe(HandCategory.Straight);
	});
});
