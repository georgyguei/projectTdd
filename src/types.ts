export enum Suit {
	Clubs = "♣",
	Diamonds = "♦",
	Hearts = "♥",
	Spades = "♠",
}

export enum Rank {
	Two = 2,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine,
	Ten,
	Jack,
	Queen,
	King,
	Ace,
}

export enum HandCategory {
	HighCard = "High Card",
	OnePair = "One Pair",
	TwoPair = "Two Pair",
	ThreeOfAKind = "Three of a Kind",
	Straight = "Straight",
	Flush = "Flush",
	FullHouse = "Full House",
	FourOfAKind = "Four of a Kind",
	StraightFlush = "Straight Flush",
}

export interface Card {
	rank: Rank;
	suit: Suit;
}

export interface HandResult {
	category: HandCategory;
	// We will add the "winning cards" field later when we tackle that requirement
}
