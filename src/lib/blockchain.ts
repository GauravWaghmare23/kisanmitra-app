import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const CONTRACT_ABI = [
  "function addCrop(string memory _cropId, string memory _metadataHash) external",
  "function updateCropStatus(string memory _cropId, string memory _status, string memory _location, string memory _notes) external",
  "function transferCrop(string memory _cropId, address _newHandler, string memory _status, string memory _location, string memory _notes) external",
  "function getCrop(string memory _cropId) external view returns (string memory, address, address, string memory, uint256, string memory)",
  "function getCropJourney(string memory _cropId) external view returns (tuple(address,string,string,uint256,string,string)[])",
  "function registerUser(string memory _role) external",
  "event CropAdded(string indexed cropId, address indexed farmer, uint256 timestamp, string metadataHash)",
  "event CropTransferred(string indexed cropId, address indexed from, address indexed to, string status, uint256 timestamp)",
  "event JourneyUpdated(string indexed cropId, address indexed handler, string status, uint256 timestamp)"
];

let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

// Initialize blockchain connection
if (typeof window === 'undefined') {
  // Server side
  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  if (CONTRACT_ADDRESS) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  }
}

export const blockchainService = {
  async addCrop(cropId: string, metadataHash: string = '') {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.addCrop(cropId, metadataHash);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Blockchain addCrop error:', error);
      throw error;
    }
  },

  async updateCropStatus(cropId: string, status: string, location: string, notes: string = '') {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.updateCropStatus(cropId, status, location, notes);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Blockchain updateCropStatus error:', error);
      throw error;
    }
  },

  async transferCrop(cropId: string, newHandlerAddress: string, status: string, location: string, notes: string = '') {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.transferCrop(cropId, newHandlerAddress, status, location, notes);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Blockchain transferCrop error:', error);
      throw error;
    }
  },

  async getCrop(cropId: string) {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const result = await contract.getCrop(cropId);
      return {
        cropId: result[0],
        farmer: result[1],
        currentHandler: result[2],
        status: result[3],
        timestamp: result[4].toString(),
        metadataHash: result[5],
      };
    } catch (error) {
      console.error('Blockchain getCrop error:', error);
      throw error;
    }
  },

  async registerUser(role: 'farmer' | 'distributor' | 'retailer', walletAddress: string) {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.registerUser(role);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Blockchain registerUser error:', error);
      throw error;
    }
  },

  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      return {
        address,
        provider,
        signer,
      };