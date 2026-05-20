import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { PassengerFormData } from '@/types';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, flight:flights(*), seat:seats(*), passengers(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: bookings ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { flight_id, seat_id, total_price, passengers } = body as {
    flight_id: string;
    seat_id: string;
    total_price: number;
    passengers: PassengerFormData[];
  };

  if (!flight_id || !seat_id || !total_price || !passengers?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const pnr = Array.from({ length: 6 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
  ).join('');

  const { data: rpcResult, error: rpcError } = await supabase.rpc('reserve_seat', {
    p_user_id: user.id,
    p_flight_id: flight_id,
    p_seat_id: seat_id,
    p_total_price: total_price,
    p_pnr_code: pnr,
  });

  if (rpcError || !rpcResult?.success) {
    return NextResponse.json(
      { error: rpcResult?.error ?? rpcError?.message ?? 'Reservation failed' },
      { status: 409 }
    );
  }

  const passengerRows = passengers.map((p) => ({
    booking_id: rpcResult.booking_id,
    full_name: p.full_name,
    nationality: p.nationality,
    dob: p.dob || null,
  }));

  await supabase.from('passengers').insert(passengerRows);

  return NextResponse.json({ success: true, booking_id: rpcResult.booking_id, pnr_code: pnr });
}
