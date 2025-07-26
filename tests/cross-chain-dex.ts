// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { CrossChainDex } from "../target/types/cross_chain_dex";

// describe("cross-chain-dex", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.crossChainDex as Program<CrossChainDex>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });



// import * as anchor from "@coral-xyz/anchor";
// import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
// import { PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
// import { expect } from "chai";

// // Configure the client to use the Devnet cluster
// const provider = AnchorProvider.env();
// anchor.setProvider(provider);
// const program = anchor.workspace.CrossChainDex as Program;
// const connection = provider.connection;
// const wallet = provider.wallet as anchor.Wallet;

// // Token mints (Devnet)
// const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
// const USDC_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
// const SRM_MINT = new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt");

// // Placeholder Whirlpool addresses (replace with actual Devnet pool addresses)
// const WHIRLPOOL_SOL_USDC = new PublicKey("WHIRLPOOL_ADDRESS_SOL_USDC"); // Replace
// const WHIRLPOOL_SOL_SRM = new PublicKey("WHIRLPOOL_ADDRESS_SOL_SRM"); // Replace
// const WHIRLPOOL_PROGRAM_ID = new PublicKey("whirLbMiS22Q9y3y2E4w8rSJ3T4YY2J9yJ5oW9aA9");

// describe("Cross Chain DEX", () => {
//   let user: Keypair;
//   let wsolAccount: PublicKey;
//   let usdcAccount: PublicKey;
//   let srmAccount: PublicKey;

//   beforeEach(async () => {
//     // Create a new user keypair for each test
//     user = Keypair.generate();
    
//     // Airdrop SOL to user for testing
//     await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
//     // Create associated token accounts
//     wsolAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, WSOL_MINT);
//     usdcAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, USDC_MINT);
//     srmAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, SRM_MINT);
//   });

//   async function getOrCreateAssociatedTokenAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
//     const ata = await getAssociatedTokenAddress(mint, owner);
//     const accountInfo = await connection.getAccountInfo(ata);
//     if (!accountInfo) {
//       const tx = new Transaction().add(
//         anchor.utils.token.createAssociatedTokenAccountInstruction(
//           owner,
//           ata,
//           owner,
//           mint
//         )
//       );
//       await provider.sendAndConfirm(tx, [user]);
//     }
//     return ata;
//   }

//   describe("wrap_sol", () => {
//     it("should wrap SOL to WSOL successfully", async () => {
//       const amount = 0.1 * anchor.web3.LAMPORTS_PER_SOL; // 0.1 SOL
//       const initialBalance = await connection.getBalance(user.publicKey);
//       const initialWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;

//       await program.methods
//         .wrapSol(amount)
//         .accounts({
//           user: user.publicKey,
//           wsolAccount,
//           wsolMint: WSOL_MINT,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         })
//         .signers([user])
//         .rpc();

//       const finalBalance = await connection.getBalance(user.publicKey);
//       const finalWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;

//       expect(finalBalance).to.be.lessThan(initialBalance - amount, "SOL balance should decrease");
//       expect(finalWsolBalance).to.equal((initialWsolBalance || 0) + 0.1, "WSOL balance should increase by 0.1");
//     });

//     it("should fail to wrap SOL with insufficient balance", async () => {
//       const amount = 10 * anchor.web3.LAMPORTS_PER_SOL; // More than airdropped SOL
//       try {
//         await program.methods
//           .wrapSol(amount)
//           .accounts({
//             user: user.publicKey,
//             wsolAccount,
//             wsolMint: WSOL_MINT,
//             tokenProgram: TOKEN_PROGRAM_ID,
//             associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//             systemProgram: SystemProgram.programId,
//             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//           })
//           .signers([user])
//           .rpc();
//         expect.fail("Should have thrown an error due to insufficient balance");
//       } catch (err) {
//         expect(err.message).to.include("insufficient funds");
//       }
//     });

//     it("should wrap SOL to existing WSOL account", async () => {
//       const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;
//       await program.methods
//         .wrapSol(amount)
//         .accounts({
//           user: user.publicKey,
//           wsolAccount,
//           wsolMint: WSOL_MINT,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         })
//         .signers([user])
//         .rpc();

//       const wsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;
//       expect(wsolBalance).to.equal(0.05, "WSOL balance should be 0.05 after first wrap");

//       // Wrap again to same account
//       await program.methods
//         .wrapSol(amount)
//         .accounts({
//           user: user.publicKey,
//           wsolAccount,
//           wsolMint: WSOL_MINT,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         })
//         .signers([user])
//         .rpc();

