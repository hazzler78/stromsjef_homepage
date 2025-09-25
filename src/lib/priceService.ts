import { CheapEnergyPrices } from './types';

export async function fetchCheapEnergyPrices(): Promise<CheapEnergyPrices> {
  try {
    const response = await fetch('/api/prices');
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
} 