import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.31.0/index.ts";

import { hexToBytes } from "./utils.ts"

Clarinet.test({name: "dao funding: can parse BTC transaction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    // let txHex = "02000000000101364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf6560247304402201e8d751359a4b093e70ccb199d7f93aca70507658a1638e6a216ee80f40a69d902202b51b3e706011b51a7ba6807c39fe8b19928556a8be747c9abd26a93fde487e401210317a49245e880a09803dedf3930eda2b66f5ea69b0b85a74f71225ff68732c25900000000"
    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";

    let senderPublicKey = hexToBytes('0317a49245e880a09803dedf3930eda2b66f5ea69b0b85a74f71225ff68732c259');
    let receiverPublicKey = hexToBytes('02965a885cab024bdff8fe565484339a87925b8ed38ac0a5b5da1758874bfb9133');

    let call = await chain.callReadOnlyFn("dao-funding-v1-1", "get-hashed-public-key", [
      types.buff(senderPublicKey)      
    ], deployer.address);
    call.result.expectBuff(hexToBytes("0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117"));

    call = await chain.callReadOnlyFn("dao-funding-v1-1", "parse-and-validate-tx", [
      types.tuple({
        "header": types.buff(new ArrayBuffer(80)),
        "height": types.uint(1)
      }),
      types.list([]),
      types.buff(hexToBytes(txHex)),
      types.tuple({
        "tree-depth": types.uint(1),
        "tx-index": types.uint(1),
        "hashes": types.list([])
      }),
      types.uint(0),
      types.uint(1),
      types.buff(senderPublicKey),
      types.buff(receiverPublicKey)
    ], deployer.address);
    console.log("GOT: ", call.result);
    call.result.expectOk().expectUint(555);


    call = await chain.callReadOnlyFn("dao-funding-v1-1", "add-user-funding", [
      types.tuple({
        "header": types.buff(new ArrayBuffer(80)),
        "height": types.uint(1)
      }),
      types.list([]),
      types.buff(hexToBytes(txHex)),
      types.tuple({
        "tree-depth": types.uint(1),
        "tx-index": types.uint(1),
        "hashes": types.list([])
      }),
      types.uint(0),
      types.uint(1),
      types.buff(senderPublicKey),
      types.buff(receiverPublicKey)
    ], deployer.address);
    console.log("GOT: ", call.result);
    call.result.expectOk().expectUint(555);
  }
});