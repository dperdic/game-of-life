// use anchor_lang::prelude::*;
// use anchor_lang::solana_program::program::invoke_signed;

// use mpl_bubblegum::{
//     accounts::TreeConfig,
//     instructions::{
//         MintToCollectionV1Cpi, MintToCollectionV1CpiAccounts, MintToCollectionV1InstructionArgs,
//     },
//     types::MetadataArgs,
//     utils::get_asset_id,
// };

// declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

// #[program]
// pub mod game_of_life {
//     use super::*;

//     pub fn initialize_board(ctx: Context<InitializeBoard>, packed_board: [u8; 144]) -> Result<()> {
//         ctx.accounts.board.packed_board = packed_board;
//         Ok(())
//     }

//     pub fn mint_nft(
//         ctx: Context<MintNft>,
//         metadata: MetadataArgs,
//         packed_board: [u8; 144],
//     ) -> Result<()> {
//         // Create the CPI context for minting the compressed NFT
//         let cpi_program = ctx.accounts.bubblegum_program.to_account_info();

//         let cpi_accounts = MintToCollectionV1CpiAccounts {
//             tree_config: &ctx.accounts.tree_config,
//             leaf_owner: &ctx.accounts.leaf_owner,
//             leaf_delegate: &ctx.accounts.leaf_owner,
//             merkle_tree: &ctx.accounts.merkle_tree,
//             payer: &ctx.accounts.leaf_owner,
//             tree_creator_or_delegate: &ctx.accounts.tree_authority,
//             collection_authority: &ctx.accounts.collection_authority,
//             collection_authority_record_pda: None,
//             collection_mint: &ctx.accounts.collection_mint,
//             collection_metadata: &ctx.accounts.collection_metadata,
//             collection_edition: &ctx.accounts.edition_account,
//             bubblegum_signer: &ctx.accounts.bubblegum_signer,
//             log_wrapper: &ctx.accounts.log_wrapper,
//             compression_program: &ctx.accounts.compression_program,
//             token_metadata_program: &ctx.accounts.token_metadata_program,
//             system_program: &ctx.accounts.system_program,
//         };

//         let tree_authority_seeds = &[
//             b"tree_authority".as_ref(),
//             &[*ctx.bumps.get("tree_authority").unwrap()],
//         ];
//         let collection_authority_seeds = &[
//             b"collection_authority".as_ref(),
//             &[*ctx.bumps.get("collection_authority").unwrap()],
//         ];
//         let signers = &[&tree_authority_seeds[..], &collection_authority_seeds[..]];

//         let cpi = MintToCollectionV1Cpi::new(
//             &cpi_program,
//             cpi_accounts,
//             MintToCollectionV1InstructionArgs {
//                 metadata: metadata.clone(),
//             },
//         );

//         cpi.invoke_signed(signers)?;

//         // Get the current leaf index (nonce) from the tree config
//         let tree_config = TreeConfig::try_from(&ctx.accounts.tree_config)?;
//         let nonce = tree_config.num_minted;

//         // Calculate the asset ID using mpl_bubblegum's get_asset_id function
//         let asset_id = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

//         // Now initialize the board
//         let board_initializer_seeds = &[
//             b"board_initializer".as_ref(),
//             &[*ctx.bumps.get("board_initializer").unwrap()],
//         ];
//         let board_initializer_signer = &[&board_initializer_seeds[..]];

//         let initialize_board_accounts = InitializeBoard {
//             board: ctx.accounts.board.to_account_info(),
//             payer: ctx.accounts.leaf_owner.to_account_info(),
//             system_program: ctx.accounts.system_program.to_account_info(),
//             board_initializer: ctx.accounts.board_initializer.to_account_info(),
//         };

//         let initialize_board_ctx = CpiContext::new_with_signer(
//             ctx.program_id.to_account_info(),
//             initialize_board_accounts,
//             board_initializer_signer,
//         );

//         initialize_board(initialize_board_ctx, packed_board)?;

//         Ok(())
//     }
// }

