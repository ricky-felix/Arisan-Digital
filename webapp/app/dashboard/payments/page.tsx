/**
 * Payments Page
 *
 * Displays payment history and upcoming payments.
 * Features filtering by status and group.
 */

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PaymentCard } from '@/components/payments/payment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PaymentStatus } from '@/lib/types/database';

export const metadata: Metadata = {
  title: 'Pembayaran - Arisan Digital',
  description: 'Kelola pembayaran arisan Anda',
};

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  paid_at: string | null;
  proof_url: string | null;
  created_at: string;
  rounds: {
    id: string;
    round_number: number;
    payment_deadline: string;
    groups: {
      id: string;
      name: string;
      contribution_amount: number;
    } | null;
  } | null;
}

export default async function PaymentsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Get user's payments with round and group details
  const { data: payments } = await supabase
    .from('payments')
    .select(
      `
      id,
      amount,
      status,
      paid_at,
      proof_url,
      created_at,
      rounds(
        id,
        round_number,
        payment_deadline,
        groups(id, name, contribution_amount)
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allPayments = (payments || []) as Payment[];

  // Filter payments by status
  const pendingPayments = allPayments.filter(
    (p) => p.status === 'pending' || p.status === 'late'
  );
  const paidPayments = allPayments.filter((p) => p.status === 'paid');

  // Count statistics
  const totalPending = pendingPayments.length;
  const totalPaid = paidPayments.length;
  const totalOverdue = allPayments.filter((p) => p.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Pembayaran
        </h1>
        <p className="text-neutral-600">
          Kelola pembayaran arisan Anda
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Menunggu</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Lunas</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalPaid}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Terlambat</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalOverdue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending" className="gap-2">
            Menunggu
            {totalPending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid" className="gap-2">
            Riwayat
            {totalPaid > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalPaid}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Payments */}
        <TabsContent value="pending" className="space-y-4">
          {pendingPayments.length === 0 ? (
            <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Tidak ada pembayaran pending
                </h3>
                <p className="text-neutral-600">
                  Semua pembayaran Anda sudah lunas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPayments.map((payment) => {
                const roundData = payment.rounds;
                const groupData = roundData?.groups;

                if (!roundData || !groupData) return null;

                return (
                  <PaymentCard
                    key={payment.id}
                    roundId={roundData.id}
                    groupName={groupData.name}
                    roundNumber={roundData.round_number}
                    amount={payment.amount}
                    status={payment.status}
                    deadline={roundData.payment_deadline}
                    isPaid={false}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Paid Payments History */}
        <TabsContent value="paid" className="space-y-4">
          {paidPayments.length === 0 ? (
            <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Belum ada riwayat pembayaran
                </h3>
                <p className="text-neutral-600">
                  Pembayaran yang sudah lunas akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paidPayments.map((payment) => {
                const roundData = payment.rounds;
                const groupData = roundData?.groups;

                if (!roundData || !groupData) return null;

                return (
                  <PaymentCard
                    key={payment.id}
                    roundId={roundData.id}
                    groupName={groupData.name}
                    roundNumber={roundData.round_number}
                    amount={payment.amount}
                    status={payment.status}
                    deadline={roundData.payment_deadline}
                    isPaid={true}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
