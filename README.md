# OrangeFund.us

Orange Fund is a crowdfunding/fundraising platform that allows projects to raise native Bitcoin (BTC)

## Deploy OrangeFund

In order to deploy an instance of OrangeFund, you can follow these steps:

0. Run `npm i` in the `web/` folder
1. Set up a SQL database and run the following commands in the `web` folder
  - `npx db push` to create and push updates to your SQL db according to `schema.prisma`
  - `npx prisma generate` to update your schema definitions in prisma
  - `npx prisma studio` to run a UI to browse your DB
2. Set up an Electrum server to track Bitcoin deposits through your own xpub (extended public address) and set of private keys
3. Use `npm run start` to run the Next.js server locally

Don't forget to set your environment variables in the `.env` file (see `.env.example` for an example).
 
Additionally, you can deploy an instance of Orange Fund to Vercel (https://vercel.app/)

## Features

Current supported features:
- Create a project to raise BTC on a wallet with your own set of private keys
- Host an Electrum Server instance to support any Bitcoin wallet (whether it's a CEX withdrawal or a person's private wallet)
- Keep track of each funding event through on-chain governance on Stacks
- Upload rich media (jpeg, png, mp4, ...) to showcase the uniqueness of your project

## Security

IMPORTANT: OrangeFund has not been audited by any external firm as of today.

## Clarity Usage  

### Requires Clarinet 

Install Clarinet: https://github.com/hirosystems/clarinet

OrangeFund is partly written in Clarity and therefore requires you to install Clarinet locally on the command line. Type the following command to check that you have Clarinet installed: 

```bash
$ clarinet --version
```

Please make sure you have Clarinet version 0.31.1 or higher installed.

### Download OrangeFund

1. Clone the repo: 

```bash
$ git clone git@github.com:Trust-Machines/bitcoin-funding.git && cd bitcoin-funding
```

2. Run the unit test to confirm all the tests passed and everything is working: 

```bash
$ clarinet test
```

3. Open the Clarinet console in order to interact with the contract 

```bash
$ clarinet console
```