// #[derive(Accounts)]
// #[instruction(asset_id: Pubkey)]
// pub struct InitializeBoard<'info> {
//     #[account(
//         init,
//         payer = payer,
//         space = 8 + 144, // discriminator + packed_board
//         seeds = [asset_id.as_ref()],
//         bump
//     )]
//     pub board: Account<'info, Board>,

//     #[account(mut)]
//     pub payer: Signer<'info>,

//     pub system_program: Program<'info, System>,

//     /// CHECK: This is a PDA of the program used to ensure only the program can initialize boards
//     #[account(
//         seeds = [b"board_initializer"],
//         bump
//     )]
//     pub board_initializer: AccountInfo<'info>,
// }

// #[derive(Accounts)]
// pub struct MintNft<'info> {
//     #[account(mut)]
//     pub tree_config: AccountInfo<'info>,

//     #[account(mut)]
//     pub leaf_owner: Signer<'info>,

//     #[account(mut)]
//     pub merkle_tree: AccountInfo<'info>,

//     /// CHECK: This is the program itself, used as the tree authority
//     #[account(
//         seeds = [b"tree_authority"],
//         bump
//     )]
//     pub tree_authority: AccountInfo<'info>,

//     pub collection_mint: AccountInfo<'info>,

//     #[account(mut)]
//     pub collection_metadata: AccountInfo<'info>,

//     pub edition_account: AccountInfo<'info>,

//     pub bubblegum_signer: AccountInfo<'info>,

//     pub log_wrapper: AccountInfo<'info>,

//     pub compression_program: AccountInfo<'info>,

//     pub token_metadata_program: AccountInfo<'info>,

//     pub bubblegum_program: Program<'info, mpl_bubblegum::program::MplBubblegum>,

//     /// CHECK: This is the program itself, used as the collection authority
//     #[account(
//         seeds = [b"collection_authority"],
//         bump
//     )]
//     pub collection_authority: AccountInfo<'info>,

//     pub system_program: Program<'info, System>,

//     /// CHECK: This account is initialized in the instruction
//     #[account(mut)]
//     pub board: AccountInfo<'info>,

//     /// CHECK: This is a PDA of the program used to ensure only the program can initialize boards
//     #[account(
//         seeds = [b"board_initializer"],
//         bump
//     )]
//     pub board_initializer: AccountInfo<'info>,
// }

// #[account]
// pub struct Board {
//     packed_board: [u8; 144],
// }

// /// END USEFUL CODE
// use anchor_lang::prelude::*;
// use anchor_lang::solana_program::{keccak, program::invoke};
// use mpl_bubblegum::state::{metaplex_adapter::MetadataArgs, TreeConfig};
// use mpl_bubblegum::utils::{create_mint_to_collection_v1_ix, get_asset_id};

// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// #[program]
// pub mod cnft_program {
//     use super::*;

//     pub fn create_merkle_tree(
//         ctx: Context<CreateMerkleTree>,
//         max_depth: u32,
//         max_buffer_size: u32,
//     ) -> Result<()> {
//         let tree_config = &mut ctx.accounts.tree_config;
//         tree_config.authority = ctx.accounts.authority.key();
//         tree_config.height = max_depth;
//         tree_config.buffer_size = max_buffer_size;
//         Ok(())
//     }

//     pub fn mint_compressed_nft(
//         ctx: Context<MintCompressedNFT>,
//         metadata_args: MetadataArgs,
//         data_array: [u8; 144],
//     ) -> Result<()> {
//         // Create the mint instruction
//         let mint_ix = create_mint_to_collection_v1_ix(
//             ctx.accounts.bubblegum_program.key(),
//             ctx.accounts.tree_authority.key(),
//             ctx.accounts.leaf_owner.key(),
//             ctx.accounts.leaf_delegate.key(),
//             ctx.accounts.merkle_tree.key(),
//             ctx.accounts.payer.key(),
//             ctx.accounts.tree_delegate.key(),
//             ctx.accounts.collection_authority.key(),
//             ctx.accounts.collection_authority_record_pda.key(),
//             ctx.accounts.collection_mint.key(),
//             ctx.accounts.collection_metadata.key(),
//             ctx.accounts.edition_account.key(),
//             ctx.accounts.bubblegum_signer.key(),
//             ctx.accounts.log_wrapper.key(),
//             ctx.accounts.compression_program.key(),
//             ctx.accounts.token_metadata_program.key(),
//             metadata_args,
//         )
//         .unwrap();

