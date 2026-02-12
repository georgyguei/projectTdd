import { Card, HandResult, HandCategory, Rank } from './types';

export function evaluateHand(communityCards: Card[], holeCards: Card[]): HandResult {
    const allCards = [...communityCards, ...holeCards];
    
    // 1. Count rank frequencies
    const rankCounts = new Map<Rank, number>();
    for (const card of allCards) {
        rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
    }

    // 2. Check for pairs (count >= 2)
    // We iterate the values (counts) to see if any is 2
    for (const count of rankCounts.values()) {
        if (count === 2) {
            return { category: HandCategory.OnePair };
        }
    }

    return { category: HandCategory.HighCard };
}