//       const finalWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;
//       expect(finalWsolBalance).to.equal(0.1, "WSOL balance should be 0.1 after second wrap");
//     });
//   });

//   describe("swap_tokens", () => {
//     beforeEach(async () => {
//       // Wrap some SOL to WSOL for swapping
//       await program.methods
//         .wrapSol(0.1 * anchor.web3.LAMPORTS_PER_SOL)
//         .accounts({
//           user: user.publicKey,
//           wsolAccount,
//           wsolMint: WSOL_MINT,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         })
//         .signers([user])
//         .rpc();

//       // Mint some USDC and SRM to user for testing (simulate faucet)
//       // In practice, use Devnet faucet or `spl-token mint`
//     });

//     async function getWhirlpoolAccounts(whirlpoolAddress: PublicKey) {
//       const whirlpool = await program.account.whirlpool.fetch(whirlpoolAddress);
//       const TICK_ARRAY_SIZE = 64;
//       const currentStartTickIndex = Math.floor(whirlpool.tickCurrentIndex / TICK_ARRAY_SIZE);
//       const tickArray0 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex - 1);
//       const tickArray1 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex);
//       const tickArray2 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex + 1);
//       return { whirlpool, tickArray0, tickArray1, tickArray2, oracle: whirlpool.oracle };
//     }

//     async function getTickArrayAddress(whirlpool: PublicKey, startTickIndex: number): Promise<PublicKey> {
//       return web3.PublicKey.findProgramAddressSync(
//         [
//           Buffer.from("tick_array"),
//           whirlpool.toBuffer(),
//           Buffer.alloc(4).writeInt32LE(startTickIndex),
//         ],
//         WHIRLPOOL_PROGRAM_ID
//       )[0];
//     }

//     it("should swap SOL to USDC successfully", async () => {
//       const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
//       const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL; // 0.05 SOL
//       const initialUsdcBalance = (await connection.getTokenAccountBalance(usdcAccount)).value.uiAmount || 0;

//       await program.methods
//         .swapTokens({
//           amount,
//           otherAmountThreshold: 0, // Allow any output for testing
//           sqrtPriceLimit: 0,
//           amountSpecifiedIsInput: true,
//           aToB: true,
//         })
//         .accounts({
//           whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
//           whirlpool: WHIRLPOOL_SOL_USDC,
//           tokenAuthority: user.publicKey,
//           tokenOwnerAccountA: wsolAccount,
//           tokenOwnerAccountB: usdcAccount,
//           tokenVaultA: whirlpool.tokenVaultA,
//           tokenVaultB: whirlpool.tokenVaultB,
//           tickArray0,
//           tickArray1,
//           tickArray2,
//           oracle,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .signers([user])
//         .rpc();

//       const finalUsdcBalance = (await connection.getTokenAccountBalance(usdcAccount)).value.uiAmount;
//       expect(finalUsdcBalance).to.be.greaterThan(initialUsdcBalance, "USDC balance should increase");
//     });

//     it("should swap SOL to SRM successfully", async () => {
//       const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_SRM);
//       const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;
//       const initialSrmBalance = (await connection.getTokenAccountBalance(srmAccount)).value.uiAmount || 0;

//       await program.methods
//         .swapTokens({
//           amount,
//           otherAmountThreshold: 0,
//           sqrtPriceLimit: 0,
//           amountSpecifiedIsInput: true,
//           aToB: true,
//         })
//         .accounts({
//           whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
//           whirlpool: WHIRLPOOL_SOL_SRM,
//           tokenAuthority: user.publicKey,
//           tokenOwnerAccountA: wsolAccount,
//           tokenOwnerAccountB: srmAccount,
//           tokenVaultA: whirlpool.tokenVaultA,
//           tokenVaultB: whirlpool.tokenVaultB,
//           tickArray0,
//           tickArray1,
//           tickArray2,
//           oracle,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .signers([user])
//         .rpc();

//       const finalSrmBalance = (await connection.getTokenAccountBalance(srmAccount)).value.uiAmount;
//       expect(finalSrmBalance).to.be.greaterThan(initialSrmBalance, "SRM balance should increase");
//     });