//         // Execute the mint instruction
//         invoke(&mint_ix, &ctx.accounts.to_account_infos())?;

//         // Calculate the asset id (public key of the cNFT)
//         let asset_id = get_asset_id(
//             &ctx.accounts.merkle_tree.key(),
//             ctx.accounts.leaf_owner.key(),
//             ctx.accounts.leaf_delegate.key(),
//             0, // You might need to adjust this nonce value
//         );

//         // Create the seeds for the nft_data PDA
//         let nft_seeds = &[b"nft", asset_id.as_ref()];
//         let (nft_key, nft_bump) = Pubkey::find_program_address(nft_seeds, ctx.program_id);

//         // Prepare the accounts for the CPI to store_nft_data
//         let cpi_accounts = StoreNFTData {
//             nft_data: nft_key,
//             payer: ctx.accounts.payer.to_account_info(),
//             system_program: ctx.accounts.system_program.to_account_info(),
//         };

//         // Prepare the CPI context
//         let cpi_ctx = CpiContext::new(ctx.program.to_account_info(), cpi_accounts);

//         // Call store_nft_data via CPI
//         store_nft_data(cpi_ctx, asset_id, data_array, nft_bump)
//     }

//     pub fn store_nft_data(
//         ctx: Context<StoreNFTData>,
//         asset_id: Pubkey,
//         data_array: [u8; 144],
//         bump: u8,
//     ) -> Result<()> {
//         // Store the data array in the PDA
//         let nft_data = &mut ctx.accounts.nft_data;
//         nft_data.asset_id = asset_id;
//         nft_data.data = data_array;
//         nft_data.bump = bump;

//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct CreateMerkleTree<'info> {
//     #[account(init, payer = payer, space = 8 + 32 + 4 + 4)]
//     pub tree_config: Account<'info, TreeConfig>,
//     pub authority: Signer<'info>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(metadata_args: MetadataArgs)]
// pub struct MintCompressedNFT<'info> {
//     pub tree_authority: UncheckedAccount<'info>,
//     #[account(mut)]
//     pub leaf_owner: Signer<'info>,
//     pub leaf_delegate: Signer<'info>,
//     #[account(mut)]
//     pub merkle_tree: UncheckedAccount<'info>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub tree_delegate: Signer<'info>,
//     pub collection_authority: Signer<'info>,
//     pub collection_authority_record_pda: UncheckedAccount<'info>,
//     pub collection_mint: UncheckedAccount<'info>,
//     pub collection_metadata: UncheckedAccount<'info>,
//     pub edition_account: UncheckedAccount<'info>,
//     pub bubblegum_signer: UncheckedAccount<'info>,
//     pub log_wrapper: UncheckedAccount<'info>,
//     pub compression_program: UncheckedAccount<'info>,
//     pub token_metadata_program: UncheckedAccount<'info>,
//     pub system_program: Program<'info, System>,
//     pub bubblegum_program: UncheckedAccount<'info>,
// }

// #[derive(Accounts)]
// pub struct StoreNFTData<'info> {
//     #[account(init, payer = payer, space = 8 + 32 + 144 + 1, seeds = [b"nft", nft_data.asset_id.as_ref()], bump)]
//     pub nft_data: Account<'info, NFTData>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[account]
// pub struct NFTData {
//     pub asset_id: Pubkey,
//     pub data: [u8; 144],
//     pub bump: u8,
// }

// use anchor_lang::prelude::*;
// use anchor_lang::solana_program::{program::invoke, system_program};
// use mpl_bubblegum::state::TreeConfig;
// use mpl_bubblegum::types::MetadataArgs;
// use mpl_bubblegum::utils::get_asset_id;

// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// #[program]
// pub mod cnft_program {
//     use super::*;

//     pub fn create_merkle_tree(
//         ctx: Context<CreateMerkleTree>,
//         max_depth: u32,
//         max_buffer_size: u32,
//     ) -> Result<()> {
//         let tree_config = &mut ctx.accounts.tree_config;
//         tree_config.authority = ctx.accounts.authority.key();
//         tree_config.height = max_depth;
//         tree_config.buffer_size = max_buffer_size;
//         Ok(())
//     }

//     pub fn mint_compressed_nft(
//         ctx: Context<MintCompressedNFT>,
//         metadata_args: MetadataArgs,
//         data_array: [u8; 144],
//     ) -> Result<()> {
//         // Create the CPI context for minting the compressed NFT
//         let cpi_program = ctx.accounts.bubblegum_program.to_account_info();
//         let cpi_accounts = MintToCollectionV1CpiAccounts {
//             tree_config: &ctx.accounts.tree_config,
//             leaf_owner: &ctx.accounts.leaf_owner,
//             leaf_delegate: &ctx.accounts.leaf_delegate,
//             merkle_tree: &ctx.accounts.merkle_tree,
//             payer: &ctx.accounts.payer,
//             tree_creator_or_delegate: &ctx.accounts.tree_delegate,
//             collection_authority: ctx.program_id,
//             collection_authority_record_pda: None,
//             collection_mint: &ctx.accounts.collection_mint,
//             collection_metadata: &ctx.accounts.collection_metadata,
//             collection_edition: &ctx.accounts.edition_account,
//             bubblegum_signer: &ctx.accounts.bubblegum_signer,
//             log_wrapper: &ctx.accounts.log_wrapper,
//             compression_program: &ctx.accounts.compression_program,
//             token_metadata_program: &ctx.accounts.token_metadata_program,
//             system_program: &ctx.accounts.system_program,
//         };

//         let cpi = MintToCollectionV1Cpi::new(
//             &cpi_program,
//             cpi_accounts,
//             MintToCollectionV1InstructionArgs {
//                 metadata_args: metadata_args.clone(),
//             },
//         );

//         // Invoke the CPI
//         cpi.invoke()?;

//         // Calculate the asset id (public key of the cNFT)
//         let asset_id = get_asset_id(
//             &ctx.accounts.merkle_tree.key(),
//             ctx.accounts.leaf_owner.key(),
//             ctx.accounts.leaf_delegate.key(),
//             0, // You might need to adjust this nonce value
//         );

//         // Store the NFT data
//         let nft_data = &mut ctx.accounts.nft_data;
//         nft_data.asset_id = asset_id;
//         nft_data.data = data_array;

//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct CreateMerkleTree<'info> {
//     #[account(init, payer = payer, space = 8 + 32 + 4 + 4)]
//     pub tree_config: Account<'info, TreeConfig>,
//     pub authority: Signer<'info>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(metadata_args: MetadataArgs)]
// pub struct MintCompressedNFT<'info> {
//     pub tree_config: Account<'info, TreeConfig>,
//     #[account(mut)]
//     pub leaf_owner: Signer<'info>,
//     pub leaf_delegate: Signer<'info>,
//     #[account(mut)]
//     pub merkle_tree: AccountInfo<'info>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub tree_delegate: Signer<'info>,
//     pub collection_mint: AccountInfo<'info>,
//     #[account(mut)]
//     pub collection_metadata: AccountInfo<'info>,
//     pub edition_account: AccountInfo<'info>,
//     pub bubblegum_signer: AccountInfo<'info>,
//     pub log_wrapper: AccountInfo<'info>,
//     pub compression_program: AccountInfo<'info>,
//     pub token_metadata_program: AccountInfo<'info>,
//     pub system_program: Program<'info, System>,
//     pub bubblegum_program: AccountInfo<'info>,
//     #[account(
//         init,
//         payer = payer,
//         space = 8 + 32 + 144,
//         seeds = [b"nft", merkle_tree.key().as_ref()],
//         bump
//     )]
//     pub nft_data: Account<'info, NFTData>,
// }

