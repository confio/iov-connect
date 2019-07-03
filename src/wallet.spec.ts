import { connect, createWallet, disconnect, ensureWalletFunds, pprint } from "./wallet";

describe("createWallet", () => {
  it("returns a deterministic address", async () => {
    const wallet = await createWallet();
    expect(wallet.address).toBeTruthy();

    const wallet2 = await createWallet(wallet.mnemonic);

    expect(wallet2.address).toEqual(wallet.address);
  });
});

describe("ensureAccount", () => {
  it("creates a new account", async () => {
    const wallet = await createWallet();
    const conn = await connect(wallet);
    try {
      const acct = await ensureWalletFunds(conn);
      expect(acct).toBeDefined();
      pprint(acct.address);
      pprint(acct.balance);
      expect(acct.balance.length).toEqual(1);
    } finally {
      disconnect(conn);
    }
  });
});
