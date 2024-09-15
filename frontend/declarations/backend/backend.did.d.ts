import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Asset {
  'id' : bigint,
  'name' : string,
  'quantity' : number,
  'assetType' : string,
  'symbol' : string,
}
export interface _SERVICE {
  'addAsset' : ActorMethod<
    [
      {
        'name' : string,
        'quantity' : number,
        'assetType' : string,
        'symbol' : string,
      },
    ],
    undefined
  >,
  'getAssets' : ActorMethod<[], Array<Asset>>,
  'removeAsset' : ActorMethod<[bigint], undefined>,
  'updateAsset' : ActorMethod<
    [
      bigint,
      {
        'name' : string,
        'quantity' : number,
        'assetType' : string,
        'symbol' : string,
      },
    ],
    undefined
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
