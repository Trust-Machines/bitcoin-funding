import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.31.0/index.ts";

import { hexToBytes } from "./utils.ts"

Clarinet.test({name: "dao registry: initial values",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-count", [
    ], deployer.address);
    call.result.expectUint(0);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-by-id", [
      types.uint(0)
    ], deployer.address);
    call.result.expectNone();

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-id-by-public-key", [
      types.buff(hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58'))      
    ], deployer.address);
    call.result.expectNone();
  }
});

Clarinet.test({name: "dao registry: register DAO",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let publicKey = hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58');

    let block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(publicKey)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    let call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-count", [
    ], deployer.address);
    call.result.expectUint(1);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-by-id", [
      types.uint(0)
    ], deployer.address);
    call.result.expectSome().expectTuple()['admin'].expectPrincipal(wallet_1.address);
    call.result.expectSome().expectTuple()['public-key'].expectBuff(publicKey);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-id-by-public-key", [
      types.buff(publicKey)      
    ], deployer.address);
    call.result.expectSome().expectUint(0);
  }
});

Clarinet.test({name: "dao registry: can not register DAO with already registered public key",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;

    let publicKey = hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58');

    let block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(publicKey)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(publicKey)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(10001);
  }
});

Clarinet.test({name: "dao registry: can parse BTC transaction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // let txHex = "02000000000101444de7b264ab2edff8558a4257a2609948ec575b2329c5062ae8b89b77f8aa790000000000ffffffff02f98c420000000000160014982c47483e6b5f9045434660e87f54a5193149a339300000000000001976a914eabc65f3e890fb8bf20d153e95119c72d85765a988ac02483045022100fe850d806b77732aad8542276c91cbb81968ef66045bd9e75a90634e56ffff6c02200142ae053af024dffbebaf0e92aa407cf8be9b5e86b0e5899cebf09126ee266301210346d9beacfd3672f1f90aaa7be4a1f00243435b3bc10b82315c869bea5344bcc900000000"
    let txHex = "0200000001444de7b264ab2edff8558a4257a2609948ec575b2329c5062ae8b89b77f8aa790000000000ffffffff02f98c420000000000160014982c47483e6b5f9045434660e87f54a5193149a339300000000000001976a914eabc65f3e890fb8bf20d153e95119c72d85765a988ac00000000";

    let call = await chain.callReadOnlyFn("clarity-bitcoin", "parse-tx", [
      types.buff(hexToBytes(txHex))      
    ], deployer.address);
    // call.result.expectNone();

    call = await chain.callReadOnlyFn("dao-funding-v1-1", "parse-tx", [
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
      types.uint(1)  
    ], deployer.address);
    // call.result.expectOk().expectTuple()['mined'].expectBool(true);
    call.result.expectOk().expectTuple()['recipient'].expectBuff(hexToBytes("0x76a914eabc65f3e890fb8bf20d153e95119c72d85765a988ac"));
    call.result.expectOk().expectTuple()['sats'].expectUint(12345);

  }
});