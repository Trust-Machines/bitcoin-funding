# Web setup

The project is using Electrum servers to facilitate fetching of wallet data end broadcasting transactions without the need to run a full node.

## Start services

 1. Run `clarinet integrate` to start a local bitcoin node
 2. Start local Electrum server `docker run -it -p 50001:50001 -e COIN=Bitcoin -e NET=regtest -e DAEMON_URL=http://devnet:devnet@host.docker.internal:18443 lukechilds/electrumx`
 3. Start Electrum in Regtest mode: `/Applications/Electrum.app/Contents/MacOS/run_electrum --regtest`

## Setup Electrum faucet wallet

 1. Import standard wallet with seed: https://github.com/hirosystems/clarinet/blob/9f410e34c80b86da776144a4cf7dab5d6eefd8d4/components/clarinet-files/src/network_manifest.rs#L28
 2. Options `bip39`
 3. Legacy wallet `p2pkh` with derivation path `m/44'/5757'/0'`
 4. Connect to Electrum server `localhost:50001:t`

## Start web server

 1. Copy `.env.example` to `.env`
 2. Run `npm run dev`
