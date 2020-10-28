[![GitHub](https://img.shields.io/github/license/hashgraph/hedera-hts-demo)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://hedera.com/discord)

# Hedera Token Service (HTS) demo

This demo is a user interface written in Javascript (Vue.JS) to illustrate the use of the Hedera Token Service. When first launched, the demo will create three accounts as follows:
* An account for the owner/admin of new tokens
* Two accounts representing users (wallet holders) that will use the token
Each account is credited 1 hBar to fund their activity on Hedera.

The demo enables you to:
* Create tokens
* Mint and Burn
* Associate and Dissociate tokens to/from accounts
* Manage KYC and Freeze for token/account relationships
* Transfer from treasury (owner) to users
* Transfer between users

## Prerequisites

* A preview net account
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
* VUE_APP_NETWORK="http://localhost"
* VUE_APP_INITIAL_BALANCE=1

## I just want to run it quickly

You can deploy the UI with docker-compose after you have edited the `.env` file above.

Build
```shell script
docker-compose build
```

Run
```shell script
docker-compose up
```

Note: `docker-compose` build is only necessary the first time, or if you make changes to the code or `.env` file to (re)build the images. 

## I want to build it myself

### gRPCWeb envoy proxy

The UI requires a gRPCWeb proxy in order to successfully send transactions to the Hedera network from the UI client.

The `envoy` folder has the necessary files to start one up using docker.

```shell script
cd envoy
./start-envoy.sh
```

(Note, the `envoy.yaml` file is currently setup to communicate with `previewNet`)

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

## Contributing

Contributions are welcome. Please see the [contributing](CONTRIBUTING.md) guide to see how you can get
involved.

## Code of Conduct

This project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are
expected to uphold this code of conduct. Please report unacceptable behavior to [oss@hedera.com](mailto:oss@hedera.com)

## License

[Apache License 2.0](LICENSE)
