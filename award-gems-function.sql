-- Run this in Supabase SQL Editor (Day 2 addition)

-- Award gems function with daily cap of 100
create or replace function award_gems(
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
returns void as $$
declare
  v_today_earned integer;
  v_daily_cap integer := 100;
  v_actual_amount integer;
begin
  -- Check how many gems earned today
  select coalesce(sum(amount), 0) into v_today_earned
  from gem_transactions
  where user_id = p_user_id
    and amount > 0
    and date_trunc('day', created_at) = date_trunc('day', now());

  -- Cap the award
  v_actual_amount := least(p_amount, v_daily_cap - v_today_earned);

  if v_actual_amount <= 0 then
    return; -- Daily cap hit
  end if;

  -- Insert transaction
  insert into gem_transactions (user_id, amount, reason)
  values (p_user_id, v_actual_amount, p_reason);

  -- Update profile gems
  update profiles
  set
    gems = gems + v_actual_amount,
    total_gems_earned = total_gems_earned + v_actual_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;
