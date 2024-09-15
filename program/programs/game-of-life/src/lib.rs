use anchor_lang::prelude::*;

use shared::PDA_SEED_GRID;

pub mod shared;

declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

#[program]
pub mod game_of_life {

    use super::*;

    pub fn initialize_board(ctx: Context<InitializeBoard>, packed_grid: [u32; 32]) -> Result<()> {
        ctx.accounts.grid.packed_grid = packed_grid;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeBoard<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = 128 + 8,
        seeds=[PDA_SEED_GRID.as_ref()],
        bump
    )]
    pub grid: Account<'info, Grid>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Grid {
    packed_grid: [u32; 32],
}
