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

Clarinet.test({name: "user registry: initial values",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let call = await chain.callReadOnlyFn("user-registry-v1-1", "get-btc-to-stx", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectNone();

    call = await chain.callReadOnlyFn("user-registry-v1-1", "get-stx-to-btc", [
      types.principal(deployer.address)      
    ], deployer.address);
    call.result.expectNone();

    call = await chain.callReadOnlyFn("user-registry-v1-1", "is-btc-registered", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectBool(false);

    call = await chain.callReadOnlyFn("user-registry-v1-1", "is-stx-registered", [
      types.principal(deployer.address)      
    ], deployer.address);
    call.result.expectBool(false);
  }
});

Clarinet.test({name: "user registry: register user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.principal(wallet_1.address),
        types.buff(address)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("user-registry-v1-1", "get-btc-to-stx", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectSome().expectPrincipal(wallet_1.address);

    call = await chain.callReadOnlyFn("user-registry-v1-1", "get-stx-to-btc", [
      types.principal(wallet_1.address)      
    ], deployer.address);
    call.result.expectSome().expectBuff(address);

    call = await chain.callReadOnlyFn("user-registry-v1-1", "is-btc-registered", [
      types.buff(address)      
    ], deployer.address);
    call.result.expectBool(true);

    call = await chain.callReadOnlyFn("user-registry-v1-1", "is-stx-registered", [
      types.principal(wallet_1.address)      
    ], deployer.address);
    call.result.expectBool(true);
  }
});

// 
// Errors
// 

Clarinet.test({name: "user registry: can not register same BTC public key twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let address = hexToBytes('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');

    let block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.principal(wallet_1.address),
        types.buff(address)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.principal(wallet_1.address),
        types.buff(address)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(30001);
  }
});
