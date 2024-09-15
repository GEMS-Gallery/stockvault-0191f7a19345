export const idlFactory = ({ IDL }) => {
  const Asset = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'quantity' : IDL.Float64,
    'assetType' : IDL.Text,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'addAsset' : IDL.Func([Asset], [], []),
    'getAssets' : IDL.Func([], [IDL.Vec(Asset)], ['query']),
    'removeAsset' : IDL.Func([IDL.Nat], [], []),
    'updateAsset' : IDL.Func([IDL.Nat, Asset], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
