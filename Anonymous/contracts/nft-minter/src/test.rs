#![cfg(test)]
use super::*;
use soroban_sdk::{Address, Env, String};

#[test]
fn test_mint_nft() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTMinter);
    let client = NFTMinterClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    
    let token_id = client.mint(
        &owner,
        &String::from_str(&env, "Test NFT"),
        &String::from_str(&env, "Test Description"),
        &String::from_str(&env, "https://example.com/nft.jpg"),
    );

    assert_eq!(token_id, 1);
}

#[test]
fn test_get_nft() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTMinter);
    let client = NFTMinterClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    
    let token_id = client.mint(
        &owner,
        &String::from_str(&env, "My NFT"),
        &String::from_str(&env, "Cool NFT"),
        &String::from_str(&env, "https://example.com/nft.jpg"),
    );

    let nft = client.get_nft(&token_id);
    
    assert_eq!(nft.token_id, token_id);
    assert_eq!(nft.name, String::from_str(&env, "My NFT"));
    assert_eq!(nft.description, String::from_str(&env, "Cool NFT"));
}

#[test]
fn test_get_owner() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTMinter);
    let client = NFTMinterClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    
    let token_id = client.mint(
        &owner,
        &String::from_str(&env, "My NFT"),
        &String::from_str(&env, "Description"),
        &String::from_str(&env, "https://example.com/nft.jpg"),
    );

    let nft_owner = client.get_owner(&token_id);
    assert_eq!(nft_owner, owner);
}

#[test]
fn test_get_total_supply() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTMinter);
    let client = NFTMinterClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    
    assert_eq!(client.get_total_supply(), 0);
    
    client.mint(
        &owner,
        &String::from_str(&env, "NFT 1"),
        &String::from_str(&env, "Desc 1"),
        &String::from_str(&env, "https://example.com/1.jpg"),
    );
    
    assert_eq!(client.get_total_supply(), 1);
    
    client.mint(
        &owner,
        &String::from_str(&env, "NFT 2"),
        &String::from_str(&env, "Desc 2"),
        &String::from_str(&env, "https://example.com/2.jpg"),
    );
    
    assert_eq!(client.get_total_supply(), 2);
}

#[test]
fn test_sequential_minting() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTMinter);
    let client = NFTMinterClient::new(&env, &contract_id);

    let owner1 = Address::generate(&env);
    let owner2 = Address::generate(&env);
    
    let token_id_1 = client.mint(
        &owner1,
        &String::from_str(&env, "NFT 1"),
        &String::from_str(&env, "Desc 1"),
        &String::from_str(&env, "https://example.com/1.jpg"),
    );
    
    let token_id_2 = client.mint(
        &owner2,
        &String::from_str(&env, "NFT 2"),
        &String::from_str(&env, "Desc 2"),
        &String::from_str(&env, "https://example.com/2.jpg"),
    );
    
    assert_eq!(token_id_1, 1);
    assert_eq!(token_id_2, 2);
    assert_eq!(client.get_total_supply(), 2);
}
