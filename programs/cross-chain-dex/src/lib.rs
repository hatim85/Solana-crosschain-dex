use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use whirlpool_cpi::cpi::accounts::Swap as WhirlpoolSwap;
use whirlpool_cpi::state::Whirlpool;

// declare_id!("8PQoXSe6fJoai2GzkndYT6eGvPBbYCGsGjndx91oXGWq");
declare_id!("GhksWFc9wWmdcrVwViGpCMzkmMAJJFJyktkLPtZev8AF");

#[cfg_attr(not(feature = "idl-build"), allow(unexpected_cfgs))]
#[program]
pub mod cross_chain_dex {
    use super::*;

    /// Wraps native SOL to WSOL by creating an associated token account and transferring SOL.
    pub fn wrap_sol(ctx: Context<WrapSol>, amount: u64) -> Result<()> {
        // Create the associated token account for WSOL if it doesn't exist
        anchor_spl::associated_token::create(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            anchor_spl::associated_token::Create {
                payer: ctx.accounts.user.to_account_info(),
                associated_token: ctx.accounts.wsol_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.wsol_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        ))?;

        // Transfer SOL to the WSOL account (wraps to WSOL)
        let cpi_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.wsol_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    /// Swaps tokens using Orca Whirlpools via CPI, supporting different token pairs.
    pub fn swap_tokens(ctx: Context<SwapTokens>, params: SwapParams) -> Result<()> {
        let cpi_program = ctx.accounts.whirlpool_program.to_account_info();
        let cpi_accounts = WhirlpoolSwap {
            whirlpool: ctx.accounts.whirlpool.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            token_authority: ctx.accounts.token_authority.to_account_info(),
            token_owner_account_a: ctx.accounts.token_owner_account_a.to_account_info(),
            token_owner_account_b: ctx.accounts.token_owner_account_b.to_account_info(),
            token_vault_a: ctx.accounts.token_vault_a.to_account_info(),
            token_vault_b: ctx.accounts.token_vault_b.to_account_info(),
            tick_array_0: ctx.accounts.tick_array_0.to_account_info(),
            tick_array_1: ctx.accounts.tick_array_1.to_account_info(),
            tick_array_2: ctx.accounts.tick_array_2.to_account_info(),
            oracle: ctx.accounts.oracle.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        whirlpool_cpi::cpi::swap(
            cpi_ctx,
            params.amount,
            params.other_amount_threshold,
            params.sqrt_price_limit,
            params.amount_specified_is_input,
            params.a_to_b,
        )?;
        Ok(())
    }
}

/// Accounts for wrapping SOL to WSOL.
#[derive(Accounts)]
pub struct WrapSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = wsol_mint,
        associated_token::authority = user,
    )]
    pub wsol_account: Box<Account<'info, TokenAccount>>,
    #[account(address = anchor_spl::token::spl_token::native_mint::ID)]
    pub wsol_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Parameters for the swap instruction, aligned with Orca Whirlpools.
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SwapParams {
    pub amount: u64,
    pub other_amount_threshold: u64,
    pub sqrt_price_limit: u128,
    pub amount_specified_is_input: bool,
    pub a_to_b: bool,
}

/// Accounts for swapping tokens using Orca Whirlpools.
#[derive(Accounts)]
pub struct SwapTokens<'info> {
    /// CHECK: The whirlpool program is verified by the address constraint to match whirlpool_cpi::ID
    #[account(address = whirlpool_cpi::ID)]
    pub whirlpool_program: AccountInfo<'info>,
    pub whirlpool: Account<'info, Whirlpool>,
    pub token_authority: Signer<'info>,
    #[account(mut)]
    pub token_owner_account_a: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub token_owner_account_b: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub token_vault_a: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub token_vault_b: Box<Account<'info, TokenAccount>>,
    /// CHECK: The tick_array_0 is validated by the Whirlpool program during swap execution
    #[account(mut)]
    pub tick_array_0: UncheckedAccount<'info>,
    /// CHECK: The tick_array_1 is validated by the Whirlpool program during swap execution
    #[account(mut)]
    pub tick_array_1: UncheckedAccount<'info>,
    /// CHECK: The tick_array_2 is validated by the Whirlpool program during swap execution
    #[account(mut)]
    pub tick_array_2: UncheckedAccount<'info>,
    /// CHECK: The oracle is validated by the Whirlpool program for price data
    pub oracle: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}