insert into public.suppliers (name, category, contact_name, whatsapp, service_areas, min_order, typical_delivery_days, notes)
values
  ('Northside Poultry', 'Protein / poultry', 'Darren Tan', '+65 9000 1001', '{Singapore}', 120, 1, 'Daily chilled poultry with morning delivery.'),
  ('Harbor Seafood Supply', 'Seafood', 'Mei Lin', '+65 9000 1002', '{Singapore}', 150, 1, 'Fish, prawns, squid, cleaned on request.'),
  ('FreshLane Produce', 'Vegetables / produce', 'Irfan Aziz', '+65 9000 1003', '{Singapore}', 80, 1, 'Leafy greens, onions, herbs, fruit crates.'),
  ('SpiceRoute Wholesale', 'Dry goods / spices', 'Ravi Kumar', '+65 9000 1004', '{Singapore}', 60, 2, 'Dry ingredients, sauces, seasoning packs.'),
  ('ColdChain Staples', 'Frozen foods', 'Sarah Lee', '+65 9000 1005', '{Singapore}', 100, 2, 'Frozen veg, frozen poultry, ready-made items.')
on conflict do nothing;
