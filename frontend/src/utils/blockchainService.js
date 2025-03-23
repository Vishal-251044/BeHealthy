import Web3 from "web3";
import HealthRiskStorageABI from "./HealthRiskStorage.json";

// ✅ Load environment variables
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const INFURA_RPC_URL = process.env.REACT_APP_INFURA_RPC_URL;
let ADMIN_PRIVATE_KEY = process.env.REACT_APP_ADMIN_PRIVATE_KEY;

// 🔹 Ensure the private key is valid
if (!ADMIN_PRIVATE_KEY || ADMIN_PRIVATE_KEY.length !== 64) {
    console.error("❌ Invalid Private Key. Check your .env file.");
    throw new Error("Invalid Private Key. Ensure it's correctly set in .env.");
}

// 🔹 Remove "0x" prefix if present
if (ADMIN_PRIVATE_KEY.startsWith("0x")) {
    ADMIN_PRIVATE_KEY = ADMIN_PRIVATE_KEY.slice(2);
}

// 🔹 Connect to Sepolia Testnet
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC_URL));

// 🔹 Add Admin Wallet (Fix InvalidPrivateKeyError)
const adminAccount = web3.eth.accounts.privateKeyToAccount("0x" + ADMIN_PRIVATE_KEY);
web3.eth.accounts.wallet.add(adminAccount);

// 🔹 Load Smart Contract
const contract = new web3.eth.Contract(HealthRiskStorageABI.abi, CONTRACT_ADDRESS);

// 🔹 Store Health Data (Admin Pays Gas Fee)
export const storeHealthData = async (_email, _riskLevel, _suggestion, _timestamp) => {
    try {
        const tx = await contract.methods.storeHealthData(_email, _riskLevel, _suggestion, _timestamp)
            .send({ from: adminAccount.address, gas: 3000000 });

        return tx;
    } catch (error) {
        console.error("❌ Error storing health data:", error);
        throw error;
    }
};

// 🔹 Retrieve Health Data
export const getHealthData = async (email) => {
    try {
        const healthRecords = await contract.methods.getHealthData(email).call();

        if (!healthRecords || healthRecords.length === 0) {
            return [];
        }

        return healthRecords.map((record) => ({
            riskLevel: record.riskLevel,
            suggestion: record.suggestion,
            timestamp: record.timestamp,
            email: record.email,
        }));
    } catch (error) {
        console.error("❌ Error retrieving health data:", error);
        return [];
    }
};

export { contract, adminAccount };
