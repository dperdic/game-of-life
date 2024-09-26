use anchor_lang::prelude::*;

declare_id!("7Zo1z7hDgyHqoA7ehaFXJhYAzJdciCoPqox86P7gVtzU");

#[program]
pub mod game_of_life {

    use super::*;

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

#[account]
pub struct Board {
    packed_board: [u8; 144],
}
