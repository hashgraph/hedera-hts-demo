[![GitHub license](https://img.shields.io/github/license/hashgraph/hedera-hts-demo)](https://github.com/hashgraph/hedera-hts-demo/blob/master/LICENSE)
[![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://hedera.com/discord)

# Hedera Token Service (HTS) demo

This demo is a user interface written in Javascript (Vue.JS) to illustrate the use of the Hedera Token Service. When first launched, the demo will create three accounts as follows:
* An account for the owner/admin of new tokens
* Two accounts representing users (wallet holders) that will use the token, Alice and Bob
* Anoter account representing a marketplace (escrow) for the purpose of holding tokens that have been offered for sale

Each account is credited some hBar to fund their activity on Hedera.

The demo enables you to:
* Create tokens
* Mint and Burn
* Associate and Dissociate tokens to/from accounts
* Manage KYC and Freeze for token/account relationships
* Transfer from treasury (owner) to users
* Transfer between users
* Atomically transfer up to two tokens between users, with an optional hBar payment as one atomic transaction

For convenience, accounts and tokens created during the demo will be persisted to a cookie and will be available when the demo is restarted.

** Note: This is purely for demonstration purposes and should not be used as-is in production **

## Prerequisites

* A testnet or mainnet account
* Node.js v14.9.0
* Yarn 1.22.10
* Docker 
* Docker compose (optional)

## Environment files

The project requires an environment file to be setup. 
First, copy `.env.sample` to `.env`
Edit `.env` and setup the following variables

* VUE_APP_OPERATOR_ID=0.0.xxxx Input your operator id 
* VUE_APP_OPERATOR_KEY=302xxx Input your private key
* VUE_APP_INITIAL_BALANCE=1

## I just want to run it quickly

You can deploy the UI with docker-compose after you have edited the `.env` file above.

Build
```shell script
docker-compose build --no-cache
```

Run
```shell script
docker-compose up
```

Note: `docker-compose` build is only necessary the first time, or if you make changes to the code to (re)build the images. 

## I want to build it myself

### Project setup
```
yarn install
```

#### Compiles and hot-reloads for development
```
yarn serve
```

#### Compiles and minifies for production
```
yarn build
```

#### Lints and fixes files
```
yarn lint
```

## Using the UI

Navigate to the URL output by the `serve` command (e.g. http://localhost:8080/) to access the UI.
If you are running docker-compose, the url is `http://localhost:8080`.

The Header has links for the following:
* An admin page where you can manage tokens
* Accounts for the users
* A `+` button to add a token
* A button to show a list of transactions that were executed while running the demo (newest at the top)
* A button to reset (nuke) the demo. This will remove all traces of the tokens and accounts in your browser and re-create a clean demo environment with three new accounts.

Once a token is created, you can:
* Show accounts associated with the token
* Mint (If a supply key was provided when the token was created)
* Burn (If a supply key was provided when the token was created) 
* Transfer from treasury to users
Note: Update and Delete are not currently supported

Clicking on the accounts button (left most) will show which accounts are currently associated with the token, from there you can:
* Freeze/UnFreeze an account in relation to the token (if a freeze key was provided when the token was created)
* Grant or Revoke KYC for an account in relation to the token (if a KYC key was provided when the token was created)
* Wipe an amount of tokens from an account (if a wipe key was provided when the token was created)

Choosing one of the user accounts in the header allows you to associate or dissociate the account from a token.
Once associated (and subject to the account being KYCd and unfrozen if appropriate for the token), you can transfer to the other user account.

## NFTs

Support for creating NFTs is demonstrated in the composer whereby a set of templates (driven from `/public/tokenTemplates.json`) are available within the UI when creating an NFT.
Each template carries a set of properties that are input during the token creation.
These properties (along with an image if necessary) as then stored in an immutable file on Hedera, the resulting FileId is used to define the symbol for the token, e.g. HEDERA://0.0.xxxx.

You may edit or add to the templates by editing the `/public/tokenTemplates.json` file, following guidelines from [the vjsf component](https://koumoul-dev.github.io/vuetify-jsonschema-form/latest/about).
Note that if you wish to include a picture in your NFT specification, the property must be called `photo` since the UI depends on that field value.

## Contributing

Contributions are welcome. Please see the [contributing](CONTRIBUTING.md) guide to see how you can get
involved.

## Code of Conduct

This project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are
expected to uphold this code of conduct. Please report unacceptable behavior to [oss@hedera.com](mailto:oss@hedera.com)

## License

[Apache License 2.0](LICENSE)
