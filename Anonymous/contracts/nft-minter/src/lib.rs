#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Counter,
    Nft(u64),
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct NFT {
    pub token_id: u64,
    pub name: String,
    pub description: String,
    pub uri: String,
    pub owner: Address,
}

#[contract]
pub struct NFTMinter;

#[contractimpl]
impl NFTMinter {
    pub fn mint(env: Env, owner: Address, name: String, description: String, uri: String) -> u64 {
        // Get current counter
        let mut token_id: u64 = env
            .storage()
            .instance()
            .get::<DataKey, u64>(&DataKey::Counter)
            .unwrap_or(0);
        token_id += 1;

        // Create NFT
        let nft = NFT {
            token_id,
            name,
            description,
            uri,
            owner: owner.clone(),
        };

        // Store counter
        env.storage().instance().set(&DataKey::Counter, &token_id);

        // Store NFT by token_id
        env.storage().instance().set(&DataKey::Nft(token_id), &nft);

        // Emit mint event
        env.events().publish(
            ("mint",),
            (token_id, owner),
        );

        env.storage().instance().extend_ttl(5000, 5000);
        token_id
    }

    pub fn get_nft(env: Env, token_id: u64) -> NFT {
        match env.storage().instance().get::<DataKey, NFT>(&DataKey::Nft(token_id)) {
            Some(nft) => nft,
            None => NFT {
                token_id: 0,
                name: String::from_str(&env, "NFT not found"),
                description: String::from_str(&env, ""),
                uri: String::from_str(&env, ""),
                owner: env.current_contract_address(),
            },
        }
    }

    pub fn get_owner(env: Env, token_id: u64) -> Address {
        let nft = Self::get_nft(env, token_id);
        nft.owner
    }

    pub fn get_total_supply(env: Env) -> u64 {
        env.storage()
            .instance()
            .get::<DataKey, u64>(&DataKey::Counter)
            .unwrap_or(0)
    }
}
