import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface StockHolding {
  'currentPrice' : number,
  'purchasePrice' : number,
  'quantity' : number,
  'symbol' : string,
}
export interface _SERVICE {
  'addHolding' : ActorMethod<[string, number, number], undefined>,
  'calculateTotalValue' : ActorMethod<[], number>,
  'getCurrentPrices' : ActorMethod<[], Array<[string, number]>>,
  'getHoldings' : ActorMethod<[], Array<StockHolding>>,
  'removeHolding' : ActorMethod<[string], undefined>,
  'updateHolding' : ActorMethod<[string, number, number], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
