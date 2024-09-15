export const idlFactory = ({ IDL }) => {
  const StockHolding = IDL.Record({
    'currentPrice' : IDL.Float64,
    'purchasePrice' : IDL.Float64,
    'quantity' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'addHolding' : IDL.Func([IDL.Text, IDL.Float64, IDL.Float64], [], []),
    'calculateTotalValue' : IDL.Func([], [IDL.Float64], ['query']),
    'getCurrentPrices' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Float64))],
        [],
      ),
    'getHoldings' : IDL.Func([], [IDL.Vec(StockHolding)], ['query']),
    'removeHolding' : IDL.Func([IDL.Text], [], []),
    'updateHolding' : IDL.Func([IDL.Text, IDL.Float64, IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
