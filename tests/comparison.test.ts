import { describe, expect, it } from "vitest";
import { compareHands, resolveWinners } from "../src/index";
import {
	type Card,
	HandCategory,
	type HandResult,
	Rank,
	Suit,
} from "../src/types";

describe("Hand Comparison and Table Resolution", () => {
	// --- Unit Tests for compareHands ---

	it("should determine that Four of a Kind beats Full House (Category priority)", () => {
		const hand1: HandResult = {
			category: HandCategory.FourOfAKind,
			rankingValues: [Rank.Two, Rank.Ace],
			chosen5: [],
		};
		const hand2: HandResult = {
			category: HandCategory.FullHouse,
			rankingValues: [Rank.Ace, Rank.King],
			chosen5: [],
		};
		expect(compareHands(hand1, hand2)).toBe(1);
	});

	it("should determine that a Pair of Aces beats a Pair of Kings (Tie-break rank)", () => {
		const hand1: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [Rank.Ace, Rank.Ten, Rank.Eight, Rank.Two],
			chosen5: [],
		};
		const hand2: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [Rank.King, Rank.Queen, Rank.Jack, Rank.Three],
			chosen5: [],
		};
		expect(compareHands(hand1, hand2)).toBe(1);
	});

	// --- Integration Tests for resolveWinners (Multi-player & Split Pots) ---

	it("should identify multiple winners in a split pot scenario (Example D: Board Plays)", () => {
		const board: Card[] = [
			{ rank: Rank.Five, suit: Suit.Clubs },
			{ rank: Rank.Six, suit: Suit.Diamonds },
			{ rank: Rank.Seven, suit: Suit.Hearts },
			{ rank: Rank.Eight, suit: Suit.Spades },
			{ rank: Rank.Nine, suit: Suit.Diamonds },
		];

		const player1Hole: Card[] = [
			{ rank: Rank.Ace, suit: Suit.Hearts },
			{ rank: Rank.Ace, suit: Suit.Clubs },
		];
		const player2Hole: Card[] = [
			{ rank: Rank.King, suit: Suit.Diamonds },
			{ rank: Rank.Queen, suit: Suit.Spades },
		];

		const winners = resolveWinners(board, [
			{ id: "Player 1", hole: player1Hole },
			{ id: "Player 2", hole: player2Hole },
		]);

		expect(winners).toHaveLength(2); // Both play the board straight
		expect(winners.map((w) => w.id)).toContain("Player 1");
		expect(winners.map((w) => w.id)).toContain("Player 2");
	});

	it("should determine a winner based on kicker when board has Quads (Example E)", () => {
		const board: Card[] = [
			{ rank: Rank.Seven, suit: Suit.Clubs },
			{ rank: Rank.Seven, suit: Suit.Diamonds },
			{ rank: Rank.Seven, suit: Suit.Hearts },
			{ rank: Rank.Seven, suit: Suit.Spades },
			{ rank: Rank.Two, suit: Suit.Diamonds },
		];

		const player1Hole: Card[] = [
			{ rank: Rank.Ace, suit: Suit.Clubs },
			{ rank: Rank.King, suit: Suit.Clubs },
		];
		const player2Hole: Card[] = [
			{ rank: Rank.Queen, suit: Suit.Clubs },
			{ rank: Rank.Jack, suit: Suit.Clubs },
		];

		const winners = resolveWinners(board, [
			{ id: "Player 1", hole: player1Hole },
			{ id: "Player 2", hole: player2Hole },
		]);

		expect(winners).toHaveLength(1);
		expect(winners[0].id).toBe("Player 1"); // Ace kicker beats Queen kicker [cite: 36, 37]
	});

	it("should result in a tie regardless of suits (Suit Independence)", () => {
		const board: Card[] = [
			{ rank: Rank.Two, suit: Suit.Clubs },
			{ rank: Rank.Three, suit: Suit.Diamonds },
			{ rank: Rank.Four, suit: Suit.Hearts },
			{ rank: Rank.Five, suit: Suit.Spades },
			{ rank: Rank.Ten, suit: Suit.Clubs },
		];

		// Both players have the same ranks but different suits for their high card
		const player1Hole: Card[] = [
			{ rank: Rank.Ace, suit: Suit.Hearts },
			{ rank: Rank.King, suit: Suit.Hearts },
		];
		const player2Hole: Card[] = [
			{ rank: Rank.Ace, suit: Suit.Spades },
			{ rank: Rank.King, suit: Suit.Spades },
		];

		const winners = resolveWinners(board, [
			{ id: "Player 1", hole: player1Hole },
			{ id: "Player 2", hole: player2Hole },
		]);

		expect(winners).toHaveLength(2); // Suits never break ties [cite: 10, 45]
	});
});
