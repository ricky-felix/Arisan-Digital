import { BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { AllowedBucket } from './dto/create-upload-url.dto';

// ─── Supabase storage stub ────────────────────────────────────────────────────

function buildSupabase(opts: {
  uploadUrlData?: { signedUrl: string; token: string } | null;
  readUrlData?: { signedUrl: string } | null;
  uploadError?: boolean;
  readError?: boolean;
  removeError?: boolean;
}) {
  const storageMock = {
    from: jest.fn((bucket: string) => ({
      createSignedUploadUrl: jest.fn((_path: string) => {
        if (opts.uploadError) return Promise.resolve({ data: null, error: { message: 'upload failed' } });
        return Promise.resolve({
          data: opts.uploadUrlData ?? { signedUrl: 'https://storage/upload-url', token: 'tok-1' },
          error: null,
        });
      }),
      createSignedUrl: jest.fn((_path: string, _expires: number) => {
        if (opts.readError) return Promise.resolve({ data: null, error: { message: 'read failed' } });
        return Promise.resolve({
          data: opts.readUrlData ?? { signedUrl: 'https://storage/read-url' },
          error: null,
        });
      }),
      remove: jest.fn((_paths: string[]) => {
        if (opts.removeError) return Promise.resolve({ error: { message: 'remove failed' } });
        return Promise.resolve({ error: null });
      }),
    })),
  };

  return {
    admin: { storage: storageMock },
  } as unknown as SupabaseService;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StorageService.createUploadUrl', () => {
  it('throws BadRequestException for an invalid bucket', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    await expect(
      svc.createUploadUrl({ bucket: 'malicious' as AllowedBucket, filename: 'photo.jpg' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns signed upload URL with the correct shape', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createUploadUrl({ bucket: 'avatars', filename: 'photo.jpg' }, 'user-1');
    expect(result.bucket).toBe('avatars');
    expect(result.path).toMatch(/^user-1\//);
    expect(result.signed_url).toBe('https://storage/upload-url');
    expect(result.token).toBe('tok-1');
  });

  it('sanitises path-traversal filenames', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createUploadUrl(
      { bucket: 'receipts', filename: '../../etc/passwd' },
      'user-1',
    );
    // The path should only contain the basename
    expect(result.path).not.toContain('..');
    expect(result.path).toMatch(/^user-1\//);
  });

  it('throws InternalServerErrorException when storage returns an error', async () => {
    const supabase = buildSupabase({ uploadError: true });
    const svc = new StorageService(supabase);
    await expect(
      svc.createUploadUrl({ bucket: 'avatars', filename: 'photo.jpg' }, 'user-1'),
    ).rejects.toThrow(InternalServerErrorException);
  });
});

describe('StorageService.createReadUrl', () => {
  it('throws ForbiddenException when path does not belong to the requesting user', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    await expect(
      svc.createReadUrl({ bucket: 'avatars', path: 'other-user/file.jpg' }, 'user-1', false),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows super_admin to read any path', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createReadUrl(
      { bucket: 'avatars', path: 'other-user/file.jpg' },
      'admin',
      true, // isSuperAdmin
    );
    expect(result.signed_url).toBe('https://storage/read-url');
  });

  it('returns signed read URL for owner', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createReadUrl(
      { bucket: 'receipts', path: 'user-1/photo.jpg' },
      'user-1',
      false,
    );
    expect(result.signed_url).toBe('https://storage/read-url');
    expect(result.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('throws InternalServerErrorException when storage returns an error', async () => {
    const supabase = buildSupabase({ readError: true });
    const svc = new StorageService(supabase);
    await expect(
      svc.createReadUrl({ bucket: 'avatars', path: 'user-1/file.jpg' }, 'user-1', false),
    ).rejects.toThrow(InternalServerErrorException);
  });
});

describe('StorageService.delete', () => {
  it('throws ForbiddenException when non-admin tries to delete another user\'s file', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    await expect(
      svc.delete('avatars', 'other/file.jpg', 'user-1', false),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deletes the object when caller owns it', async () => {
    const storageSpy = buildSupabase({});
    const svc = new StorageService(storageSpy);
    await expect(svc.delete('avatars', 'user-1/file.jpg', 'user-1', false)).resolves.toBeUndefined();
  });

  it('throws InternalServerErrorException when remove fails', async () => {
    const supabase = buildSupabase({ removeError: true });
    const svc = new StorageService(supabase);
    await expect(
      svc.delete('payment-proofs', 'user-1/proof.jpg', 'user-1', false),
    ).rejects.toThrow(InternalServerErrorException);
  });
});

describe('StorageService — filename sanitisation (via createUploadUrl)', () => {
  it('sanitises path-traversal filenames (starts with user prefix)', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createUploadUrl({ bucket: 'avatars', filename: '../../secret' }, 'user-1');
    expect(result.path).toMatch(/^user-1\//);
    expect(result.path).not.toContain('..');
  });

  it('preserves normal filenames under user prefix', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createUploadUrl({ bucket: 'avatars', filename: 'photo.jpg' }, 'user-1');
    expect(result.path).toMatch(/^user-1\//);
    expect(result.path).toContain('photo.jpg');
  });

  it('collapses spaces to underscores in filenames', async () => {
    const supabase = buildSupabase({});
    const svc = new StorageService(supabase);
    const result = await svc.createUploadUrl({ bucket: 'avatars', filename: 'file with spaces.png' }, 'user-1');
    expect(result.path).toMatch(/file_with_spaces\.png$/);
  });
});
