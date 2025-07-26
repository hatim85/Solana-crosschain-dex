import {
  setWhirlpoolsConfig,
  setRpc,
  setPayerFromBytes,
  createSplashPool,
  orderMints
} from "@orca-so/whirlpools";
import {PublicKey} from "@solana/web3.js"
import { createSolanaRpc, devnet, address } from "@solana/kit";
import fs from "fs";
import os, { type } from "os";

async function createPool() {
  const rpcUrl = "https://api.devnet.solana.com";
  const rpc = createSolanaRpc(devnet(rpcUrl));

  await setWhirlpoolsConfig("solanaDevnet");
  await setRpc(rpcUrl);
  console.log("→ Connected to:", rpcUrl);

  const keypairArr = JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf8"));
  const secret = Uint8Array.from(keypairArr);
  const signer = await setPayerFromBytes(secret);
  console.log("→ Owner:", signer.address.toString());

  // token strings only
  const tokenA = "So11111111111111111111111111111111111111112"; // wSOL
  const tokenB = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"; // wETH

//   console.log(address(tokenA).toString());
// console.log(address(tokenB).toString());

  console.log("token types:", typeof tokenA, typeof tokenB); // must log "string string"

  
  const [mintA_ordered, mintB_ordered] = orderMints(tokenA, tokenB);
  console.log("→ Ordered mints:", mintA_ordered,mintB_ordered);
  
  const mintA = address(tokenA);
  const mintB = address(tokenB);
  console.log("→ Mint A:", mintA.toString(),typeof mintA);
  console.log("→ Mint B:", mintB.toString(), typeof mintB);
  
  const initialPrice = 0.01; // price of A in terms of B


  const { poolAddress, initializationCost, callback: sendTx } =
    await createSplashPool(rpc, mintA, mintB, initialPrice, signer);

  console.log("→ Initialization cost:", initializationCost.toString(), "lamports");
  const txId = await sendTx();
  console.log("✅ Pool created at", poolAddress.toString(), "— tx:", txId);
}

createPool().catch(err => {
  console.error("Error:", err);
  if (err.logs) console.error("Logs:", err.logs);
});
