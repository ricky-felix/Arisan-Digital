# Quick Reference Guide - Arisan Digital UI Components

## Component Import Cheatsheet

```tsx
// Single line import (recommended)
import { Button, Input, Card, Badge, Avatar } from '@/components/ui';

// Individual imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
```

---

## Button Variants

| Variant | Use Case | Code |
|---------|----------|------|
| **Default** | Primary actions | `<Button>Gabung</Button>` |
| **Secondary** | Secondary actions | `<Button variant="secondary">Lihat</Button>` |
| **Outline** | Tertiary actions | `<Button variant="outline">Batal</Button>` |
| **Ghost** | Minimal emphasis | `<Button variant="ghost">Edit</Button>` |
| **Destructive** | Dangerous actions | `<Button variant="destructive">Hapus</Button>` |
| **Link** | Text links | `<Button variant="link">Selengkapnya</Button>` |
| **Casual** | Gen Z style, CTAs | `<Button variant="casual">Join 🎉</Button>` |

### Button Sizes

| Size | Height | Code |
|------|--------|------|
| **Small** | 40px | `<Button size="sm">Small</Button>` |
| **Default** | 48px | `<Button>Default</Button>` |
| **Large** | 56px | `<Button size="lg">Large</Button>` |
| **Icon** | 48x48px | `<Button size="icon">🚀</Button>` |

---

## Input States

| State | Code |
|-------|------|
| **Normal** | `<Input placeholder="Nama Anda" />` |
| **Error** | `<Input error errorMessage="Wajib diisi" />` |
| **Disabled** | `<Input disabled />` |
| **Email** | `<Input type="email" />` |
| **Password** | `<Input type="password" />` |

---

## Card Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title Here</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Optional footer with actions */}
  </CardFooter>
</Card>
```

---

## Badge Variants

| Variant | Use Case | Code |
|---------|----------|------|
| **Default** | General badges | `<Badge>New</Badge>` |
| **Secondary** | Less emphasis | `<Badge variant="secondary">Info</Badge>` |
| **Outline** | Bordered style | `<Badge variant="outline">Tag</Badge>` |
| **Destructive** | Errors | `<Badge variant="destructive">Error</Badge>` |
| **Success** | Success states | `<Badge variant="success">✅ Aktif</Badge>` |
| **Warning** | Warnings | `<Badge variant="warning">⏰ Pending</Badge>` |
| **Info** | Information | `<Badge variant="info">ℹ️ Info</Badge>` |
| **Casual** | Gen Z style | `<Badge variant="casual">🎉 Winner</Badge>` |

---

## Avatar Usage

```tsx
// With fallback
<Avatar>
  <AvatarFallback>AR</AvatarFallback>
</Avatar>

// With image
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="Name" />
  <AvatarFallback>AR</AvatarFallback>
</Avatar>

// Custom size
<Avatar className="h-16 w-16">
  <AvatarFallback className="text-lg">AR</AvatarFallback>
</Avatar>

// Overlapping avatars
<div className="flex -space-x-2">
  <Avatar className="ring-2 ring-white">
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
  <Avatar className="ring-2 ring-white">
    <AvatarFallback>SN</AvatarFallback>
  </Avatar>
</div>
```

---

## Color Palette

### Primary Colors
```tsx
bg-primary-500      // #10B981 (Emerald)
text-primary-600    // Darker emerald
border-primary-500  // Emerald border
```

### Secondary Colors
```tsx
bg-secondary-600    // #059669 (Deep emerald)
```

### Accent Colors
```tsx
bg-accent-amber-500   // #F59E0B
bg-accent-coral-500   // #FF6B6B
bg-accent-purple-500  // #9D4EDD
bg-accent-yellow-500  // #FFD93D
```

### Semantic Colors
```tsx
bg-success          // Green
bg-warning          // Amber
bg-error            // Red
bg-info             // Blue
```

---

## Common Patterns

### Form Field
```tsx
<div className="space-y-2">
  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
    Nama Lengkap
  </label>
  <Input id="name" placeholder="Masukkan nama Anda" />
</div>
```

### Form Field with Error
```tsx
<div className="space-y-2">
  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
    Nomor HP
  </label>
  <Input
    id="phone"
    error
    errorMessage="Nomor HP harus diisi"
    placeholder="08123456789"
  />
</div>
```

### Card with Actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>Arisan Group</CardTitle>
    <CardDescription>Rp 500.000/month</CardDescription>
  </CardHeader>
  <CardContent>
    <p>10/10 members</p>
  </CardContent>
  <CardFooter className="gap-3">
    <Button variant="outline" className="flex-1">Cancel</Button>
    <Button className="flex-1">Join</Button>
  </CardFooter>
</Card>
```

### Member List Item
```tsx
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-medium text-gray-900">Ahmad Rizki</p>
    <p className="text-sm text-gray-600">Admin</p>
  </div>
  <Badge variant="success" className="ml-auto">✅ Aktif</Badge>
</div>
```

### Status Card
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Payment Status</CardTitle>
      <Badge variant="success">Lunas</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold">Rp 500.000</p>
  </CardContent>
