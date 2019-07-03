import { createWallet } from "./index";

describe("wallet", () => {  
    it("has answer to life", () => {
        const answer = createWallet();
        expect(answer).toEqual(42);
    });
});  