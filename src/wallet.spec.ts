import { createWallet, walletAddress } from "./wallet";

describe("createWallet", () => {
    it("returns a deterministic address", async () => {
        const wallet = await createWallet();
        const addr = walletAddress(wallet);
        console.log(addr);

        const wallet2 = await createWallet(wallet.mnemonic);
        const addr2 = walletAddress(wallet2);

        expect(addr).toEqual(addr2);
    })
});