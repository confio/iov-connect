import { Account, Address, BlockchainConnection, ChainId, Identity, TokenTicker } from "@iov/bcp";
import { bnsCodec, bnsConnector, BnsConnection } from "@iov/bns";
import { MultiChainSigner } from '@iov/core';
import { Bip39, Random } from "@iov/crypto";
import { IovFaucet } from "@iov/faucets";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

// import { Encoding } from "@iov/encoding";
// const { fromHex, toHex } = Encoding;

export const antnet = {
  id: "bns-antnet" as ChainId,
  url: "wss://bns.antnet.iov.one:443",
  faucet: "https://bns-faucet.antnet.iov.one",
  token: "IOV" as TokenTicker,
};

export interface Wallet {
  readonly profile: UserProfile;
  readonly id: Identity;
  readonly mnemonic: string;
  readonly address: Address;
}

export interface Connection extends Wallet {
  readonly signer: MultiChainSigner;
  readonly query: BlockchainConnection;
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

  const address = bnsCodec.identityToAddress(id);

  return { profile, id, mnemonic, address };
}

export async function connect(wallet: Wallet): Promise<Connection> {
  const signer = new MultiChainSigner(wallet.profile);
  await signer.addChain(bnsConnector(antnet.url, antnet.id));
  const query = signer.connection(antnet.id);
  return {...wallet, signer, query};
}

export async function ensureWalletFunds(conn: Connection): Promise<Account> {
  let acct = await conn.query.getAccount({ address: conn.address });
  if (acct === undefined) {
    const faucet = new IovFaucet(antnet.faucet);
    await faucet.credit(conn.address, antnet.token);
    acct = await conn.query.getAccount({ address: conn.address });
    if (acct === undefined) {
      throw new Error("Account still undefined after faucet");
    }
  }
  return acct;
}

export function disconnect(conn: Connection): void {
  conn.signer.shutdown();
}

export function pprint(obj: any): void {
  console.log(JSON.stringify(obj, null, 2));
}