// #[account]
// pub struct NFTData {
//     pub asset_id: Pubkey,
//     pub data: [u8; 144],
// }

// // Include the provided CPI structs and implementations here
// // (MintToCollectionV1CpiAccounts, MintToCollectionV1Cpi, etc.)

// use anchor_lang::prelude::*;
// use anchor_lang::solana_program::hash::hashv;

// use mpl_bubblegum::{
//     instructions::{
//         MintToCollectionV1Cpi, MintToCollectionV1CpiAccounts, MintToCollectionV1InstructionArgs,
//     },
//     types::MetadataArgs,
// };

// declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

// #[program]
// pub mod game_of_life {
//     use super::*;

//     pub fn initialize_board(
//         ctx: Context<InitializeBoard>,
//         asset_id: Pubkey,
//         packed_board: [u8; 144],
//     ) -> Result<()> {
//         ctx.accounts.board.packed_board = packed_board;
//         ctx.accounts.board.asset_id = asset_id;
//         Ok(())
//     }

//     pub fn mint_nft(
//         ctx: Context<MintNft>,
//         metadata: MetadataArgs,
//         packed_board: [u8; 144],
//     ) -> Result<()> {
//         // Create the CPI context for minting the compressed NFT
//         let cpi_program = ctx.accounts.bubblegum_program.to_account_info();

//         let cpi_accounts = MintToCollectionV1CpiAccounts {
//             tree_config: &ctx.accounts.tree_config,
//             leaf_owner: &ctx.accounts.leaf_owner,
//             leaf_delegate: &ctx.accounts.leaf_delegate,
//             merkle_tree: &ctx.accounts.merkle_tree,
//             payer: &ctx.accounts.payer,
//             tree_creator_or_delegate: &ctx.accounts.tree_delegate,
//             collection_authority: &ctx.accounts.collection_authority,
//             collection_authority_record_pda: None,
//             collection_mint: &ctx.accounts.collection_mint,
//             collection_metadata: &ctx.accounts.collection_metadata,
//             collection_edition: &ctx.accounts.edition_account,
//             bubblegum_signer: &ctx.accounts.bubblegum_signer,
//             log_wrapper: &ctx.accounts.log_wrapper,
//             compression_program: &ctx.accounts.compression_program,
//             token_metadata_program: &ctx.accounts.token_metadata_program,
//             system_program: &ctx.accounts.system_program,
//         };

//         let cpi = MintToCollectionV1Cpi::new(
//             &cpi_program,
//             cpi_accounts,
//             MintToCollectionV1InstructionArgs {
//                 metadata: metadata.clone(),
//             },
//         );

//         cpi.invoke()?;

//         // Calculate the asset ID
//         let asset_id = get_asset_id(
//             &ctx.accounts.merkle_tree.key(),
//             &ctx.accounts.leaf_owner.key(),
//             0, // nonce, you might need to adjust this
//         );

//         // Now initialize the board
//         let initialize_board_accounts = InitializeBoard {
//             board: ctx.accounts.board.to_account_info(),
//             payer: ctx.accounts.payer.to_account_info(),
//             system_program: ctx.accounts.system_program.to_account_info(),
//         };

//         let initialize_board_ctx =
//             CpiContext::new(ctx.program_id.to_account_info(), initialize_board_accounts);

//         initialize_board(initialize_board_ctx, asset_id, packed_board)?;

//         Ok(())
//     }
// }

// #[derive(Accounts)]
// #[instruction(asset_id: Pubkey)]
// pub struct InitializeBoard<'info> {
//     #[account(
//         init,
//         payer = payer,
//         space = 8 + 32 + 144, // discriminator + asset_id + packed_board
//         seeds = [b"board", asset_id.as_ref()],
//         bump
//     )]
//     pub board: Account<'info, Board>,

//     #[account(mut)]
//     pub payer: Signer<'info>,