</Card>
```

---

## Spacing Scale

| Class | Value | Use Case |
|-------|-------|----------|
| `gap-2` | 8px | Tight spacing |
| `gap-3` | 12px | Default component spacing |
| `gap-4` | 16px | Comfortable spacing |
| `gap-6` | 24px | Section spacing |
| `p-6` | 24px | Card padding |
| `space-y-4` | 16px | Vertical stack |
| `space-y-6` | 24px | Section stack |

---

## Border Radius

| Class | Value | Use Case |
|-------|-------|----------|
| `rounded-lg` | 8px | Small elements |
| `rounded-xl` | 12px | Inputs, small cards |
| `rounded-2xl` | 16px | Cards |
| `rounded-3xl` | 32px | Casual buttons |
| `rounded-full` | Full | Badges, avatars |

---

## Utility Functions

### Class Name Merger
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />
```

### Currency Formatting
```tsx
import { formatCurrency } from '@/lib/utils';

formatCurrency(500000)           // "Rp 500.000"
formatCurrency(500000.50, true)  // "Rp 500.000,50"
```

### Phone Formatting
```tsx
import { formatPhoneNumber } from '@/lib/utils';

formatPhoneNumber('081234567890')  // "+62 812-3456-7890"
```

### Date Formatting
```tsx
import { formatDateIndonesian, formatRelativeTime } from '@/lib/utils';

formatDateIndonesian('2026-01-08')           // "8 Januari 2026"
formatDateIndonesian('2026-01-08', true)     // "8 Januari 2026, 10:30"
formatRelativeTime(new Date())               // "baru saja"
```

### Initials Generation
```tsx
import { getInitials } from '@/lib/utils';

getInitials('Ahmad Rizki')  // "AR"
getInitials('Siti')         // "SI"
```

---

## Responsive Design

### Breakpoints
```tsx
sm:  640px   // Small devices
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1400px  // Large screens
```

### Mobile-First Example
```tsx
<div className="text-base sm:text-lg md:text-xl lg:text-2xl">
  Responsive Text
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

---

## Accessibility

### Proper Labels
```tsx
// ✅ Good
<label htmlFor="email">Email</label>
<Input id="email" type="email" />

// ❌ Bad
<Input placeholder="Email" />
```

### ARIA Attributes
```tsx
<Input
  aria-label="Search"
  aria-invalid={hasError}
  aria-describedby="error-message"
/>
```

### Focus Management
```tsx
// Focus automatically managed with visible ring
<Button>Focused button gets emerald ring</Button>
```

---

## Common Mistakes to Avoid

### ❌ Don't
```tsx
// Touch target too small
<button className="h-8">Click</button>

// No label
<Input placeholder="Name" />

// English text
<Button>Submit</Button>

// Inconsistent spacing
<div className="gap-1">...</div>
```

### ✅ Do
```tsx
// Proper touch target
<Button>Click</Button>

// With label
<label htmlFor="name">Nama</label>
<Input id="name" placeholder="Masukkan nama" />

// Indonesian text
<Button>Kirim</Button>

// Consistent spacing
<div className="gap-3">...</div>
```

---

## Performance Tips

### Code Splitting
```tsx
// Lazy load demo page
const ComponentsDemo = lazy(() => import('@/components/ui/COMPONENTS_DEMO'));
```

### Memoization
```tsx
const MemoizedCard = memo(({ data }) => (
  <Card>
    {/* ... */}
  </Card>
));
```

### Virtualization for Lists
```tsx
// For long lists of avatars or cards
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Accessibility Testing
```tsx
import { axe } from 'jest-axe';

test('button has no accessibility violations', async () => {
  const { container } = render(<Button>Click</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Emoji Usage Guide

### Recommended Emojis for Arisan Digital

| Context | Emoji | Example |
|---------|-------|---------|
| **Success** | ✅ | `<Badge variant="success">✅ Aktif</Badge>` |
| **Winner** | 🎉 | `<Button variant="casual">Pemenang 🎉</Button>` |
| **Money** | 💰 | `<CardTitle>💰 Total Arisan</CardTitle>` |
| **Warning** | ⏰ | `<Badge variant="warning">⏰ Pending</Badge>` |
| **Error** | 🚫 | `<Badge variant="destructive">🚫 Ditolak</Badge>` |
| **New** | ✨ | `<Badge>✨ Baru</Badge>` |
| **Growth** | 📈 | `<p>📈 Pertumbuhan</p>` |
| **Info** | ℹ️ | `<Badge variant="info">ℹ️ Info</Badge>` |
| **Fire** | 🔥 | `<Badge variant="casual">🔥 Trending</Badge>` |
| **Star** | ⭐ | `<Badge>⭐ Premium</Badge>` |

---

## Indonesian Text Guide

### Common Translations

| English | Indonesian | Context |
|---------|-----------|---------|
| Join | Gabung | CTAs |
| Submit | Kirim | Forms |
| Cancel | Batal | Actions |
| Delete | Hapus | Destructive |
| Edit | Ubah | Edit actions |
| Save | Simpan | Save actions |
| View | Lihat | View details |
| Share | Bagikan | Share actions |
| Next | Selanjutnya | Navigation |
| Back | Kembali | Navigation |
| Loading | Memuat | Loading states |
| Active | Aktif | Status |
| Pending | Menunggu | Status |
| Completed | Selesai | Status |
| Member | Anggota | Groups |
| Admin | Admin | Roles |

---

## File Locations

```
Quick reference locations:
├── Components:         components/ui/*.tsx
├── Utils:             lib/utils.ts
├── Tailwind Config:   tailwind.config.ts
├── Global CSS:        app/globals.css
├── Demo:              components/ui/COMPONENTS_DEMO.tsx
├── Full README:       components/ui/README.md
└── This file:         components/ui/QUICK_REFERENCE.md
```

---

**Last Updated:** January 8, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
