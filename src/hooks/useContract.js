import TOKEN_ABI from "../abis/cb-token.json";
import { TOKEN_ADDRESS } from "../constants";
import { useEffect, useState } from "react";
import { Contract } from 'ethers';

export const getContract = async (address, ABI, provider) => {
    return new Contract(address, ABI, provider);
}

export const getTokenSupply = async (provider) => {
    const contract = await getContract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const supply = await contract.totalSupply();
    return supply;
}

export const getTokenBalance = async (address, provider) => {
    const contract = await getContract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const balance = await contract.balanceOf(address);
    return balance;
}

export const transferTokens = async (address, amount, provider) => {
    const contract = await getContract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const transfer = await contract.transfer(address, amount);
    return transfer;
}