//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct MintNft<'info> {
//     #[account(mut)]
//     pub leaf_owner: Signer<'info>,

//     #[account(mut)]
//     pub merkle_tree: AccountInfo<'info>,

//     #[account(mut)]
//     pub payer: Signer<'info>,

//     pub leaf_delegate: Signer<'info>,

//     pub tree_delegate: Signer<'info>,

//     pub collection_mint: AccountInfo<'info>,

//     pub tree_config: AccountInfo<'info>,

//     pub collection_metadata: AccountInfo<'info>,

//     pub edition_account: AccountInfo<'info>,

//     pub bubblegum_signer: AccountInfo<'info>,

//     pub log_wrapper: AccountInfo<'info>,

//     pub compression_program: AccountInfo<'info>,

//     pub token_metadata_program: AccountInfo<'info>,

//     pub bubblegum_program: AccountInfo<'info>,

//     pub collection_authority: AccountInfo<'info>,

//     pub system_program: Program<'info, System>,

//     /// CHECK: This account is initialized in the instruction
//     #[account(mut)]
//     pub board: AccountInfo<'info>,
// }

// #[account]
// pub struct Board {
//     asset_id: Pubkey,
//     packed_board: [u8; 144],
// }

// // Helper function to calculate asset ID
// pub fn get_asset_id(merkle_tree: &Pubkey, owner: &Pubkey, nonce: u64) -> Pubkey {
//     let serde_merkle_tree = anchor_lang::__private::base64::encode(merkle_tree);
//     let serde_owner = anchor_lang::__private::base64::encode(owner);
//     let serde_nonce = anchor_lang::__private::base64::encode(&nonce.to_le_bytes());

//     let hash = hashv(&[
//         b"asset",
//         serde_merkle_tree.as_bytes(),
//         serde_owner.as_bytes(),
//         serde_nonce.as_bytes(),
//     ]);

//     Pubkey::new_from_array(hash.to_bytes())
// }

// use anchor_lang::prelude::*;
// use anchor_lang::solana_program::system_instruction;

// declare_id!("Your_Program_ID");

// #[program]
// pub mod your_program {
//     use super::*;

//     pub fn create_and_initialize_pda(
//         ctx: Context<CreateAndInitializePDA>,
//         asset_id: [u8; 32], // Assuming asset_id is 32 bytes
//         data: [u8; 144],
//     ) -> Result<()> {
//         // Derive PDA
//         let (pda, bump) =
//             Pubkey::find_program_address(&[b"your_seed_prefix", asset_id.as_ref()], ctx.program_id);

//         // Verify that the derived PDA matches the account passed in
//         if pda != ctx.accounts.your_pda.key() {
//             return Err(ProgramError::InvalidAccountData.into());
//         }

//         // Create account
//         let account_space = 8 + 144; // discriminator + data
//         let rent = Rent::get()?;
//         let lamports = rent.minimum_balance(account_space);

//         let create_account_ix = system_instruction::create_account(
//             ctx.accounts.payer.key,
//             &pda,
//             lamports,
//             account_space as u64,
//             ctx.program_id,
//         );

//         anchor_lang::solana_program::program::invoke_signed(
//             &create_account_ix,
//             &[
//                 ctx.accounts.payer.to_account_info(),
//                 ctx.accounts.your_pda.to_account_info(),
//                 ctx.accounts.system_program.to_account_info(),
//             ],
//             &[&[b"your_seed_prefix", asset_id.as_ref(), &[bump]]],
//         )?;

//         // Initialize account data
//         let mut account = YourStruct::try_from_buf(&mut ctx.accounts.your_pda.data.borrow_mut())?;
//         account.data = data;
//         account.exit(ctx.accounts.your_pda.to_account_info())?;

//         Ok(())
//     }

//     // Add other instructions as needed...
// }

// #[derive(Accounts)]
// pub struct CreateAndInitializePDA<'info> {
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     /// CHECK: This PDA is created in the instruction
//     #[account(mut)]
//     pub your_pda: Account<'info, YourStruct>,
//     pub system_program: Program<'info, System>,
// }

