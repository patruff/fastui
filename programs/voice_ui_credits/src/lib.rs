use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("VoiceU1Bu1LderCredits11111111111111111111111");

/// Price per credit pack (10 UI changes) in USDC lamports (6 decimals).
/// 1 USDC = 1_000_000 lamports. Default: 2 USDC per pack.
const CREDITS_PER_PACK: u64 = 10;
const PRICE_PER_PACK: u64 = 2_000_000; // 2 USDC

/// USDC mint on Solana mainnet
/// Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
/// Devnet:  4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

#[program]
pub mod voice_ui_credits {
    use super::*;

    /// Initialize the service vault (called once by the service owner).
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.service_state;
        state.authority = ctx.accounts.authority.key();
        state.vault = ctx.accounts.vault.key();
        state.price_per_pack = PRICE_PER_PACK;
        state.credits_per_pack = CREDITS_PER_PACK;
        state.total_packs_sold = 0;
        msg!("Service initialized. Authority: {}", state.authority);
        Ok(())
    }

    /// Create a user account with 10 free credits.
    pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.user.key();
        user_account.credits_remaining = 10; // 10 free credits
        user_account.total_purchased = 0;
        user_account.total_used = 0;
        msg!(
            "User account created for {} with 10 free credits",
            user_account.owner
        );
        Ok(())
    }

    /// Purchase a credit pack by transferring USDC to the service vault.
    pub fn purchase_credits(ctx: Context<PurchaseCredits>) -> Result<()> {
        let state = &ctx.accounts.service_state;

        // Transfer USDC from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, state.price_per_pack)?;

        // Add credits
        let user_account = &mut ctx.accounts.user_account;
        user_account.credits_remaining = user_account
            .credits_remaining
            .checked_add(state.credits_per_pack)
            .unwrap();
        user_account.total_purchased = user_account
            .total_purchased
            .checked_add(state.credits_per_pack)
            .unwrap();

        // Track total sales
        let state = &mut ctx.accounts.service_state;
        state.total_packs_sold = state.total_packs_sold.checked_add(1).unwrap();

        msg!(
            "User {} purchased {} credits. Remaining: {}",
            user_account.owner,
            CREDITS_PER_PACK,
            user_account.credits_remaining
        );
        Ok(())
    }

    /// Use one credit (called by the backend after a UI generation).
    /// Only the service authority can call this to prevent unauthorized usage.
    pub fn use_credit(ctx: Context<UseCredit>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        require!(user_account.credits_remaining > 0, ErrorCode::NoCredits);

        user_account.credits_remaining = user_account
            .credits_remaining
            .checked_sub(1)
            .unwrap();
        user_account.total_used = user_account
            .total_used
            .checked_add(1)
            .unwrap();

        msg!(
            "Credit used for {}. Remaining: {}",
            user_account.owner,
            user_account.credits_remaining
        );
        Ok(())
    }

    /// Check user credits (read-only, returns data via logs).
    pub fn get_credits(ctx: Context<GetCredits>) -> Result<()> {
        let user_account = &ctx.accounts.user_account;
        msg!(
            "User {} has {} credits remaining ({} purchased, {} used)",
            user_account.owner,
            user_account.credits_remaining,
            user_account.total_purchased,
            user_account.total_used
        );
        Ok(())
    }
}

// === Account Structures ===

#[account]
pub struct ServiceState {
    pub authority: Pubkey,      // 32
    pub vault: Pubkey,          // 32
    pub price_per_pack: u64,    // 8
    pub credits_per_pack: u64,  // 8
    pub total_packs_sold: u64,  // 8
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,          // 32
    pub credits_remaining: u64, // 8
    pub total_purchased: u64,   // 8
    pub total_used: u64,        // 8
}

// === Instruction Contexts ===

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8,
        seeds = [b"service-state"],
        bump
    )]
    pub service_state: Account<'info, ServiceState>,

    /// The USDC token account owned by the service (vault).
    #[account(
        constraint = vault.mint.to_string() == USDC_MINT
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8,
        seeds = [b"user-account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseCredits<'info> {
    #[account(
        mut,
        seeds = [b"service-state"],
        bump
    )]
    pub service_state: Account<'info, ServiceState>,

    #[account(
        mut,
        seeds = [b"user-account", user.key().as_ref()],
        bump,
        constraint = user_account.owner == user.key()
    )]
    pub user_account: Account<'info, UserAccount>,

    /// User's USDC token account.
    #[account(
        mut,
        constraint = user_token_account.mint.to_string() == USDC_MINT,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Service vault USDC token account.
    #[account(
        mut,
        constraint = vault.key() == service_state.vault
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UseCredit<'info> {
    #[account(
        seeds = [b"service-state"],
        bump,
        constraint = service_state.authority == authority.key()
    )]
    pub service_state: Account<'info, ServiceState>,

    #[account(
        mut,
        seeds = [b"user-account", user_account.owner.as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    /// Only the service authority can deduct credits.
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCredits<'info> {
    #[account(
        seeds = [b"user-account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub user: Signer<'info>,
}

// === Errors ===

#[error_code]
pub enum ErrorCode {
    #[msg("No credits remaining. Purchase more credits to continue.")]
    NoCredits,
}
