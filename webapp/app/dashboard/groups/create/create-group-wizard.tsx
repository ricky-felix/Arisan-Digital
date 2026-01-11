/**
 * Create Group Wizard Component
 *
 * Multi-step wizard for creating arisan groups.
 * Handles form state, validation, and server actions.
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GroupForm, type GroupFormData } from '@/components/groups/group-form';
import { InviteDialog } from '@/components/groups/invite-dialog';
import { createGroupAction, generateInviteLinkAction } from '@/app/actions/groups';
import { toast } from 'sonner';
import { cn, formatCurrency, formatFrequency } from '@/lib/utils';

type WizardStep = 'details' | 'preview' | 'invite';

export function CreateGroupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [formData, setFormData] = useState<GroupFormData | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Handle form submission (Step 1 -> Step 2)
  const handleFormSubmit = (data: GroupFormData) => {
    setFormData(data);
    setCurrentStep('preview');
  };

  // Handle create group (Step 2 -> Step 3)
  const handleCreateGroup = async () => {
    if (!formData) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for server action
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('contribution_amount', formData.contribution_amount.toString());
      formDataObj.append('frequency', formData.frequency);
      formDataObj.append('member_count', formData.member_count.toString());
      formDataObj.append('start_date', formData.start_date);

      const result = await createGroupAction(formDataObj);

      if (result.success && result.data?.groupId) {
        toast.success('Arisan berhasil dibuat!');
        setCreatedGroupId(result.data.groupId);

        // Generate invite link
        const inviteResult = await generateInviteLinkAction(result.data.groupId);
        if (inviteResult.success && inviteResult.data?.inviteUrl) {
          setInviteUrl(inviteResult.data.inviteUrl);
        }

        setCurrentStep('invite');
      } else {
        toast.error(result.error || 'Gagal membuat arisan');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Terjadi kesalahan. Coba lagi ya!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('details');
    }
  };

  // Handle finish
  const handleFinish = () => {
    if (createdGroupId) {
      router.push(`/dashboard/groups/${createdGroupId}`);
    } else {
      router.push('/dashboard/groups');
    }
  };

  // Progress indicator
  const steps = [
    { id: 'details', label: 'Detail Arisan', number: 1 },
    { id: 'preview', label: 'Konfirmasi', number: 2 },
    { id: 'invite', label: 'Undang Anggota', number: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  index <= currentStepIndex
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-neutral-200 text-neutral-500'
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:inline',
                  index <= currentStepIndex
                    ? 'text-emerald-600'
                    : 'text-neutral-500'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 w-12 rounded-full transition-all',
                  index < currentStepIndex
                    ? 'bg-emerald-500'
                    : 'bg-neutral-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentStep === 'preview' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <CardTitle>
              {currentStep === 'details' && 'Detail Arisan'}
              {currentStep === 'preview' && 'Konfirmasi Detail'}
              {currentStep === 'invite' && 'Undang Anggota'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Form */}
          {currentStep === 'details' && (
            <GroupForm
              onSubmit={handleFormSubmit}
              submitText="Lanjut ke Preview"
            />
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && formData && (
            <div className="space-y-6">
              <div className="space-y-4">
                <PreviewItem label="Nama Arisan" value={formData.name} />
                <PreviewItem
                  label="Iuran per Putaran"
                  value={formatCurrency(formData.contribution_amount)}
                />
                <PreviewItem
                  label="Frekuensi"
                  value={formatFrequency(formData.frequency)}
                />
                <PreviewItem
                  label="Jumlah Anggota"
                  value={`${formData.member_count} orang`}
                />
                <PreviewItem
                  label="Tanggal Mulai"
                  value={new Date(formData.start_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                />
                <PreviewItem
                  label="Total Payout Pemenang"
                  value={formatCurrency(
                    formData.contribution_amount * formData.member_count
                  )}
                  highlight
                />
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 mb-4">
                  Pastikan semua detail sudah benar ya! Kamu nggak bisa mengubah
                  jumlah anggota setelah arisan dibuat.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Kembali
                  </Button>
                  <Button
                    variant="casual"
                    onClick={handleCreateGroup}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Memproses...' : 'Buat Arisan'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Invite */}
          {currentStep === 'invite' && formData && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Arisan Berhasil Dibuat!
                </h3>
                <p className="text-neutral-600">
                  Sekarang waktunya undang {formData.member_count - 1} teman buat
                  ikutan arisan {formData.name}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">
                  Cara Undang Anggota:
                </h4>
                <ol className="text-sm text-emerald-700 space-y-1 list-decimal list-inside">
                  <li>Klik tombol "Bagikan Link Undangan"</li>
                  <li>Kirim link ke teman via WhatsApp atau media sosial</li>
                  <li>Teman klik link dan join arisan</li>
                  <li>Arisan mulai otomatis setelah semua anggota join</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleFinish}
                  className="flex-1"
                >
                  Nanti Aja
                </Button>
                <Button
                  variant="casual"
                  onClick={() => setShowInviteDialog(true)}
                  className="flex-1"
                >
                  Bagikan Link Undangan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      {inviteUrl && formData && (
        <InviteDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          inviteUrl={inviteUrl}
          groupName={formData.name}
        />
      )}
    </div>
  );
}

// Preview Item Component
interface PreviewItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function PreviewItem({ label, value, highlight = false }: PreviewItemProps) {
  return (
    <div
      className={cn(
        'flex justify-between items-center py-3 px-4 rounded-lg',
        highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-neutral-50'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          highlight ? 'text-emerald-900' : 'text-neutral-700'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'font-semibold',
          highlight ? 'text-emerald-600 text-lg' : 'text-neutral-900'
        )}
      >
        {value}
      </span>
    </div>
  );
}
