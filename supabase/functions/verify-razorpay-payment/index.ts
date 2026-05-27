// Supabase Edge Function — verifies Razorpay payment signature and confirms registration
// Deploy: supabase functions deploy verify-razorpay-payment

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { paymentId, orderId, signature, registrationId } = await req.json()

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const body = `${orderId}|${paymentId}`
    const expectedSignature = createHmac('sha256', keySecret).update(body).digest('hex')

    if (expectedSignature !== signature) {
      throw new Error('Payment signature verification failed')
    }

    // Update registration in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase
      .from('tournament_registrations')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
      })
      .eq('id', registrationId)

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
