use anchor_lang::prelude::*;

declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

#[program]
pub mod game_of_life {

    use super::*;

    pub fn initialize_board(
        ctx: Context<InitializeBoard>,
        _nft_pubkey: Pubkey,
        packed_board: [u32; 32],
    ) -> Result<()> {
        ctx.accounts.board.packed_board = packed_board;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nft_pubkey: Pubkey)]
pub struct InitializeBoard<'info> {
    #[account(
        init,
        payer = signer,
        space = 128 + 8,
        seeds=[nft_pubkey.as_ref()],
        bump
    )]
    pub board: Account<'info, Board>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Board {
    packed_board: [u32; 32],
}
