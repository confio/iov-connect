import { Address, ChainId, Identity } from "@iov/bcp";
import { bnsCodec } from "@iov/bns";
import { Bip39, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

// const { fromHex, toHex } = Encoding;

export const antnet = {
  id: "bov-antnet" as ChainId,
  url: "https://bns.antnet.iov.one:443",
  faucet: "https://bns-faucet.antnet.iov.one",
};

export interface Wallet {
  readonly profile: UserProfile;
  readonly id: Identity;
  readonly mnemonic: string;
}

// create wallet will initialize a wallet with a random new, or a provided, mnemonic
// returned UserProfile will have one account set up for antnet
export async function createWallet(fromMnemonic?: string): Promise<Wallet> {
  let mnemonic: string;
  if (fromMnemonic !== undefined) {
    mnemonic = fromMnemonic;
  } else {
    // 16 bytes -> 12 word phrase
    const entropy16 = await Random.getBytes(16);
    mnemonic = Bip39.encode(entropy16).toString();
  }

  const profile = new UserProfile();
  const { id: walletId } = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
  // this creates an identity for antnet... we could add an ethereum id here if we wish as well
  const id = await profile.createIdentity(walletId, antnet.id, HdPaths.iov(0));
  profile.setIdentityLabel(id, "main account");

  return { profile, id, mnemonic };
}

export function walletAddress(wallet: Wallet): Address {
  return bnsCodec.identityToAddress(wallet.id);
}
