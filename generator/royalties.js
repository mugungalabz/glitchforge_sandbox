export function addAuthorRoyalties(authorAddress, royalties) {
    if (!(authorAddress in royalties)) royalties[authorAddress] = 0;
    royalties[authorAddress] += 1;
}

export function calculateRoyalties(royalties, royalty_tally) {
    const TOTAL_EFFECTS_ROYALTY = .03
    const shares = {}
    let totalRoyaltyPoints = 0
    for (const value of Object.values(royalty_tally)) {
        totalRoyaltyPoints += value
    }
    for (const [key, value] of Object.entries(royalty_tally)) {
        const share = (value / totalRoyaltyPoints) * TOTAL_EFFECTS_ROYALTY * royalties["decimals"]
        shares[key] = share
    }
    royalties["shares"] = shares
}