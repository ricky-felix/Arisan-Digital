/**
 * Payment Form Component
 *
 * Form for submitting payment with proof upload.
 * Features image upload with drag & drop, preview, compression,
 * payment method selection, and notes field.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { submitPayment } from '@/app/actions/payments';
import { toast } from 'sonner';

interface PaymentFormProps {
  roundId: string;
  groupId: string;
  amount: number;
  groupName: string;
  roundNumber: number;
  deadline: string;
  existingPayment?: {
    id: string;
    status: string;
  } | null;
}

/**
 * Compresses an image file to ensure it's under max size
 */
async function compressImage(file: File, maxSizeMB = 2): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      img.src = event.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.9;
        const targetSize = maxSizeMB * 1024 * 1024;

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > targetSize && quality > 0.5) {
                quality -= 0.1;
                compress();
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };

        compress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

export function PaymentForm({
  roundId,
  groupId,
  amount: _amount,
  groupName: _groupName,
  roundNumber: _roundNumber,
  deadline: _deadline,
  existingPayment: _existingPayment,
}: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from input or drag & drop
   */
  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Mengompress gambar...');

      // Compress image
      const compressedFile = await compressImage(file, 2);

      toast.dismiss(loadingToast);
      toast.success('Gambar siap diunggah');

      setImageFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('Gagal memproses gambar');
    }
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handles drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handles file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Removes selected image
   */
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Bukti pembayaran harus diunggah');
      return;
    }

    if (!paymentMethod) {
      toast.error('Metode pembayaran harus dipilih');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('proof', imageFile);
      formData.append('paymentMethod', paymentMethod);
      if (notes) {
        formData.append('notes', notes);
      }

      const result = await submitPayment(roundId, formData);

      if (result.success) {
        toast.success('Pembayaran berhasil disubmit!', {
          description: 'Menunggu verifikasi dari admin',
        });
        // Redirect back to group detail page
        router.push(`/dashboard/groups/${groupId}`);
      } else {
        toast.error(result.error || 'Gagal submit pembayaran');
      }
    } catch (error) {
      console.error('Submit payment error:', error);
      toast.error('Terjadi kesalahan pada sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="proof">
          Bukti Pembayaran <span className="text-red-500">*</span>
        </Label>

        {!imagePreview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center
              min-h-[240px] rounded-xl border-2 border-dashed
              cursor-pointer transition-all
              ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-neutral-300 bg-neutral-50 hover:border-emerald-400 hover:bg-emerald-50/50'
              }
            `}
          >
            <Upload
              className={`h-12 w-12 mb-4 ${
                isDragging ? 'text-emerald-500' : 'text-neutral-400'
              }`}
            />
            <p className="text-base font-medium text-neutral-700 mb-1">
              Klik atau drag & drop gambar
            </p>
            <p className="text-sm text-neutral-500">
              PNG, JPG maksimal 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              id="proof"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border-2 border-neutral-300">
            <img
              src={imagePreview}
              alt="Preview bukti pembayaran"
              className="w-full h-auto"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-xs text-neutral-500">
          Gambar akan dikompres otomatis menjadi maksimal 2MB
        </p>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">
          Metode Pembayaran <span className="text-red-500">*</span>
        </Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Pilih metode pembayaran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
            <SelectItem value="e_wallet">E-Wallet (GoPay, OVO, Dana)</SelectItem>
            <SelectItem value="cash">Tunai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Tambahkan catatan jika diperlukan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !imageFile || !paymentMethod}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Mengirim...
          </>
        ) : (
          'Submit Pembayaran'
        )}
      </Button>
    </form>
  );
}
