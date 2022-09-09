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

Clarinet.test({name: "fund funding: initial values",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-total-fund-funding", [
      types.uint(0)
    ], deployer.address);
    call.result.expectUint(0);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-user-fund-funding", [
      types.uint(0),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectUint(0);
  }
});

Clarinet.test({name: "fund funding: can parse and validate BTC transaction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "parse-and-validate-tx", [
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectOk().expectUint(555);
  }
});

Clarinet.test({name: "fund funding: can add user funding via BTC transaction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("fund-registry-v1-1", "register-fund", [
        types.buff(receiverAddress)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectOk().expectUint(555);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-total-fund-funding", [
      types.uint(0)
    ], deployer.address);
    call.result.expectUint(555);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-user-fund-funding", [
      types.uint(0),
      types.buff(senderAddress)
    ], deployer.address);
    call.result.expectUint(555);
  }
});

// 
// Errors
// 

Clarinet.test({name: "fund funding: can not add user funding if fund not registered",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectErr().expectUint(20001);
  }
});

Clarinet.test({name: "fund funding: can not add user funding with wrong sender/receiver",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("fund-registry-v1-1", "register-fund", [
        types.buff(receiverAddress)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(receiverAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectErr().expectUint(20004);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(senderAddress)
    ], deployer.address);
    call.result.expectErr().expectUint(20005);
  }
});

Clarinet.test({name: "fund funding: can only add user funding via BTC transaction once",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("fund-registry-v1-1", "register-fund", [
        types.buff(receiverAddress)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectOk().expectUint(555);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectErr().expectUint(20006);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-total-fund-funding", [
      types.uint(0)
    ], deployer.address);
    call.result.expectUint(555);

    call = await chain.callReadOnlyFn("fund-funding-v1-1", "get-user-fund-funding", [
      types.uint(0),
      types.buff(senderAddress)
    ], deployer.address);
    call.result.expectUint(555);
  }
});

Clarinet.test({name: "fund funding: can not fund fund if protocol disabled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let txHex = "0200000001364f7dae358309253ac24998fb5d234efce3ce7b4fac2b33607453fc457c07c30000000000ffffffff022138f80300000000160014dad7767ffc5a900d5bdc539f70db46051f3a41172b020000000000001600149bb0bab766d6fabf0da9f2e9bbb065010a0bf65600000000";
    let txId = hexToBytes("0x1dbb37887cadedb9e2b66439432440fcb8a55449ac248aabb5ab2e3042addcee");

    let senderAddress = hexToBytes('0x0014dad7767ffc5a900d5bdc539f70db46051f3a4117');
    let receiverAddress = hexToBytes('0x00149bb0bab766d6fabf0da9f2e9bbb065010a0bf656');

    let block = chain.mineBlock([
      Tx.contractCall("test-utils", "set-mined", [
        types.buff(txId)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("fund-registry-v1-1", "register-fund", [
        types.buff(receiverAddress)      
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);

    block = chain.mineBlock([
      Tx.contractCall("main", "set-contracts-enabled", [
        types.bool(false),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("fund-funding-v1-1", "add-user-funding", [
      types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fund-registry-v1-1"),
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
      types.buff(senderAddress),
      types.buff(receiverAddress)
    ], deployer.address);
    call.result.expectErr().expectUint(111002);
  }
});
