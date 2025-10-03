-- Forbrukerrådet prices table
-- Stores price data from Forbrukerrådet strømprisportal feeds

CREATE TABLE IF NOT EXISTS forbrukerradet_prices (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  week INTEGER NOT NULL,
  consumption INTEGER NOT NULL,
  name TEXT NOT NULL,
  no1 DECIMAL(10,8) NOT NULL,
  no2 DECIMAL(10,8) NOT NULL,
  no3 DECIMAL(10,8) NOT NULL,
  no4 DECIMAL(10,8) NOT NULL,
  no5 DECIMAL(10,8) NOT NULL,
  national DECIMAL(10,8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  source TEXT DEFAULT 'forbrukerradet',
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(year, week, consumption, name)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forbrukerradet_prices_year_week ON forbrukerradet_prices(year, week);
CREATE INDEX IF NOT EXISTS idx_forbrukerradet_prices_name ON forbrukerradet_prices(name);
CREATE INDEX IF NOT EXISTS idx_forbrukerradet_prices_consumption ON forbrukerradet_prices(consumption);
CREATE INDEX IF NOT EXISTS idx_forbrukerradet_prices_created_at ON forbrukerradet_prices(created_at);

-- RLS (Row Level Security) - allow public read access
ALTER TABLE forbrukerradet_prices ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON forbrukerradet_prices
  FOR SELECT USING (true);

-- Policy to allow service role to insert/update
CREATE POLICY "Allow service role full access" ON forbrukerradet_prices
  FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow anonymous inserts (for API calls)
CREATE POLICY "Allow anonymous inserts" ON forbrukerradet_prices
  FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE forbrukerradet_prices IS 'Price data from Forbrukerrådet strømprisportal feeds';
COMMENT ON COLUMN forbrukerradet_prices.year IS 'Year of the price data';
COMMENT ON COLUMN forbrukerradet_prices.week IS 'Week number of the year';
COMMENT ON COLUMN forbrukerradet_prices.consumption IS 'Consumption level in kWh';
COMMENT ON COLUMN forbrukerradet_prices.name IS 'Price type name (spot, fixed, etc.)';
COMMENT ON COLUMN forbrukerradet_prices.no1 IS 'Price for NO1 zone (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.no2 IS 'Price for NO2 zone (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.no3 IS 'Price for NO3 zone (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.no4 IS 'Price for NO4 zone (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.no5 IS 'Price for NO5 zone (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.national IS 'National average price (øre/kWh)';
COMMENT ON COLUMN forbrukerradet_prices.source IS 'Data source identifier';
