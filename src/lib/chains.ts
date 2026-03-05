export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  nativeCurrency: string;
  explorerUrl: string;
  uniswapV2FactoryAddress?: string;
  uniswapV2RouterAddress?: string;
  wrappedNativeAddress: string;
  usdcAddress?: string;
}

export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  "1": {
    id: 1,
    name: "Ethereum Mainnet",
    shortName: "ethereum",
    rpcUrl: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
    nativeCurrency: "ETH",
    explorerUrl: "https://etherscan.io",
    uniswapV2FactoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    uniswapV2RouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    wrappedNativeAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  "56": {
    id: 56,
    name: "BNB Smart Chain",
    shortName: "bsc",
    rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
    nativeCurrency: "BNB",
    explorerUrl: "https://bscscan.com",
    uniswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    uniswapV2RouterAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    wrappedNativeAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    usdcAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  "137": {
    id: 137,
    name: "Polygon",
    shortName: "polygon",
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon.llamarpc.com",
    nativeCurrency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    uniswapV2FactoryAddress: "0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C",
    uniswapV2RouterAddress: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
    wrappedNativeAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  },
  "42161": {
    id: 42161,
    name: "Arbitrum One",
    shortName: "arbitrum",
    rpcUrl: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    nativeCurrency: "ETH",
    explorerUrl: "https://arbiscan.io",
    uniswapV2FactoryAddress: "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
    uniswapV2RouterAddress: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
    wrappedNativeAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  "8453": {
    id: 8453,
    name: "Base",
    shortName: "base",
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    nativeCurrency: "ETH",
    explorerUrl: "https://basescan.org",
    uniswapV2FactoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    uniswapV2RouterAddress: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  "10": {
    id: 10,
    name: "Optimism",
    shortName: "optimism",
    rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
    nativeCurrency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    uniswapV2FactoryAddress: "0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf",
    uniswapV2RouterAddress: "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    usdcAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CHAIN_CONFIGS);

export function getChainConfig(chainId: string | number): ChainConfig | null {
  return CHAIN_CONFIGS[String(chainId)] || null;
}

export function getChainName(chainId: string | number): string {
  return CHAIN_CONFIGS[String(chainId)]?.shortName || "unknown";
}
