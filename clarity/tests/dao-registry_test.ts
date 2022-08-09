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