//     it("should fail to swap with invalid Whirlpool address", async () => {
//       const invalidWhirlpool = Keypair.generate().publicKey;
//       try {
//         await program.methods
//           .swapTokens({
//             amount: 0.05 * anchor.web3.LAMPORTS_PER_SOL,
//             otherAmountThreshold: 0,
//             sqrtPriceLimit: 0,
//             amountSpecifiedIsInput: true,
//             aToB: true,
//           })
//           .accounts({
//             whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
//             whirlpool: invalidWhirlpool,
//             tokenAuthority: user.publicKey,
//             tokenOwnerAccountA: wsolAccount,
//             tokenOwnerAccountB: usdcAccount,
//             tokenVaultA: wsolAccount, // Invalid
//             tokenVaultB: usdcAccount, // Invalid
//             tickArray0: Keypair.generate().publicKey,
//             tickArray1: Keypair.generate().publicKey,
//             tickArray2: Keypair.generate().publicKey,
//             oracle: Keypair.generate().publicKey,
//             tokenProgram: TOKEN_PROGRAM_ID,
//           })
//           .signers([user])
//           .rpc();
//         expect.fail("Should have thrown an error due to invalid Whirlpool address");
//       } catch (err) {
//         expect(err.message).to.include("invalid account data");
//       }
//     });

//     it("should fail to swap with insufficient input tokens", async () => {
//       const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
//       const amount = 10 * anchor.web3.LAMPORTS_PER_SOL; // More than available WSOL

//       try {
//         await program.methods
//           .swapTokens({
//             amount,
//             otherAmountThreshold: 0,
//             sqrtPriceLimit: 0,
//             amountSpecifiedIsInput: true,
//             aToB: true,
//           })
//           .accounts({
//             whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
//             whirlpool: WHIRLPOOL_SOL_USDC,
//             tokenAuthority: user.publicKey,
//             tokenOwnerAccountA: wsolAccount,
//             tokenOwnerAccountB: usdcAccount,
//             tokenVaultA: whirlpool.tokenVaultA,
//             tokenVaultB: whirlpool.tokenVaultB,
//             tickArray0,
//             tickArray1,
//             tickArray2,
//             oracle,
//             tokenProgram: TOKEN_PROGRAM_ID,
//           })
//           .signers([user])
//           .rpc();
//         expect.fail("Should have thrown an error due to insufficient tokens");
//       } catch (err) {
//         expect(err.message).to.include("insufficient funds");
//       }
//     });

//     it("should fail with invalid tick arrays", async () => {
//       const { whirlpool, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
//       try {
//         await program.methods
//           .swapTokens({
//             amount: 0.05 * anchor.web3.LAMPORTS_PER_SOL,
//             otherAmountThreshold: 0,
//             sqrtPriceLimit: 0,
//             amountSpecifiedIsInput: true,
//             aToB: true,
//           })
//           .accounts({
//             whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
//             whirlpool: WHIRLPOOL_SOL_USDC,
//             tokenAuthority: user.publicKey,
//             tokenOwnerAccountA: wsolAccount,
//             tokenOwnerAccountB: usdcAccount,
//             tokenVaultA: whirlpool.tokenVaultA,
//             tokenVaultB: whirlpool.tokenVaultB,
//             tickArray0: Keypair.generate().publicKey, // Invalid
//             tickArray1: Keypair.generate().publicKey, // Invalid
//             tickArray2: Keypair.generate().publicKey, // Invalid
//             oracle,
//             tokenProgram: TOKEN_PROGRAM_ID,
//           })
//           .signers([user])
//           .rpc();
//         expect.fail("Should have thrown an error due to invalid tick arrays");
//       } catch (err) {
//         expect(err.message).to.include("invalid account data");
//       }
//     });
//   });
// });



import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { expect } from "chai";

// Configure the client to use Devnet
const provider = AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.CrossChainDex as Program;
const connection = provider.connection;
const wallet = provider.wallet as anchor.Wallet;

// Token mints (Devnet)
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const USDC_MINT = new PublicKey("BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k");
const SRM_MINT = new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt");

// Whirlpool addresses (replace with actual)
const WHIRLPOOL_SOL_USDC = new PublicKey("3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt");
const WHIRLPOOL_SOL_SRM = new PublicKey("YOUR_SOL_SRM_POOL_ADDRESS"); // Replace
const WHIRLPOOL_PROGRAM_ID = new PublicKey("whirLbMiS22Q9y3y2E4w8rSJ3T4YY2J9yJ5oW9aA9");

