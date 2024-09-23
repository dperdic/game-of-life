use anchor_lang::prelude::*;

use mpl_bubblegum::{
    accounts::TreeConfig,
    instructions::{
        MintToCollectionV1Cpi, MintToCollectionV1CpiAccounts, MintToCollectionV1InstructionArgs,
    },
    types::MetadataArgs,
    types::{Collection, Creator, TokenProgramVersion, TokenStandard},
    utils::get_asset_id,
};
use spl_account_compression::{
    cpi::{accounts::Initialize, init_empty_merkle_tree},
    program::SplAccountCompression,
    Noop,
};

declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

#[program]
pub mod game_of_life {

    use super::*;

    pub fn initialize_merkle_tree(
        ctx: Context<InitializeMerkleTree>,
        max_depth: u32,
        max_buffer_size: u32,
    ) -> Result<()> {
        let cpi_program: AccountInfo<'_> =
            ctx.accounts.account_compression_program.to_account_info();

        let cpi_accounts: Initialize<'_> = Initialize {
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            authority: ctx.accounts.tree_authority.to_account_info(),
            noop: ctx.accounts.noop_program.to_account_info(),
        };

        let merkle_tree: Pubkey = ctx.accounts.merkle_tree.key();

        let signer_seeds: &[&[&[u8]]] = &[&[merkle_tree.as_ref(), &[ctx.bumps.tree_authority]]];

        let cpi_ctx: CpiContext<'_, '_, '_, '_, Initialize<'_>> =
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        init_empty_merkle_tree(cpi_ctx, max_depth, max_buffer_size)?;

        msg!("Merkle tree initialized successfully!");

        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNft>,
        _packed_board: [u8; 144],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let metadata_args: MetadataArgs = MetadataArgs {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 10000,
            is_mutable: false,
            primary_sale_happened: false,
            edition_nonce: None,
            token_standard: Some(TokenStandard::NonFungible),
            token_program_version: TokenProgramVersion::Original,
            uses: None,
            collection: Some(Collection {
                key: ctx.accounts.collection_mint.key(),
                verified: false,
            }),
            creators: vec![Creator {
                address: *ctx.program_id,
                verified: false,
                share: 100,
            }],
        };

        // Create the CPI context for minting the compressed NFT
        let cpi_program: AccountInfo<'_> = ctx.accounts.bubblegum_program.to_account_info();

        let cpi_accounts: MintToCollectionV1CpiAccounts<'_, '_> = MintToCollectionV1CpiAccounts {
            tree_config: &ctx.accounts.tree_config,
            leaf_owner: &ctx.accounts.leaf_owner,
            leaf_delegate: &ctx.accounts.leaf_owner,
            merkle_tree: &ctx.accounts.merkle_tree,
            payer: &ctx.accounts.leaf_owner,
            tree_creator_or_delegate: &ctx.accounts.tree_authority,
            collection_authority: &ctx.accounts.collection_authority,
            collection_authority_record_pda: Some(&ctx.accounts.bubblegum_program),
            collection_mint: &ctx.accounts.collection_mint,
            collection_metadata: &ctx.accounts.collection_metadata,
            collection_edition: &ctx.accounts.edition_account,
            bubblegum_signer: &ctx.accounts.bubblegum_signer,
            log_wrapper: &ctx.accounts.log_wrapper,
            compression_program: &ctx.accounts.compression_program,
            token_metadata_program: &ctx.accounts.token_metadata_program,
            system_program: &ctx.accounts.system_program,
        };

        let tree_authority_seeds: &[&[u8]; 2] =
            &[b"tree_authority".as_ref(), &[ctx.bumps.tree_authority]];

        let collection_authority_seeds: &[&[u8]; 2] = &[
            b"collection_authority".as_ref(),
            &[ctx.bumps.collection_authority],
        ];
        let signers: &[&[&[u8]]; 2] = &[&tree_authority_seeds[..], &collection_authority_seeds[..]];

        let cpi: MintToCollectionV1Cpi<'_, '_> = MintToCollectionV1Cpi::new(
            &cpi_program,
            cpi_accounts,
            MintToCollectionV1InstructionArgs {
                metadata: metadata_args,
            },
        );

        cpi.invoke_signed(signers)?;

        // Get the current leaf index (nonce) from the tree config
        let tree_config: TreeConfig = TreeConfig::try_from(&ctx.accounts.tree_config)?;
        let nonce: u64 = tree_config.num_minted;

        // Calculate the asset ID using mpl_bubblegum's get_asset_id function
        let asset_id: Pubkey = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

        msg!("nonce: {}", nonce);
        msg!("asset_id: {}", asset_id);

        Ok(())
    }

    pub fn initialize_board(
        ctx: Context<InitializeBoard>,
        _nft_pubkey: Pubkey,
        packed_board: [u8; 144],
    ) -> Result<()> {
        ctx.accounts.board.packed_board = packed_board;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMerkleTree<'info> {
    #[account(mut)]
    pub merkle_tree: Signer<'info>,

    /// CHECK: This is the authority that will control the tree, set to the program itself
    #[account(
        seeds = [b"tree_authority"],
        bump
    )]
    pub tree_authority: AccountInfo<'info>,

    pub noop_program: Program<'info, Noop>,

    pub account_compression_program: Program<'info, SplAccountCompression>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nft_pubkey: Pubkey)]
pub struct InitializeBoard<'info> {
    #[account(
        init,
        payer = payer,
        space = 144 + 8,
        seeds=[nft_pubkey.as_ref()],
        bump
    )]
    pub board: Account<'info, Board>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    /// CHECK:
    #[account(mut)]
    pub tree_config: AccountInfo<'info>,

    #[account(mut)]
    pub leaf_owner: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// CHECK: This is the program itself, used as the tree authority
    #[account(
        seeds = [b"tree_authority"],
        bump
    )]
    pub tree_authority: AccountInfo<'info>,

    /// CHECK:
    pub collection_mint: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub collection_metadata: AccountInfo<'info>,

    /// CHECK:
    pub edition_account: AccountInfo<'info>,

    /// CHECK:
    pub bubblegum_signer: AccountInfo<'info>,

    /// CHECK:
    pub log_wrapper: AccountInfo<'info>,

    /// CHECK:
    pub compression_program: AccountInfo<'info>,

    /// CHECK:
    pub token_metadata_program: AccountInfo<'info>,

    /// CHECK:
    pub bubblegum_program: AccountInfo<'info>,

    /// CHECK: This is the program itself, used as the collection authority
    #[account(
        seeds = [b"collection_authority"],
        bump
    )]
    pub collection_authority: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: This account is initialized in the instruction
    #[account(mut)]
    pub board: AccountInfo<'info>,
}

#[account]
pub struct Board {
    packed_board: [u8; 144],
}
