import { NextResponse } from 'next/server';
import { CheapEnergyPrices } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // Verify the request is authorized (you can add authentication here)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.UPDATE_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting scheduled price update...');
    
    // Fetch latest prices from Cheap Energy
    const response = await fetch('https://www.cheapenergy.se/Site_Priser_CheapEnergy_de.json', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Elchef-Price-Updater/1.0'
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`);
    }

    const data: CheapEnergyPrices = await response.json();
    
    // Log the updated prices
    console.log('✅ Prices updated successfully at:', new Date().toISOString());
    console.log('📊 Current spot prices:', data.spot_prices);
    console.log('📊 Current fixed prices (6 months):', {
      se1: data.variable_fixed_prices.se1['6_months'],
      se2: data.variable_fixed_prices.se2['6_months'],
      se3: data.variable_fixed_prices.se3['6_months'],
      se4: data.variable_fixed_prices.se4['6_months']
    });
    console.log('📊 Current fixed prices (12 months):', {
      se1: data.variable_fixed_prices.se1['1_year'],
      se2: data.variable_fixed_prices.se2['1_year'],
      se3: data.variable_fixed_prices.se3['1_year'],
      se4: data.variable_fixed_prices.se4['1_year']
    });

    // In a real implementation, you might want to store these prices in a database
    // For now, we'll just return success since Next.js will cache the API response
    
    return NextResponse.json({ 
      success: true, 
      message: 'Prices updated successfully',
      timestamp: new Date().toISOString(),
      prices: {
        spot: data.spot_prices,
        fixed_6m: {
          se1: data.variable_fixed_prices.se1['6_months'],
          se2: data.variable_fixed_prices.se2['6_months'],
          se3: data.variable_fixed_prices.se3['6_months'],
          se4: data.variable_fixed_prices.se4['6_months']
        },
        fixed_12m: {
          se1: data.variable_fixed_prices.se1['1_year'],
          se2: data.variable_fixed_prices.se2['1_year'],
          se3: data.variable_fixed_prices.se3['1_year'],
          se4: data.variable_fixed_prices.se4['1_year']
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update prices', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 

export const runtime = 'edge'; 