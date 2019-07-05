import { SendTransaction, WithCreator} from "@iov/bcp"
import { antnet, connect, createWallet, disconnect, ensureWalletFunds, pprint, signAndCommit } from "./wallet";

describe("createWallet", () => {
  it("returns a deterministic address", async () => {
    const wallet = await createWallet();
    expect(wallet.address).toBeTruthy();

    const wallet2 = await createWallet(wallet.mnemonic);

    expect(wallet2.address).toEqual(wallet.address);
  });
});

describe("ensureAccount", () => {
  // This passes but antnet faucet is rate-limited.
  // "can send tokens" tests this and more, only enable this in it's place if that one fails
  xit("creates a new account", async () => {
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

  it("can send tokens", async () => {
    const mine = await createWallet();
    const other = await createWallet();
    const conn = await connect(mine);
    try {
      const acct = await ensureWalletFunds(conn);
      let yours = await conn.query.getAccount({address: other.address});
      expect(yours).toBeUndefined();

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: mine.id,
        sender: mine.address, // this account must have money
        recipient: other.address,
        memo: "My first transaction",
        amount: { // 0.123 IOV (9 sig figs in tx codec)
          quantity: '123000000',
          fractionalDigits: 9,
          tokenTicker: antnet.token,
        },
      };
      const result = await signAndCommit(conn, sendTx);
      // this should be something big on antnet
      expect(result.height).toBeGreaterThan(1000);

      yours = await conn.query.getAccount({address: other.address});
      expect(yours).toBeDefined();
      expect(yours!.balance.length).toEqual(1);
      expect(yours!.balance[0].tokenTicker).toEqual(antnet.token);
    } finally {
      disconnect(conn);
    }
  });
});
