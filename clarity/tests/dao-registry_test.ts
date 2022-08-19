import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet/index.ts";

import { hexToBytes } from "./utils.ts"

// 
// Core
// 

Clarinet.test({name: "dao registry: initial values",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-count", [
    ], deployer.address);
    call.result.expectOk().expectUint(0);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-by-id", [
      types.uint(0)
    ], deployer.address);
    call.result.expectOk().expectNone();

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-id-by-address", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectOk().expectNone();

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "is-dao-registered", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectOk().expectBool(false);
  }
});

Clarinet.test({name: "dao registry: register DAO",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(address)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    let call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-count", [
    ], deployer.address);
    call.result.expectOk().expectUint(1);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-by-id", [
      types.uint(0)
    ], deployer.address);
    call.result.expectOk().expectSome().expectTuple()['admin'].expectPrincipal(wallet_1.address);
    call.result.expectOk().expectSome().expectTuple()['address'].expectBuff(address);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "get-dao-id-by-address", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectOk().expectSome().expectUint(0);

    call = await chain.callReadOnlyFn("dao-registry-v1-1", "is-dao-registered", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectOk().expectBool(true);
  }
});

// 
// Errors
// 

Clarinet.test({name: "dao registry: can not register DAO with already registered public key",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(address)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    block = chain.mineBlock([
      Tx.contractCall("dao-registry-v1-1", "register-dao", [
        types.buff(address)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(10001);
  }
});
