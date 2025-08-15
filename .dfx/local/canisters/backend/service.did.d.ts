import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'checkFileExists' : ActorMethod<[string], boolean>,
  'deleteFile' : ActorMethod<[string], boolean>,
  'getFile' : ActorMethod<[string], [] | [Uint8Array | number[]]>,
  'getFileType' : ActorMethod<[string], [] | [string]>,
  'getFiles' : ActorMethod<
    [],
    Array<
      {
        'hash' : string,
        'name' : string,
        'size' : bigint,
        'fileType' : string,
        'timestamp' : bigint,
      }
    >
  >,
  'uploadFile' : ActorMethod<
    [string, Uint8Array | number[], string],
    undefined
  >,
  'verifyFileByHash' : ActorMethod<
    [string],
    [] | [{ 'name' : string, 'fileType' : string, 'timestamp' : bigint }]
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
