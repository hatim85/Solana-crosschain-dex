import {
  setWhirlpoolsConfig,
  fetchWhirlpoolsByTokenPair,
  orderMints
} from "@orca-so/whirlpools";
import { createSolanaRpc, devnet } from "@solana/kit";

export async function checkPoolExists() {
  await setWhirlpoolsConfig("solanaDevnet");
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

  const mintA = "So11111111111111111111111111111111111111112"; // SOL
  const mintB = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"; // WETH
  const [m1, m2] = orderMints(mintA, mintB);

  const pools = await fetchWhirlpoolsByTokenPair(rpc, m1, m2);

  if (pools.length === 0) {
    console.log("❌ No pools found for SOL/WETH pair. Safe to create.");
    return false;
  }

  pools.forEach((pool, i) => {
    console.log(
      JSON.stringify(
        pool,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );
  });

  const exists = pools.some(p => p.initialized);
  if (exists) {
    console.log("✅ An initialized SOL/WETH pool already exists.");
  } else {
    console.log("ℹ️ SOL/WETH pools found, but none are initialized yet.");
  }

  return exists;
}

checkPoolExists().catch(console.error);