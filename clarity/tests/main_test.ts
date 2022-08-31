import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet/index.ts";

// 
// Core
// 

Clarinet.test({name: "main: initial values",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let call = await chain.callReadOnlyFn("main", "get-contracts-owner", [], deployer.address);
    call.result.expectPrincipal(deployer.address);

    call = await chain.callReadOnlyFn("main", "get-contracts-enabled", [], deployer.address);
    call.result.expectBool(true);

    let block = chain.mineBlock([
      Tx.contractCall("main", "check-is-enabled", [], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("main", "check-is-owner", [
        types.principal(deployer.address),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({name: "main: only owner can disable protocol",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("main", "set-contracts-enabled", [
        types.bool(false),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(111001);

    block = chain.mineBlock([
      Tx.contractCall("main", "set-contracts-enabled", [
        types.bool(false),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("main", "get-contracts-enabled", [], deployer.address);
    call.result.expectBool(false);

    block = chain.mineBlock([
      Tx.contractCall("main", "check-is-enabled", [], deployer.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(111002);
  }
});

Clarinet.test({name: "main: only owner can update owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("main", "set-contracts-owner", [
        types.principal(wallet_1.address),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(111001);

    block = chain.mineBlock([
      Tx.contractCall("main", "set-contracts-owner", [
        types.principal(wallet_1.address),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("main", "get-contracts-owner", [], deployer.address);
    call.result.expectPrincipal(wallet_1.address);

    block = chain.mineBlock([
      Tx.contractCall("main", "check-is-owner", [
        types.principal(wallet_1.address),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("main", "check-is-owner", [
        types.principal(deployer.address),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(111001);
  }
});
