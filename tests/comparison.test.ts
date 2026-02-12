import { describe, expect, it } from "vitest";
import { compareHands, resolveWinners } from "../src/index";
import {
	type Card,
	HandCategory,
	type HandResult,
	Rank,
	Suit,
} from "../src/types";

describe("Hand Comparison (Different Categories)", () => {
	it("should determine that Four of a Kind beats Full House", () => {
		// We mock the results because we are testing the *comparison* logic,
		// not the *evaluation* logic here.
		const hand1: HandResult = {
			category: HandCategory.FourOfAKind,
			rankingValues: [],
			chosen5: [],
		};
		const hand2: HandResult = {
			category: HandCategory.FullHouse,
			rankingValues: [],
			chosen5: [],
		};

		const result = compareHands(hand1, hand2);

		expect(result).toBe(1); // 1 means Hand 1 wins
	});
	it("should determine that High Card loses to One Pair", () => {
		const hand1: HandResult = {
			category: HandCategory.HighCard,
			rankingValues: [],
			chosen5: [],
		};
		const hand2: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [],
			chosen5: [],
		};

		const result = compareHands(hand1, hand2);

		expect(result).toBe(-1); // -1 means Hand 2 wins
	});
	it("should determine that a Pair of Aces beats a Pair of Kings", () => {
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

		const result = compareHands(hand1, hand2);

		expect(result).toBe(1); // Aces > Kings
	});
	it("should identify multiple winners in a split pot scenario", () => {
		const board: Card[] = [
			{ rank: Rank.Ace, suit: Suit.Spades },
			{ rank: Rank.King, suit: Suit.Hearts },
			{ rank: Rank.Queen, suit: Suit.Diamonds },
			{ rank: Rank.Jack, suit: Suit.Clubs },
			{ rank: Rank.Ten, suit: Suit.Spades }, // Royal Flush on the board
		];

		const player1Hole: Card[] = [
			{ rank: Rank.Two, suit: Suit.Hearts },
			{ rank: Rank.Three, suit: Suit.Clubs },
		];
		const player2Hole: Card[] = [
			{ rank: Rank.Four, suit: Suit.Diamonds },
			{ rank: Rank.Five, suit: Suit.Spades },
		];

		// Both players "play the board". The result should be a tie.
		const winners = resolveWinners(board, [
			{ id: "Player 1", hole: player1Hole },
			{ id: "Player 2", hole: player2Hole },
		]);

		expect(winners).toHaveLength(2); // Split pot
		expect(winners[0].id).toBe("Player 1");
		expect(winners[1].id).toBe("Player 2");
	});
});
