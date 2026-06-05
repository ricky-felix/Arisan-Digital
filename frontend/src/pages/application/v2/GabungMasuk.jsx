import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Camera, Upload, Link, QrJoin, X, Check } from "../../../components/v2/icons";
import { INVITE } from "../../../components/v2/undang/data";

/**
 * GabungMasuk — the in-app "how do you want to join?" entry screen.
 * Three ways in: scan a QR with the camera, upload a QR image, or paste
 * the invite link / code. Any valid entry routes to the group preview
 * (Gabung) where the user confirms and joins.
 *
 * Camera: live preview via getUserMedia, preferring the rear camera on
 * phones (facingMode "environment") and falling back to the default
 * webcam on laptops. QR *decoding* is still mocked for the MVP — capturing
 * resolves to the sample invite — but the camera itself is real.
 */
export default function GabungMasuk() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [value, setValue] = useState("");
  const [scanning, setScanning] = useState(false);

  // Attach the live stream once the <video> is in the DOM.
  useEffect(() => {
    if (scanning && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [scanning]);

  // Always release the camera when leaving the screen.
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  function stopCamera() {
    stopStream();
    setScanning(false);
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Browser ini tidak mendukung kamera — tempel link saja 👇");
      return;
    }
    try {
      // Prefer the rear camera on phones; laptops just use their webcam.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
    } catch (err) {
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        toast("Izin kamera ditolak. Aktifkan di pengaturan browser.");
      } else if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") {
        toast("Kamera tidak ditemukan di perangkat ini.");
      } else {
        toast("Tidak bisa membuka kamera. Coba upload QR atau tempel link.");
      }
    }
  }

  // All entry methods land on the invite preview for this MVP.
  function goToPreview() {
    stopCamera();
    navigate("/app/gabung/preview");
  }

  function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    toast("QR terbaca ✓");
    setTimeout(goToPreview, 400);
  }

  function submitLink() {
    const v = value.trim();
    if (!v) {
      toast("Tempel link atau masukkan kode undangan dulu");
      return;
    }
    toast("Undangan ditemukan ✓");
    setTimeout(goToPreview, 400);
  }

  return (
    <div className="v2-screen v2-join">
      <div className="join-scroll">

        {/* Sticky header — consistent with Undang */}
        <div className="join-nav">
          <button
            type="button"
            className="join-nav-btn"
            onClick={() => { stopCamera(); navigate("/app"); }}
            aria-label="Kembali"
          >
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="join-nav-title">Gabung Arisan / Patungan</span>
        </div>

        <div className="join-col">

          <p className="join-intro">
            Punya undangan dari teman? Scan kode QR-nya, unggah gambarnya, atau tempel
            link undangan untuk melihat grup sebelum bergabung.
          </p>

          {/* Scan QR — live camera preview when active */}
          {scanning ? (
            <div className="join-scan scanning">
              <div className="join-scan-frame">
                <video ref={videoRef} className="join-scan-video" playsInline muted autoPlay />
                <span className="join-corner tl" />
                <span className="join-corner tr" />
                <span className="join-corner bl" />
                <span className="join-corner br" />
                <span className="join-scan-line" />
              </div>
              <div className="join-scan-hint">Arahkan kotak ke kode QR undangan</div>
              <div className="join-scan-controls">
                <button type="button" className="join-scan-btn ghost" onClick={stopCamera}>
                  <X size={16} stroke="currentColor" strokeWidth={2.5} />
                  Tutup
                </button>
                <button type="button" className="join-scan-btn solid" onClick={goToPreview}>
                  <Check size={16} stroke="currentColor" strokeWidth={3} />
                  Gunakan QR ini
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="join-scan" onClick={startCamera}>
              <div className="join-scan-frame">
                <span className="join-corner tl" />
                <span className="join-corner tr" />
                <span className="join-corner bl" />
                <span className="join-corner br" />
                <span className="join-scan-line" />
                <QrJoin size={42} stroke="currentColor" strokeWidth={1.6} />
              </div>
              <div className="join-scan-cta">
                <Camera size={18} stroke="white" strokeWidth={2} />
                Scan Kode QR
              </div>
              <div className="join-scan-hint">Buka kamera untuk memindai kode QR undangan</div>
            </button>
          )}

          {/* Upload QR image */}
          <button type="button" className="join-upload" onClick={() => fileRef.current?.click()}>
            <div className="join-upload-icon">
              <Upload size={18} stroke="currentColor" strokeWidth={2} />
            </div>
            <div className="join-upload-text">
              <div className="join-upload-main">Unggah gambar QR</div>
              <div className="join-upload-sub">Pilih screenshot atau foto kode dari galeri</div>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onUpload}
          />

          {/* Divider */}
          <div className="join-divider"><span>atau</span></div>

          {/* Paste link / code */}
          <label className="join-field">
            <span className="join-field-label">Link atau kode undangan</span>
            <div className="join-input-row">
              <Link size={16} stroke="var(--ink-3)" strokeWidth={2} />
              <input
                className="join-input"
                placeholder={INVITE.link}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitLink()}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </label>

          <button type="button" className="join-cta" onClick={submitLink}>
            Lihat Undangan
          </button>

          <div className="join-note">
            Tanpa perlu daftar akun. Kamu bisa melihat detail grup dulu sebelum memutuskan gabung.
          </div>

        </div>
      </div>
    </div>
  );
}
