# iov-connect

Integrating iov-core and wallet-connect

## Installation

```shell
yarn install
# testing will also compile the ts files
yarn test
```

## Interactive Usage

In two terminals, run the following command: `yarn cli`

You can look deeper into the [iov-cli documentation](https://github.com/iov-one/iov-core/blob/master/packages/iov-cli/README.md)
and some example scripts in [iov-core](https://github.com/iov-one/iov-core/blob/master/packages/iov-core/README.md).
I wrote some opinionated higher-level helpers to make the cli usage a little less typing, which are in `wallet.ts`.

One issue with the cli tool is the import base path is not `pwd` but somewhere inside the iov-cli source code, so
to import custom additions, you need to use absolute filesystem paths. Run `pwd` in your terminal and
replace `PWD` in all the following code with that value. I assume that `pwd` is set to the root directory of this project
(same dir as this README file)

### Terminal One

```ts
import { antnet, connect, createWallet, disconnect, ensureWalletFunds, pprint, signAndCommit } from "PWD/src/wallet";
// eg. ... from "/home/ethan/js/iov-connect/src/wallet";

const wallet = await createWallet();
const conn = await connect(wallet);
const {address, mnemonic} = wallet;
pprint({address, mnemonic})

const acct = await ensureWalletFunds(conn);
pprint(acct);
```

### Terminal Two

```ts
import { antnet, connect, createWallet, disconnect, ensureWalletFunds, pprint, signAndCommit } from "PWD/src/wallet";
// eg. ... from "/home/ethan/js/iov-connect/src/wallet";

const wallet = await createWallet();
const conn = await connect(wallet);
const {address, mnemonic} = wallet;
pprint({address, mnemonic})

// Do not get funds... show there is no account (following should return `undefined`)
await conn.query.getAccount({ address: conn.address });
```

### Terminal One

In the following code, replace RCPT with the address printed out on terminal two

```ts
import {WithCreator} from "@iov/bcp";

.editor
const sendTx: SendTransaction & WithCreator = {
  kind: "bcp/send",
  creator: conn.id,
  sender: conn.address,
  recipient: RCPT as Address,
  // eg. recipient: "tiov1al220ezg72x85vzn3e7t6qw9vt80xntpuu5fx3" as Address,
  memo: "iov-cli demo",
  amount: { // 1.234 IOV (9 sig figs in tx codec)
    quantity: '1234000000',
    fractionalDigits: 9,
    tokenTicker: antnet.token,
  },
};
^D
const response = await signAndCommit(conn, sendTx)
pprint(response)
```

### Terminal Two

Go back to terminal two to ensure the funds have arrived

```ts
```

TODO: show tx queries