// #[account]
// pub struct YourStruct {
//     pub data: [u8; 144],
// }

// use anchor_lang::prelude::*;

// use mpl_bubblegum::{
//     accounts::TreeConfig,
//     instructions::{
//         MintToCollectionV1Cpi, MintToCollectionV1CpiAccounts, MintToCollectionV1InstructionArgs,
//     },
//     types::MetadataArgs,
//     types::{Collection, Creator, TokenProgramVersion, TokenStandard},
//     utils::get_asset_id,
// };
// use spl_account_compression::{
//     cpi::{accounts::Initialize, init_empty_merkle_tree},
//     program::SplAccountCompression,
//     Noop,
// };

// declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

// #[program]
// pub mod game_of_life {

//     use super::*;

//     pub fn initialize_merkle_tree(
//         ctx: Context<InitializeMerkleTree>,
//         max_depth: u32,
//         max_buffer_size: u32,
//     ) -> Result<()> {
//         let cpi_program: AccountInfo<'_> =
//             ctx.accounts.account_compression_program.to_account_info();

//         let cpi_accounts: Initialize<'_> = Initialize {
//             merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
//             authority: ctx.accounts.tree_authority.to_account_info(),
//             noop: ctx.accounts.noop_program.to_account_info(),
//         };

//         let merkle_tree: Pubkey = ctx.accounts.merkle_tree.key();

//         let signer_seeds: &[&[&[u8]]] = &[&[merkle_tree.as_ref(), &[ctx.bumps.tree_authority]]];

//         let cpi_ctx: CpiContext<'_, '_, '_, '_, Initialize<'_>> =
//             CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

//         init_empty_merkle_tree(cpi_ctx, max_depth, max_buffer_size)?;

//         msg!("Merkle tree initialized successfully!");

//         Ok(())
//     }

//     pub fn mint_nft(
//         ctx: Context<MintNft>,
//         _packed_board: [u8; 144],
//         name: String,
//         symbol: String,
//         uri: String,
//     ) -> Result<()> {
//         let metadata_args: MetadataArgs = MetadataArgs {
//             name,
//             symbol,
//             uri,
//             seller_fee_basis_points: 10000,
//             is_mutable: false,
//             primary_sale_happened: false,
//             edition_nonce: None,
//             token_standard: Some(TokenStandard::NonFungible),
//             token_program_version: TokenProgramVersion::Original,
//             uses: None,
//             collection: Some(Collection {
//                 key: ctx.accounts.collection_mint.key(),
//                 verified: false,
//             }),
//             creators: vec![Creator {
//                 address: *ctx.program_id,
//                 verified: false,
//                 share: 100,
//             }],
//         };

//         // Create the CPI context for minting the compressed NFT
//         let cpi_program: AccountInfo<'_> = ctx.accounts.bubblegum_program.to_account_info();

//         let cpi_accounts: MintToCollectionV1CpiAccounts<'_, '_> = MintToCollectionV1CpiAccounts {
//             tree_config: &ctx.accounts.tree_config,
//             leaf_owner: &ctx.accounts.leaf_owner,
//             leaf_delegate: &ctx.accounts.leaf_owner,
//             merkle_tree: &ctx.accounts.merkle_tree,
//             payer: &ctx.accounts.leaf_owner,
//             tree_creator_or_delegate: &ctx.accounts.tree_authority,
//             collection_authority: &ctx.accounts.collection_authority,
//             collection_authority_record_pda: Some(&ctx.accounts.bubblegum_program),
//             collection_mint: &ctx.accounts.collection_mint,
//             collection_metadata: &ctx.accounts.collection_metadata,
//             collection_edition: &ctx.accounts.edition_account,
//             bubblegum_signer: &ctx.accounts.bubblegum_signer,
//             log_wrapper: &ctx.accounts.log_wrapper,
//             compression_program: &ctx.accounts.compression_program,
//             token_metadata_program: &ctx.accounts.token_metadata_program,
//             system_program: &ctx.accounts.system_program,
//         };

