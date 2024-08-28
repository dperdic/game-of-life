use anchor_lang::prelude::*;

declare_id!("BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN");

#[program]
pub mod game_of_life {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
