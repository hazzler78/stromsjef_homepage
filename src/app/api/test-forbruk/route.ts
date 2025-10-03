import { NextResponse } from 'next/server';

// Simple test endpoint to check if we can connect to Forbrukerrådet API
export async function GET() {
  try {
    const baseUrl = 'https://strom-api.forbrukerradet.no';
    const feedPath = '/feed/week';
    
    console.log('Testing Forbrukerrådet API connection...');
    console.log('Base URL:', baseUrl);
    console.log('Feed path:', feedPath);
    
    // Try to fetch data without authentication first
    const response = await fetch(`${baseUrl}${feedPath}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Stromsjef/1.0'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return NextResponse.json({
        error: 'Failed to fetch from Forbrukerrådet API',
        status: response.status,
        statusText: response.statusText,
        body: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('Success! Data received:', typeof data, Array.isArray(data) ? data.length : 'not array');
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Forbrukerrådet API',
      dataLength: Array.isArray(data) ? data.length : 'not array',
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : data,
      fullData: data
    });
    
  } catch (error) {
    console.error('Error testing Forbrukerrådet API:', error);
    return NextResponse.json({
      error: 'Failed to test Forbrukerrådet API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