//         let tree_authority_seeds: &[&[u8]; 2] =
//             &[b"tree_authority".as_ref(), &[ctx.bumps.tree_authority]];

//         let collection_authority_seeds: &[&[u8]; 2] = &[
//             b"collection_authority".as_ref(),
//             &[ctx.bumps.collection_authority],
//         ];
//         let signers: &[&[&[u8]]; 2] = &[&tree_authority_seeds[..], &collection_authority_seeds[..]];

//         let cpi: MintToCollectionV1Cpi<'_, '_> = MintToCollectionV1Cpi::new(
//             &cpi_program,
//             cpi_accounts,
//             MintToCollectionV1InstructionArgs {
//                 metadata: metadata_args,
//             },
//         );

//         cpi.invoke_signed(signers)?;

//         // Get the current leaf index (nonce) from the tree config
//         let tree_config: TreeConfig = TreeConfig::try_from(&ctx.accounts.tree_config)?;
//         let nonce: u64 = tree_config.num_minted;

//         // Calculate the asset ID using mpl_bubblegum's get_asset_id function
//         let asset_id: Pubkey = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

//         msg!("nonce: {}", nonce);
//         msg!("asset_id: {}", asset_id);

//         Ok(())
//     }

//     pub fn initialize_board(
//         ctx: Context<InitializeBoard>,
//         _nft_pubkey: Pubkey,
//         packed_board: [u8; 144],
//     ) -> Result<()> {
//         ctx.accounts.board.packed_board = packed_board;

//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct InitializeMerkleTree<'info> {
//     #[account(mut)]
//     pub merkle_tree: Signer<'info>,

//     /// CHECK: This is the authority that will control the tree, set to the program itself
//     #[account(
//         seeds = [b"tree_authority"],
//         bump
//     )]
//     pub tree_authority: AccountInfo<'info>,

//     pub noop_program: Program<'info, Noop>,

//     pub account_compression_program: Program<'info, SplAccountCompression>,

//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// #[instruction(nft_pubkey: Pubkey)]
// pub struct InitializeBoard<'info> {
//     #[account(
//         init,
//         payer = payer,
//         space = 144 + 8,
//         seeds=[nft_pubkey.as_ref()],
//         bump
//     )]
//     pub board: Account<'info, Board>,

//     #[account(mut)]
//     pub payer: Signer<'info>,

//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct MintNft<'info> {
//     /// CHECK:
//     #[account(mut)]
//     pub tree_config: AccountInfo<'info>,

//     #[account(mut)]
//     pub leaf_owner: Signer<'info>,

//     /// CHECK:
//     #[account(mut)]
//     pub merkle_tree: AccountInfo<'info>,

//     /// CHECK: This is the program itself, used as the tree authority
//     #[account(
//         seeds = [b"tree_authority"],
//         bump
//     )]
//     pub tree_authority: AccountInfo<'info>,

//     /// CHECK:
//     pub collection_mint: AccountInfo<'info>,

//     /// CHECK:
//     #[account(mut)]
//     pub collection_metadata: AccountInfo<'info>,

//     /// CHECK:
//     pub edition_account: AccountInfo<'info>,

//     /// CHECK:
//     pub bubblegum_signer: AccountInfo<'info>,

//     /// CHECK:
//     pub log_wrapper: AccountInfo<'info>,

//     /// CHECK:
//     pub compression_program: AccountInfo<'info>,

//     /// CHECK:
//     pub token_metadata_program: AccountInfo<'info>,

//     /// CHECK:
//     pub bubblegum_program: AccountInfo<'info>,

//     /// CHECK: This is the program itself, used as the collection authority
//     #[account(
//         seeds = [b"collection_authority"],
//         bump
//     )]
//     pub collection_authority: AccountInfo<'info>,

//     pub system_program: Program<'info, System>,

//     /// CHECK: This account is initialized in the instruction
//     #[account(mut)]
//     pub board: AccountInfo<'info>,
// }

// #[account]
// pub struct Board {
//     packed_board: [u8; 144],
// }
