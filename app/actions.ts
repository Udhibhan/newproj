'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function asText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const payload = {
    id: user.id,
    tradebase_id: asText(formData, 'tradebase_id'),
    stall_name: asText(formData, 'stall_name'),
    hawker_centre: asText(formData, 'hawker_centre'),
    cuisine: asText(formData, 'cuisine'),
    phone: asText(formData, 'phone'),
    notes: asText(formData, 'notes'),
  };

  if (!payload.tradebase_id || !payload.stall_name || !payload.hawker_centre) {
    throw new Error('TradeBase ID, stall name, and hawker centre are required.');
  }

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
}

export async function createSupplyRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const quantity = Number(asText(formData, 'quantity'));
  const targetPrice = Number(asText(formData, 'target_price'));
  const payload = {
    owner_id: user.id,
    item_name: asText(formData, 'item_name'),
    quantity: Number.isFinite(quantity) ? quantity : null,
    unit: asText(formData, 'unit'),
    preferred_supplier: asText(formData, 'preferred_supplier'),
    target_price: Number.isFinite(targetPrice) ? targetPrice : null,
    needed_by: asText(formData, 'needed_by') || null,
    hawker_centre: asText(formData, 'hawker_centre'),
    notes: asText(formData, 'notes'),
    status: 'open',
  };

  if (!payload.item_name || !payload.quantity || !payload.unit) {
    throw new Error('Item name, quantity, and unit are required.');
  }

  const { error } = await supabase.from('supply_requests').insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
}

export async function createGroupOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const targetQuantity = Number(asText(formData, 'target_quantity'));
  const payload = {
    created_by: user.id,
    item_name: asText(formData, 'item_name'),
    unit: asText(formData, 'unit'),
    target_quantity: Number.isFinite(targetQuantity) ? targetQuantity : null,
    target_date: asText(formData, 'target_date') || null,
    hawker_centre: asText(formData, 'hawker_centre'),
    supplier_hint: asText(formData, 'supplier_hint'),
    notes: asText(formData, 'notes'),
    status: 'collecting',
  };

  if (!payload.item_name || !payload.unit) {
    throw new Error('Item name and unit are required.');
  }

  const { error } = await supabase.from('group_orders').insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
}

export async function joinGroupOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const groupOrderId = asText(formData, 'group_order_id');
  const quantity = Number(asText(formData, 'quantity'));
  const payload = {
    group_order_id: groupOrderId,
    member_id: user.id,
    quantity: Number.isFinite(quantity) ? quantity : null,
    notes: asText(formData, 'notes'),
  };

  if (!payload.group_order_id || !payload.quantity) {
    throw new Error('Group order and quantity are required.');
  }

  const { error } = await supabase.from('group_order_members').insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
}
