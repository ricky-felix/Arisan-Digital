import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { usersService } from "../../../services";
import { useUpload } from "../../../hooks/useUpload";
import { UserSingle, Check } from "../../../components/application/v2/icons";
import ScreenHeader from "../../../components/application/v2/ScreenHeader";

const GENDERS = [
  { id: "male", label: "Laki-laki" },
  { id: "female", label: "Perempuan" },
];

export default function EditProfil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, updateProfile } = useAuth();
  const { upload, uploading: uploadingAvatar } = useUpload();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);   // saved avatar URL from backend
  const [avatarPreview, setAvatarPreview] = useState(null); // blob URL for local preview
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [gender, setGender] = useState(null);

  const fileInputRef = useRef(null);

  // ── Load current profile on mount ───────────────────────────────────────────
  // We prefer the fresh GET /users/me response over the cached AuthContext profile
  // so edits from other sessions are reflected without a full re-auth.
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      setLoadingProfile(true);
      try {
        // GET /users/me
        const me = await usersService.getMe();
        if (cancelled) return;
        setName(me.name && me.name !== "Tamu" ? me.name : "");
        setPhone(me.phone ?? "");
        setAvatarUrl(me.avatar_url ?? null);
        setGender(me.gender ?? null);
      } catch (err) {
        if (cancelled) return;
        console.error('[EditProfil] failed to load profile, using auth context fallback:', err.message);
        // Gracefully fall back to AuthContext values
        setName(profile?.name && profile.name !== "Tamu" ? profile.name : "");
        setPhone(profile?.phone ?? "");
        setAvatarUrl(profile?.avatar_url ?? null);
        setGender(profile?.gender ?? null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
      // Revoke the blob preview URL when the component unmounts to avoid memory leaks.
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Avatar file picker ───────────────────────────────────────────────────────
  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show an instant local preview while the upload is in-flight.
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    try {
      // Upload to the 'avatars' bucket via useUpload → storageService.
      const result = await upload(file, { bucket: "avatars" });
      if (!result) {
        // useUpload already set its own error state; surface to user.
        toast("Gagal mengunggah foto — coba lagi", "error");
        return;
      }

      const newAvatarUrl = result.read_url;
      setAvatarUrl(newAvatarUrl);

      // Persist the new avatar URL immediately via PATCH /users/me.
      await usersService.updateMe({ avatar_url: newAvatarUrl });
      // Keep AuthContext in sync.
      await updateProfile({ avatar_url: newAvatarUrl });
      toast("Foto profil diperbarui ✓");
    } catch (err) {
      console.error('[EditProfil] avatar upload/save failed:', err.message);
      toast("Gagal menyimpan foto: " + err.message, "error");
    }
  };

  // ── Save name + phone ────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Nama tidak boleh kosong", "error");
      return;
    }
    setSaving(true);
    try {
      // PATCH /users/me { name, phone, gender, payment_methods }
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
      };
      if (gender) payload.gender = gender;
      await usersService.updateMe(payload);
      // Keep AuthContext in sync.
      await updateProfile({ name: payload.name, phone: payload.phone });
      toast("Profil berhasil diperbarui ✓");
      navigate("/app/profil");
    } catch (err) {
      console.error('[EditProfil] updateMe failed:', err.message);
      toast("Gagal menyimpan profil: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // The avatar to display: local preview > saved URL > null (falls back to icon)
  const displayAvatar = avatarPreview ?? avatarUrl;

  return (
    <div className="v2-screen">
      <div className="v2-inner" style={{ overflowY: "auto" }}>

        {/* ── Sticky header ── */}
        <ScreenHeader title="Edit Profil" onBack={() => navigate("/app/profil")}>
          {loadingProfile ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-primary" aria-hidden="true" />
          ) : (
            <button
              type="submit"
              form="edit-profil-form"
              disabled={saving || uploadingAvatar}
              className="flex h-9 items-center gap-1.5 rounded-[11px] bg-brand-primary px-4 text-[13px] font-bold text-white transition-colors hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={14} strokeWidth={2.5} />
              )}
              Simpan
            </button>
          )}
        </ScreenHeader>

        {/* ── Content column ── */}
        <div className="mx-auto w-full max-w-[480px] px-5 py-6 lg:max-w-[600px] lg:px-6">

          {/* Avatar area */}
          <div className="mb-7 flex flex-col items-center gap-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Pilih foto profil"
              onChange={handleAvatarPick}
            />

            {/* Avatar circle — clickable label triggers the file input */}
            <button
              type="button"
              aria-label="Ganti foto profil"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="relative grid h-24 w-24 place-items-center rounded-full bg-brand-primary-soft text-brand-primary-hover shadow-[0_0_0_3px_var(--color-brand-primary-soft)] disabled:opacity-70"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Foto profil"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserSingle size={38} strokeWidth={1.5} />
              )}

              {/* Upload spinner overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                  <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                </div>
              )}

              {/* Camera icon badge */}
              <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-brand-primary text-white shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>

            <p className="text-[12px] font-medium text-ink-3">
              {uploadingAvatar ? "Mengunggah foto…" : "Ketuk untuk ganti foto profil"}
            </p>
          </div>

          {/* Form card */}
          <form id="edit-profil-form" onSubmit={handleSave}>
            <div className="overflow-hidden rounded-card bg-surface shadow-card">

              {/* Name field */}
              <div className="px-4 py-4">
                <label htmlFor="edit-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3">
                  Nama
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  maxLength={60}
                  autoComplete="name"
                  className="v2-input"
                />
              </div>

              <div className="h-px bg-line-soft" />

              {/* Phone field */}
              <div className="px-4 py-4">
                <label htmlFor="edit-phone" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3">
                  Nomor HP
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  maxLength={20}
                  autoComplete="tel"
                  className="v2-input"
                />
                <p className="mt-2 text-[11px] font-medium text-ink-3">
                  Nomor HP hanya terlihat oleh admin grup kamu.
                </p>
              </div>

            </div>

            {/* Gender card */}
            <div className="mt-5 overflow-hidden rounded-card bg-surface shadow-card">
              <div className="px-4 py-4">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3">
                  Jenis Kelamin
                </p>
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={gender === g.id}
                      onClick={() => setGender((cur) => (cur === g.id ? null : g.id))}
                      className={`flex-1 rounded-[12px] px-3 py-2.5 text-[13px] font-bold transition-colors ${
                        gender === g.id
                          ? "bg-brand-primary text-white"
                          : "bg-gray-soft text-ink-2 hover:bg-line"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>


          </form>

          {/* Info note */}
          <p className="mt-5 text-center text-[11px] font-medium leading-relaxed text-ink-3">
            Perubahan nama akan terlihat oleh semua anggota grup yang kamu ikuti.
          </p>
        </div>

      </div>
    </div>
  );
}
