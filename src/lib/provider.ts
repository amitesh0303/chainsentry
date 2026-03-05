import { ethers } from "ethers";
import { getChainConfig } from "./chains";

const providerCache = new Map<string, ethers.JsonRpcProvider>();

export function getProvider(chainId: string | number): ethers.JsonRpcProvider {
  const key = String(chainId);
  if (providerCache.has(key)) {
    return providerCache.get(key)!;
  }

  const config = getChainConfig(chainId);
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.id, {
    staticNetwork: ethers.Network.from(config.id),
  });
  providerCache.set(key, provider);
  return provider;
}

// ERC-20 ABI (minimal for analysis)
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function renounceOwnership()",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function isBlacklisted(address) view returns (bool)",
  "function blacklist(address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Uniswap V2 Factory ABI
export const UNISWAP_V2_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

// Uniswap V2 Pair ABI
export const UNISWAP_V2_PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

export async function getContractBytecode(
  provider: ethers.JsonRpcProvider,
  address: string
): Promise<string> {
  try {
    return await provider.getCode(address);
  } catch {
    return "0x";
  }
}

export function isContract(bytecode: string): boolean {
  return bytecode !== "0x" && bytecode !== "" && bytecode.length > 2;
}

export function computeBytecodeHash(bytecode: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(bytecode));
}

export async function safeContractCall<T>(
  contract: ethers.Contract,
  method: string,
  args: unknown[] = []
): Promise<T | null> {
  try {
    return (await contract[method](...args)) as T;
  } catch {
    return null;
  }
}
