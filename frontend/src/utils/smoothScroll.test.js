import { handleAnchorClick, getActiveSection } from './smoothScroll';

// ── Setup jsdom window helpers ────────────────────────────────────────────────

beforeEach(() => {
  // Reset scroll state
  Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  window.scrollTo = vi.fn();
});

afterEach(() => {
  // Clean up any elements added to document.body
  document.body.innerHTML = '';
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

// ── handleAnchorClick ─────────────────────────────────────────────────────────

describe('handleAnchorClick', () => {
  it('calls e.preventDefault()', () => {
    const el = document.createElement('section');
    el.id = 'target';
    el.getBoundingClientRect = () => ({ top: 200 });
    document.body.appendChild(el);

    const event = { preventDefault: vi.fn() };
    handleAnchorClick(event, 'target');
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  it('calls window.scrollTo with calculated offset position', () => {
    const el = document.createElement('section');
    el.id = 'features';
    // getBoundingClientRect.top = 300, pageYOffset = 0, offset = 80
    // expected offsetPosition = 300 + 0 - 80 = 220
    el.getBoundingClientRect = () => ({ top: 300 });
    document.body.appendChild(el);

    window.pageYOffset = 0;

    const event = { preventDefault: vi.fn() };
    handleAnchorClick(event, 'features');

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 220,
      behavior: 'smooth',
    });
  });

  it('accounts for pageYOffset when calculating scroll position', () => {
    const el = document.createElement('section');
    el.id = 'about';
    el.getBoundingClientRect = () => ({ top: 100 });
    document.body.appendChild(el);

    window.pageYOffset = 500;

    const event = { preventDefault: vi.fn() };
    handleAnchorClick(event, 'about');

    // 100 + 500 - 80 = 520
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 520,
      behavior: 'smooth',
    });
  });

  it('does not call window.scrollTo when element is not found', () => {
    const event = { preventDefault: vi.fn() };
    handleAnchorClick(event, 'nonexistent-id');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('calls the optional callback after 300ms', () => {
    vi.useFakeTimers();

    const el = document.createElement('section');
    el.id = 'callback-section';
    el.getBoundingClientRect = () => ({ top: 100 });
    document.body.appendChild(el);

    const callback = vi.fn();
    const event = { preventDefault: vi.fn() };
    handleAnchorClick(event, 'callback-section', callback);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it('does not require a callback (no error when omitted)', () => {
    const el = document.createElement('section');
    el.id = 'no-cb';
    el.getBoundingClientRect = () => ({ top: 50 });
    document.body.appendChild(el);

    const event = { preventDefault: vi.fn() };
    expect(() => handleAnchorClick(event, 'no-cb')).not.toThrow();
  });
});

// ── getActiveSection ──────────────────────────────────────────────────────────

describe('getActiveSection', () => {
  beforeEach(() => {
    // Create three sections at known offsetTop positions
    const s1 = document.createElement('section');
    s1.id = 'beranda';
    Object.defineProperty(s1, 'offsetTop', { value: 0, configurable: true });

    const s2 = document.createElement('section');
    s2.id = 'fitur';
    Object.defineProperty(s2, 'offsetTop', { value: 400, configurable: true });

    const s3 = document.createElement('section');
    s3.id = 'kontak';
    Object.defineProperty(s3, 'offsetTop', { value: 800, configurable: true });

    document.body.appendChild(s1);
    document.body.appendChild(s2);
    document.body.appendChild(s3);
  });

  it('returns the first section when scrollY is 0 (scrollPosition=100 < first section)', () => {
    window.scrollY = 0; // scrollPosition = 100, only "beranda" (offsetTop=0) qualifies
    const active = getActiveSection(['beranda', 'fitur', 'kontak']);
    expect(active).toBe('beranda');
  });

  it('returns the second section when scrolled past it', () => {
    window.scrollY = 350; // scrollPosition = 450, "beranda"(0) and "fitur"(400) both qualify; last wins
    const active = getActiveSection(['beranda', 'fitur', 'kontak']);
    expect(active).toBe('fitur');
  });

  it('returns the last section when scrolled to the bottom', () => {
    window.scrollY = 750; // scrollPosition = 850, all three qualify; last wins
    const active = getActiveSection(['beranda', 'fitur', 'kontak']);
    expect(active).toBe('kontak');
  });

  it('returns the first sectionId when no section is found (empty document)', () => {
    document.body.innerHTML = '';
    const active = getActiveSection(['first', 'second']);
    expect(active).toBe('first');
  });

  it('handles a single section', () => {
    const s = document.createElement('section');
    s.id = 'solo';
    Object.defineProperty(s, 'offsetTop', { value: 0, configurable: true });
    document.body.appendChild(s);

    window.scrollY = 0;
    const active = getActiveSection(['solo']);
    expect(active).toBe('solo');
  });
});
