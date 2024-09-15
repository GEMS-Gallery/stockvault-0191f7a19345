import Bool "mo:base/Bool";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
    public type Asset = {
        id: Nat;
        symbol: Text;
        name: Text;
        quantity: Float;
        assetType: Text;
    };

    private stable var assets: [Asset] = [];
    private stable var nextId: Nat = 1;

    public query func getAssets() : async [Asset] {
        assets
    };

    public func addAsset(asset: Asset) : async () {
        let newAsset: Asset = {
            id = nextId;
            symbol = Text.toUppercase(asset.symbol);
            name = asset.name;
            quantity = asset.quantity;
            assetType = asset.assetType;
        };
        assets := Array.append(assets, [newAsset]);
        nextId += 1;
    };

    public func updateAsset(id: Nat, updatedAsset: Asset) : async () {
        assets := Array.map<Asset, Asset>(assets, func (asset: Asset) : Asset {
            if (asset.id == id) {
                {
                    id = asset.id;
                    symbol = Text.toUppercase(updatedAsset.symbol);
                    name = updatedAsset.name;
                    quantity = updatedAsset.quantity;
                    assetType = updatedAsset.assetType;
                }
            } else {
                asset
            }
        });
    };

    public func removeAsset(id: Nat) : async () {
        assets := Array.filter<Asset>(assets, func(asset: Asset) : Bool {
            asset.id != id
        });
    };
}