import { describe, expect, it } from "vitest";
import { evaluateHand } from "../src";
import { type Card, HandCategory, Rank, Suit } from "../src/types";

describe("Texas Holdem Evaluator", () => {
	// --- Category Detection Tests ---

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

	// --- Exam PDF Example A: Wheel Straight (Ace low) ---
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
		// High card of a wheel is 5 [cite: 16, 29]
		expect(result.rankingValues).toEqual([Rank.Five]);
		expect(result.chosen5[0].rank).toBe(Rank.Five);
	});

	// --- Exam PDF Example C: Flush with 6 suited cards ---
	it("should pick the best 5 cards for a Flush per Example C", () => {
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
		// Best 5 hearts: A, J, 9, 6, 4 [cite: 35]
		expect(result.rankingValues).toEqual([
			Rank.Ace,
			Rank.Jack,
			Rank.Nine,
			Rank.Six,
			Rank.Four,
		]);
	});

	// --- Exam PDF Example D: Board Plays (Tie) ---
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
		// The straight on the board (5-9) is better than a pair of Aces [cite: 7, 35]
		expect(result.chosen5.map((c) => c.rank)).toEqual([
			Rank.Nine,
			Rank.Eight,
			Rank.Seven,
			Rank.Six,
			Rank.Five,
		]);
	});

	// --- Tie-Break / rankingValues Tests ---

	it("should provide correct rankingValues for Full House (Trip Rank then Pair Rank)", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.King, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.King, suit: Suit.Hearts },
			{ rank: Rank.Two, suit: Suit.Spades },
			{ rank: Rank.Two, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Nine, suit: Suit.Hearts },
		];
		const result = evaluateHand(communityCards, holeCards);
		// Ranking order: [TripRank, PairRank] [cite: 19]
		expect(result.rankingValues).toEqual([Rank.King, Rank.Two]);
	});

	it("should provide correct rankingValues for Four of a Kind (Quad Rank then Kicker)", () => {
		const holeCards: [Card, Card] = [
			{ rank: Rank.Seven, suit: Suit.Clubs },
			{ rank: Rank.Ace, suit: Suit.Diamonds },
		];
		const communityCards: [Card, Card, Card, Card, Card] = [
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Seven, suit: Suit.Hearts },
			{ rank: Rank.Seven, suit: Suit.Spades },
			{ rank: Rank.Two, suit: Suit.Diamonds },
			{ rank: Rank.King, suit: Suit.Hearts },
		];
		const result = evaluateHand(communityCards, holeCards);
		// Ranking order: [QuadRank, Kicker] [cite: 18, 29]
		expect(result.rankingValues).toEqual([Rank.Seven, Rank.Ace]);
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
		// Importance: Higher pair, lower pair, kicker [cite: 23, 29]
		expect(result.chosen5[0].rank).toBe(Rank.Jack);
		expect(result.chosen5[2].rank).toBe(Rank.Ten);
		expect(result.chosen5[4].rank).toBe(Rank.Ace);
	});
});
