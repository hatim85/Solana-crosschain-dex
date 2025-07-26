import { WhirlpoolContext, setWhirlpoolsConfig } from '@orca-so/whirlpools';
import { Connection, PublicKey } from '@solana/web3.js';
async function findPools() {
  const connection = new Connection('https://api.devnet.solana.com');
  await setWhirlpoolsConfig('solanaDevnet');
  const ctx = WhirlpoolContext.withProvider(connection, new PublicKey('whirLbMiS22Q9y3y2E4w8rSJ3T4YY2J9yJ5oW9aA9'));
  const client = ctx.getClient();
  const solUsdcPool = await client.findWhirlpool(
    new PublicKey('So11111111111111111111111111111111111111112'),
    new PublicKey('BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'),
    64
  );
  const solWethPool = await client.findWhirlpool(
    new PublicKey('So11111111111111111111111111111111111111112'),
    new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
    64
  );
  console.log('SOL/USDC Pool:', solUsdcPool?.address.toBase58() || 'Not found');
  console.log('SOL/WETH Pool:', solWethPool?.address.toBase58() || 'Not found');
}
findPools().catch(console.error);