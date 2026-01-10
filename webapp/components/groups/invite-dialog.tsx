/**
 * Invite Dialog Component
 *
 * Displays an invitation dialog with shareable link, QR code, and WhatsApp share button.
 * Allows users to invite others to join the arisan group.
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { Copy, Check, Share2, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface InviteDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback when the dialog is closed
   */
  onOpenChange: (open: boolean) => void;
  /**
   * The invite URL to share
   */
  inviteUrl: string;
  /**
   * The group name for the invitation message
   */
  groupName: string;
}

export function InviteDialog({
  open,
  onOpenChange,
  inviteUrl,
  groupName,
}: InviteDialogProps) {
  const [copied, setCopied] = useState(false);

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Link berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Gagal menyalin link');
    }
  };

  // Share via Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Gabung Arisan ${groupName}`,
          text: `Yuk gabung arisan ${groupName}! Klik link ini buat ikutan:`,
          url: inviteUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          toast.error('Gagal membagikan link');
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Yuk gabung arisan ${groupName}! Klik link ini buat ikutan:\n${inviteUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Generate QR code URL using qr-server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    inviteUrl
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Baru</DialogTitle>
          <DialogDescription>
            Bagikan link atau QR code ini ke teman-teman yang mau ikutan arisan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-neutral-50 rounded-xl">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img
                src={qrCodeUrl}
                alt="QR Code Undangan"
                className="w-48 h-48"
                loading="lazy"
              />
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Link Undangan
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant={copied ? 'secondary' : 'outline'}
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {copied ? 'Tersalin' : 'Salin link'}
                </span>
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Bagikan
            </Button>
            <Button
              variant="default"
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-neutral-500 pt-2">
            Link undangan ini bisa dipakai berkali-kali sampai grup penuh
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
