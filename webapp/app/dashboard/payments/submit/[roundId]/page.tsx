/**
 * Payment Submission Page
 *
 * Allows users to submit payment proof for a specific round.
 * Features upload proof of payment, amount verification, and notes.
 */

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PaymentForm } from '@/components/payments/payment-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Bayar Iuran - Arisan Digital',
  description: 'Kirim bukti pembayaran iuran arisan',
};

interface PaymentSubmitPageProps {
  params: {
    roundId: string;
  };
}

export default async function PaymentSubmitPage({
  params,
}: PaymentSubmitPageProps) {
  const { roundId } = params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Fetch round details with group info
  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select(
      `
      id,
      round_number,
      payment_deadline,
      status,
      groups (
        id,
        name,
        contribution_amount
      )
    `
    )
    .eq('id', roundId)
    .single<{
      id: string;
      round_number: number;
      payment_deadline: string;
      status: string;
      groups: {
        id: string;
        name: string;
        contribution_amount: number;
      };
    }>();

  if (roundError || !round) {
    notFound();
  }

  // Check if user already has a payment for this round
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('round_id', roundId)
    .eq('user_id', user.id)
    .maybeSingle();

  // Get group info
  const groupData = round.groups;

  if (!groupData) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link href={`/dashboard/groups/${groupData.id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Detail Grup
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Bayar Iuran
        </h1>
        <p className="text-neutral-600">
          {groupData.name} - Round {round.round_number}
        </p>
      </div>

      {/* Payment Form */}
      <PaymentForm
        roundId={round.id}
        groupId={groupData.id}
        groupName={groupData.name}
        roundNumber={round.round_number}
        amount={groupData.contribution_amount}
        deadline={round.payment_deadline}
        existingPayment={existingPayment}
      />
    </div>
  );
}
