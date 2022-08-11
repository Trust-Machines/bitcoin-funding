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

    let call = await chain.callReadOnlyFn("user-registry-v1-1", "get-btc-to-stx", [
      types.buff(hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58'))      
    ], deployer.address);
    call.result.expectNone();
  }
});

Clarinet.test({name: "user registry: register user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let publicKey = hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58');

    let block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.buff(publicKey)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("user-registry-v1-1", "get-btc-to-stx", [
      types.buff(hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58'))      
    ], deployer.address);
    call.result.expectSome().expectPrincipal(wallet_1.address);
  }
});

// 
// Errors
// 


Clarinet.test({name: "user registry: can not register same BTC public key twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let publicKey = hexToBytes('03edf5ed04204ac5ab55832bb893958123f123e45fa417cfe950e4ece67359ee58');

    let block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.buff(publicKey)      
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("user-registry-v1-1", "register-user", [
        types.buff(publicKey)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(30001);
  }
});
