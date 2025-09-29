-- Business electricity plans schema for Strømsjef

create table if not exists public.business_electricity_plans (
  id text primary key,
  supplier_name text not null,
  plan_name text not null,
  price_per_kwh numeric not null,
  monthly_fee numeric not null default 0,
  binding_time integer not null default 0,
  binding_time_text text,
  terms_guarantee text,
  guarantee_disclaimer text,
  termination_fee numeric,
  price_zone text not null check (price_zone in ('ALL','NO1','NO2','NO3','NO4','NO5')),
  logo_url text,
  affiliate_link text,
  featured boolean not null default false,
  sort_order integer,
  price_badge text,
  recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_electricity_plans_zone on public.business_electricity_plans(price_zone);
create index if not exists idx_business_electricity_plans_featured on public.business_electricity_plans(featured);
create index if not exists idx_business_electricity_plans_recommended on public.business_electricity_plans(recommended);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at_business()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_business_electricity_plans_updated_at on public.business_electricity_plans;
create trigger trg_business_electricity_plans_updated_at
before update on public.business_electricity_plans
for each row execute function public.set_updated_at_business();

-- RLS (enable if needed)
-- alter table public.business_electricity_plans enable row level security;
-- Add policies based on your setup.


