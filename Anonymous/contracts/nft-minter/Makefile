default: build

build:
	cargo build --target wasm32-unknown-unknown --release

optimize:
	soroban contract optimize --wasm target/wasm32-unknown-unknown/release/nft_minter.wasm

test:
	cargo test

clean:
	cargo clean

.PHONY: build optimize test clean
