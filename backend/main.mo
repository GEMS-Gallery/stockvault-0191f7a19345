import Array "mo:base/Array";
import Hash "mo:base/Hash";

import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor AssetStockHolding {
    public type StockHolding = {
        symbol: Text;
        quantity: Float;
        purchasePrice: Float;
        currentPrice: Float;
    };

    private stable var holdingsEntries : [(Text, StockHolding)] = [];
    private var holdings = HashMap.HashMap<Text, StockHolding>(10, Text.equal, Text.hash);

    system func preupgrade() {
        holdingsEntries := Iter.toArray(holdings.entries());
    };

    system func postupgrade() {
        holdings := HashMap.fromIter<Text, StockHolding>(holdingsEntries.vals(), 10, Text.equal, Text.hash);
    };

    public func addHolding(symbol: Text, quantity: Float, purchasePrice: Float) : async () {
        let holding : StockHolding = {
            symbol = symbol;
            quantity = quantity;
            purchasePrice = purchasePrice;
            currentPrice = purchasePrice; // Initialize with purchase price
        };
        holdings.put(symbol, holding);
    };

    public func removeHolding(symbol: Text) : async () {
        holdings.delete(symbol);
    };

    public query func getHoldings() : async [StockHolding] {
        return Iter.toArray(holdings.vals());
    };

    public query func calculateTotalValue() : async Float {
        var totalValue : Float = 0;
        for (holding in holdings.vals()) {
            totalValue += holding.quantity * holding.currentPrice;
        };
        return totalValue;
    };

    public func updateHolding(symbol: Text, quantity: Float, currentPrice: Float) : async () {
        switch (holdings.get(symbol)) {
            case (null) { /* Do nothing if holding doesn't exist */ };
            case (?existingHolding) {
                let updatedHolding : StockHolding = {
                    symbol = existingHolding.symbol;
                    quantity = quantity;
                    purchasePrice = existingHolding.purchasePrice;
                    currentPrice = currentPrice;
                };
                holdings.put(symbol, updatedHolding);
            };
        };
    };

    // Mock function to simulate getting current stock prices
    public func getCurrentPrices() : async [(Text, Float)] {
        let mockPrices = [
            ("AAPL", 150.0),
            ("GOOGL", 2800.0),
            ("MSFT", 300.0),
            ("AMZN", 3300.0),
            ("FB", 330.0)
        ];
        return mockPrices;
    };
}