describe("Cross Chain DEX", () => {
  let user: Keypair;
  let wsolAccount: PublicKey;
  let usdcAccount: PublicKey;
  let srmAccount: PublicKey;

  beforeEach(async () => {
    user = Keypair.generate();
    await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    wsolAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, WSOL_MINT);
    usdcAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, USDC_MINT);
    srmAccount = await getOrCreateAssociatedTokenAccount(user.publicKey, SRM_MINT);
  });

  async function getOrCreateAssociatedTokenAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
      const tx = new Transaction().add(
        anchor.utils.token.createAssociatedTokenAccountInstruction(
          owner,
          ata,
          owner,
          mint
        )
      );
      await provider.sendAndConfirm(tx, [user]);
    }
    return ata;
  }

  async function getWhirlpoolAccounts(whirlpoolAddress: PublicKey) {
    const whirlpool = await program.account.whirlpool.fetch(whirlpoolAddress);
    const TICK_ARRAY_SIZE = 64;
    const currentStartTickIndex = Math.floor(whirlpool.tickCurrentIndex / TICK_ARRAY_SIZE);
    const tickArray0 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex - 1);
    const tickArray1 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex);
    const tickArray2 = await getTickArrayAddress(whirlpoolAddress, currentStartTickIndex + 1);
    return { whirlpool, tickArray0, tickArray1, tickArray2, oracle: whirlpool.oracle };
  }

  async function getTickArrayAddress(whirlpool: PublicKey, startTickIndex: number): Promise<PublicKey> {
    return web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tick_array"),
        whirlpool.toBuffer(),
        Buffer.alloc(4).writeInt32LE(startTickIndex),
      ],
      WHIRLPOOL_PROGRAM_ID
    )[0];
  }

  describe("wrap_sol", () => {
    it("should wrap SOL to WSOL successfully", async () => {
      const amount = 0.1 * anchor.web3.LAMPORTS_PER_SOL;
      const initialBalance = await connection.getBalance(user.publicKey);
      const initialWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;

      await program.methods
        .wrapSol(amount)
        .accounts({
          user: user.publicKey,
          wsolAccount,
          wsolMint: WSOL_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user])
        .rpc();

      const finalBalance = await connection.getBalance(user.publicKey);
      const finalWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;

      expect(finalBalance).to.be.lessThan(initialBalance - amount, "SOL balance should decrease");
      expect(finalWsolBalance).to.equal((initialWsolBalance || 0) + 0.1, "WSOL balance should increase by 0.1");
    });

    it("should fail to wrap SOL with insufficient balance", async () => {
      const amount = 10 * anchor.web3.LAMPORTS_PER_SOL;
      try {
        await program.methods
          .wrapSol(amount)
          .accounts({
            user: user.publicKey,
            wsolAccount,
            wsolMint: WSOL_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error due to insufficient balance");
      } catch (err) {
        expect(err.message).to.include("insufficient funds");
      }
    });

    it("should wrap SOL to existing WSOL account", async () => {
      const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;
      await program.methods
        .wrapSol(amount)
        .accounts({
          user: user.publicKey,
          wsolAccount,
          wsolMint: WSOL_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user])
        .rpc();

      const wsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;
      expect(wsolBalance).to.equal(0.05, "WSOL balance should be 0.05 after first wrap");

      await program.methods
        .wrapSol(amount)
        .accounts({
          user: user.publicKey,
          wsolAccount,
          wsolMint: WSOL_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user])
        .rpc();

      const finalWsolBalance = (await connection.getTokenAccountBalance(wsolAccount)).value.uiAmount;
      expect(finalWsolBalance).to.equal(0.1, "WSOL balance should be 0.1 after second wrap");
    });
  });

  describe("swap_tokens", () => {
    beforeEach(async () => {
      // Wrap SOL to WSOL for swapping
      await program.methods
        .wrapSol(0.1 * anchor.web3.LAMPORTS_PER_SOL)
        .accounts({
          user: user.publicKey,
          wsolAccount,
          wsolMint: WSOL_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user])
        .rpc();

      // Mint USDC/SRM to user (simulate faucet)
      // In practice, use: `spl-token mint <MINT_ADDRESS> 1000 <YOUR_ATA>`
    });

    it("should swap SOL to USDC successfully", async () => {
      const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
      const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;
      const initialUsdcBalance = (await connection.getTokenAccountBalance(usdcAccount)).value.uiAmount || 0;

      await program.methods
        .swapTokens({
          amount,
          otherAmountThreshold: 0,
          sqrtPriceLimit: 0,
          amountSpecifiedIsInput: true,
          aToB: true,
        })
        .accounts({
          whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
          whirlpool: WHIRLPOOL_SOL_USDC,
          tokenAuthority: user.publicKey,
          tokenOwnerAccountA: wsolAccount,
          tokenOwnerAccountB: usdcAccount,
          tokenVaultA: whirlpool.tokenVaultA,
          tokenVaultB: whirlpool.tokenVaultB,
          tickArray0,
          tickArray1,
          tickArray2,
          oracle,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      const finalUsdcBalance = (await connection.getTokenAccountBalance(usdcAccount)).value.uiAmount;
      expect(finalUsdcBalance).to.be.greaterThan(initialUsdcBalance, "USDC balance should increase");
    });

    it("should swap SOL to SRM successfully", async () => {
      const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_SRM);
      const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;
      const initialSrmBalance = (await connection.getTokenAccountBalance(srmAccount)).value.uiAmount || 0;

      await program.methods
        .swapTokens({
          amount,
          otherAmountThreshold: 0,
          sqrtPriceLimit: 0,
          amountSpecifiedIsInput: true,
          aToB: true,
        })
        .accounts({
          whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
          whirlpool: WHIRLPOOL_SOL_SRM,
          tokenAuthority: user.publicKey,
          tokenOwnerAccountA: wsolAccount,
          tokenOwnerAccountB: srmAccount,
          tokenVaultA: whirlpool.tokenVaultA,
          tokenVaultB: whirlpool.tokenVaultB,
          tickArray0,
          tickArray1,
          tickArray2,
          oracle,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      const finalSrmBalance = (await connection.getTokenAccountBalance(srmAccount)).value.uiAmount;
      expect(finalSrmBalance).to.be.greaterThan(initialSrmBalance, "SRM balance should increase");
    });

    it("should fail to swap with invalid Whirlpool address", async () => {
      const invalidWhirlpool = Keypair.generate().publicKey;
      try {
        await program.methods
          .swapTokens({
            amount: 0.05 * anchor.web3.LAMPORTS_PER_SOL,
            otherAmountThreshold: 0,
            sqrtPriceLimit: 0,
            amountSpecifiedIsInput: true,
            aToB: true,
          })
          .accounts({
            whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
            whirlpool: invalidWhirlpool,
            tokenAuthority: user.publicKey,
            tokenOwnerAccountA: wsolAccount,
            tokenOwnerAccountB: usdcAccount,
            tokenVaultA: wsolAccount,
            tokenVaultB: usdcAccount,
            tickArray0: Keypair.generate().publicKey,
            tickArray1: Keypair.generate().publicKey,
            tickArray2: Keypair.generate().publicKey,
            oracle: Keypair.generate().publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error due to invalid Whirlpool address");
      } catch (err) {
        expect(err.message).to.include("invalid account data");
      }
    });

    it("should fail to swap with insufficient input tokens", async () => {
      const { whirlpool, tickArray0, tickArray1, tickArray2, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
      const amount = 10 * anchor.web3.LAMPORTS_PER_SOL;

      try {
        await program.methods
          .swapTokens({
            amount,
            otherAmountThreshold: 0,
            sqrtPriceLimit: 0,
            amountSpecifiedIsInput: true,
            aToB: true,
          })
          .accounts({
            whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
            whirlpool: WHIRLPOOL_SOL_USDC,
            tokenAuthority: user.publicKey,
            tokenOwnerAccountA: wsolAccount,
            tokenOwnerAccountB: usdcAccount,
            tokenVaultA: whirlpool.tokenVaultA,
            tokenVaultB: whirlpool.tokenVaultB,
            tickArray0,
            tickArray1,
            tickArray2,
            oracle,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error due to insufficient tokens");
      } catch (err) {
        expect(err.message).to.include("insufficient funds");
      }
    });

    it("should fail with invalid tick arrays", async () => {
      const { whirlpool, oracle } = await getWhirlpoolAccounts(WHIRLPOOL_SOL_USDC);
      try {
        await program.methods
          .swapTokens({
            amount: 0.05 * anchor.web3.LAMPORTS_PER_SOL,
            otherAmountThreshold: 0,
            sqrtPriceLimit: 0,
            amountSpecifiedIsInput: true,
            aToB: true,
          })
          .accounts({
            whirlpoolProgram: WHIRLPOOL_PROGRAM_ID,
            whirlpool: WHIRLPOOL_SOL_USDC,
            tokenAuthority: user.publicKey,
            tokenOwnerAccountA: wsolAccount,
            tokenOwnerAccountB: usdcAccount,
            tokenVaultA: whirlpool.tokenVaultA,
            tokenVaultB: whirlpool.tokenVaultB,
            tickArray0: Keypair.generate().publicKey,
            tickArray1: Keypair.generate().publicKey,
            tickArray2: Keypair.generate().publicKey,
            oracle,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        expect.fail("Should have thrown an error due to invalid tick arrays");
      } catch (err) {
        expect(err.message).to.include("invalid account data");
      }
    });
  });
});