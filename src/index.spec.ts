import { life } from "./index";

describe("life", () => {
  it("has an answer", () => {
    const answer = life();
    expect(answer).toEqual(42);
  });
});
