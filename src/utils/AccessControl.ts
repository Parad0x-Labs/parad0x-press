import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NativeModules } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

// CONSTANTS
const TREASURY_WALLET = new PublicKey("9vDnXsPonRJa7yAmvwRGMAdxt8W13Qbm7HZuvauM3Ya3");
const NULL_TOKEN_MINT = new PublicKey("8EeDdvCRmFAzVD4takkBrNNwkeUTUQh4MscRK5Fzpump");
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"; // Use Helius/QuickNode in prod
const GOLDEN_TICKET_NAME = "Parad0x Golden Ticket";

// PRICES (Dynamic in prod, hardcoded for MVP)
const PRICE_USD = 19.99;
const APPROX_SOL_PRICE = 150; // Example: $150/SOL
const PRICE_SOL = PRICE_USD / APPROX_SOL_PRICE;
const PRICE_NULL_TOKENS = 100000; // Example amount for $NULL

const { DreamscapeEngine } = NativeModules;

export enum AccessState {
    CHECKING,
    GRANTED_SEEKER,
    GRANTED_HOLDER,
    DENIED,
    ERROR
}

export const AccessControl = {

    // 1. HARDWARE CHECK
    async isSeeker(): Promise<boolean> {
        try {
            return await DreamscapeEngine.isSeeker();
        } catch (e) {
            console.error("Seeker Check Failed", e);
            return false;
        }
    },

    // 2. OWNERSHIP CHECK (Golden Ticket)
    async checkOwnership(walletAddress: PublicKey): Promise<boolean> {
        const connection = new Connection(RPC_ENDPOINT);
        try {
            // Fetch all tokens
            const accounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
                programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
            });

            // Find the Ticket
            // In a real app with Helius, use `getAssetsByOwner` and check Mint/Collection.
            // For MVP, we check if they hold ANY token minted by Treasury (if we implement that) 
            // OR simply valid token if we knew the mint. 
            // Since we rely on Airdrop/Mint, we assume we know the "Collection" or Name.
            // Simplified: User Airdrops specific NFTs. 
            // We'll return TRUE if they have any token passed a certain checks.
            // For safety now: Check if they hold > 0 of the Known Golden Ticket Mint (Must be defined later)
            // returning false placeholder until Mint ID is known.
            console.log("Checking tokens...", accounts.value.length);
            return false;
        } catch (e) {
            console.error("Ownership Check Failed", e);
            return false;
        }
    },

    // 3. BUY LICENSE (SOL)
    async buyWithSol(userAccount: any): Promise<string> {
        // Construct Transaction using MWA
        return await transact(async (wallet) => {
            const connection = new Connection(RPC_ENDPOINT);
            const latestBlockhash = await connection.getLatestBlockhash();

            // Reference Key for Tracking
            // const reference = Keypair.generate().publicKey; 

            const transaction = new Transaction({
                ...latestBlockhash,
                feePayer: userAccount.publicKey
            }).add(
                SystemProgram.transfer({
                    fromPubkey: userAccount.publicKey,
                    toPubkey: TREASURY_WALLET,
                    lamports: Math.floor(PRICE_SOL * LAMPORTS_PER_SOL),
                })
            );

            // Sign and Send
            const signatures = await wallet.signAndSendTransactions({
                transactions: [transaction]
            });
            return signatures[0];
        });
    }
};
