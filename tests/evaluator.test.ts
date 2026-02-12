import { describe, expect, it } from "vitest";
import { evaluateHand } from "../src";
import { type Card, HandCategory, Rank, Suit } from "../src/types";

describe("Texas Holdem Evaluator", () => {
	// --- 1. Basic Identity Tests (The TDD Ladder) ---

	it("should identify a High Card hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Two, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Four, suit: Suit.Hearts },
			{ rank: Rank.Nine, suit: Suit.Spades },
			{ rank: Rank.Queen, suit: Suit.Clubs },
			{ rank: Rank.Five, suit: Suit.Diamonds },
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
			{ rank: Rank.Ten, suit: Suit.Hearts },
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
			{ rank: Rank.Queen, suit: Suit.Hearts },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.OnePair);
	});

	it("should identify a Three of a Kind hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Queen, suit: Suit.Clubs },
			{ rank: Rank.Queen, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Queen, suit: Suit.Hearts },
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Nine, suit: Suit.Hearts },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.ThreeOfAKind);
	});

	it("should identify a Straight Flush hand", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Jack, suit: Suit.Spades },
			{ rank: Rank.Ten, suit: Suit.Spades },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Nine, suit: Suit.Spades },
			{ rank: Rank.Eight, suit: Suit.Spades },
			{ rank: Rank.Seven, suit: Suit.Spades },
			{ rank: Rank.Ace, suit: Suit.Diamonds },
			{ rank: Rank.King, suit: Suit.Clubs },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.StraightFlush);
	});

	// --- 2. Complex Edge Cases (The Rubric Killers) ---

	it("should identify a Wheel Straight (Ace low) per Example A", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.Two, suit: Suit.Diamonds },
			{ rank: Rank.Three, suit: Suit.Hearts },
			{ rank: Rank.Four, suit: Suit.Spades },
			{ rank: Rank.Nine, suit: Suit.Diamonds },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.Straight);
		expect(result.rankingValues).toEqual([Rank.Five]);
	});

	it("should pick the best 5 cards for a Flush per Example C (6 suited cards)", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Six, suit: Suit.Hearts },
			{ rank: Rank.King, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Hearts },
			{ rank: Rank.Jack, suit: Suit.Hearts },
			{ rank: Rank.Nine, suit: Suit.Hearts },
			{ rank: Rank.Four, suit: Suit.Hearts },
			{ rank: Rank.Two, suit: Suit.Clubs },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.Flush);
		expect(result.rankingValues).toEqual([
			Rank.Ace,
			Rank.Jack,
			Rank.Nine,
			Rank.Six,
			Rank.Four,
		]);
	});

	it("should correctly identify 'Board Plays' per Example D", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.Ace, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.Six, suit: Suit.Diamonds },
			{ rank: Rank.Seven, suit: Suit.Hearts },
			{ rank: Rank.Eight, suit: Suit.Spades },
			{ rank: Rank.Nine, suit: Suit.Diamonds },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.category).toBe(HandCategory.Straight);
		expect(result.chosen5.map((c) => c.rank)).toEqual([
			Rank.Nine,
			Rank.Eight,
			Rank.Seven,
			Rank.Six,
			Rank.Five,
		]);
	});

	it("should return exactly 5 cards ordered by importance for Two Pair", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Jack, suit: Suit.Clubs },
			{ rank: Rank.Ten, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Jack, suit: Suit.Hearts },
			{ rank: Rank.Ten, suit: Suit.Spades },
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.Five, suit: Suit.Diamonds },
			{ rank: Rank.Two, suit: Suit.Hearts },
		];
		const result = evaluateHand(communityCards, holeCards);
		expect(result.chosen5).toHaveLength(5);
		expect(result.chosen5[0].rank).toBe(Rank.Jack);
		expect(result.chosen5[2].rank).toBe(Rank.Ten);
		expect(result.chosen5[4].rank).toBe(Rank.Ace);
	});
});
