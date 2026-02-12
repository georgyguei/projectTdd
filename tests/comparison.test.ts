// tests/comparison.test.ts
import { describe, expect, it } from "vitest";
import { compareHands } from "../src/index";
import { HandCategory, type HandResult, Rank } from "../src/types";

describe("Hand Comparison (Different Categories)", () => {
	it("should determine that Four of a Kind beats Full House", () => {
		// We mock the results because we are testing the *comparison* logic,
		// not the *evaluation* logic here.
		const hand1: HandResult = {
			category: HandCategory.FourOfAKind,
			rankingValues: [],
		};
		const hand2: HandResult = {
			category: HandCategory.FullHouse,
			rankingValues: [],
		};

		const result = compareHands(hand1, hand2);

		expect(result).toBe(1); // 1 means Hand 1 wins
	});
	it("should determine that High Card loses to One Pair", () => {
		const hand1: HandResult = {
			category: HandCategory.HighCard,
			rankingValues: [],
		};
		const hand2: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [],
		};

		const result = compareHands(hand1, hand2);

		expect(result).toBe(-1); // -1 means Hand 2 wins
	});
	it("should determine that a Pair of Aces beats a Pair of Kings", () => {
		const hand1: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [Rank.Ace, Rank.Ten, Rank.Eight, Rank.Two],
		};
		const hand2: HandResult = {
			category: HandCategory.OnePair,
			rankingValues: [Rank.King, Rank.Queen, Rank.Jack, Rank.Three],
		};

		const result = compareHands(hand1, hand2);

		expect(result).toBe(1); // Aces > Kings
	});
});
