# Arisan Digital UI Components

Essential shadcn/ui components customized with Gen Z aesthetic and emerald green theme for Arisan Digital.

## Overview

All components follow these design principles:

- **Emerald Green Primary** (#10B981) - Trust, growth, money
- **Mobile-First** - Minimum 48px touch targets
- **Gen Z Aesthetic** - Rounded corners, playful animations, emoji-friendly
- **TypeScript** - Full type safety with proper interfaces
- **Accessibility** - WCAG 2.1 AA compliance
- **Indonesian Support** - Localized for Indonesian users

## Components

### 1. Button (`button.tsx`)

A customizable button component with multiple variants and sizes.

**Variants:**
- `default` - Emerald green primary button
- `secondary` - Light emerald background
- `outline` - Border with emerald accent
- `ghost` - Transparent with hover effect
- `destructive` - Red for dangerous actions
- `link` - Text with underline
- `casual` - **New!** Extra rounded, gradient, playful (Gen Z style)

**Sizes:**
- `sm` - Small (40px height)
- `default` - Default (48px height)
- `lg` - Large (56px height)
- `icon` - Square icon button (48x48px)

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// Casual variant (Gen Z style)
<Button variant="casual">Join Arisan 🎉</Button>

// Different sizes
<Button size="lg">Large Button</Button>
<Button size="icon">🚀</Button>

// Disabled state
<Button disabled>Loading...</Button>
```

**TypeScript:**
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'casual';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

---

### 2. Input (`input.tsx`)

Clean, friendly input component with emerald focus ring and error states.

**Features:**
- Emerald green focus ring
- Error state with custom message
- Indonesian placeholder support
- 48px minimum height for touch
- Proper padding and spacing

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

// Basic input
<Input placeholder="Masukkan nama Anda" />

// With error state
<Input
  error
  errorMessage="Nomor HP harus diisi"
  placeholder="08123456789"
/>

// Different types
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Kata sandi" />

// Disabled
<Input disabled value="Cannot edit" />
```

**TypeScript:**
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}
```

---

### 3. Card (`card.tsx`)

Flexible card component with soft shadows and rounded corners.

**Subcomponents:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text (h3)
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer with actions

**Usage:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Arisan Kantor 2026</CardTitle>
    <CardDescription>
      Monthly contribution: Rp 500.000
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content goes here</p>
  </CardContent>
  <CardFooter className="gap-3">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </CardFooter>
</Card>
```

**Styling:**
- Rounded corners: `rounded-2xl` (16px)
- Shadow: `shadow-md` with hover effect
- White background with border
- Padding: 24px (p-6)

---

### 4. Badge (`badge.tsx`)

Small, pill-shaped badges for status indicators, tags, and labels.

**Variants:**
- `default` - Emerald green
- `secondary` - Light emerald
- `outline` - Border only
- `destructive` - Red for errors
- `success` - Green for success
- `warning` - Amber for warnings
- `info` - Blue for information
- `casual` - Gradient, playful style

**Usage:**
```tsx
import { Badge } from '@/components/ui/badge';

// Basic badges
<Badge>New</Badge>
<Badge variant="success">✅ Aktif</Badge>
<Badge variant="warning">⏰ Pending</Badge>

// With emoji (encouraged!)
<Badge variant="casual">🎉 Winner</Badge>
<Badge>💰 Rp 500.000</Badge>

// Status indicators
<Badge variant="success">Lunas</Badge>
<Badge variant="warning">Menunggu Pembayaran</Badge>
<Badge variant="destructive">Terlambat</Badge>
```

**TypeScript:**
```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'casual';
}
```

---

### 5. Avatar (`avatar.tsx`)

Circular avatar component with image support and fallback with initials.

**Subcomponents:**
- `Avatar` - Main container
- `AvatarImage` - Image element
- `AvatarFallback` - Fallback with initials

**Features:**
- Circular shape with 2px white ring
- Gradient emerald background for fallback
- Multiple sizes supported
- Automatic fallback handling

**Usage:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// With fallback initials
<Avatar>
  <AvatarFallback>AR</AvatarFallback>
</Avatar>

// With image and fallback
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="Ahmad Rizki" />
  <AvatarFallback>AR</AvatarFallback>
</Avatar>

// Custom size
<Avatar className="h-16 w-16">
  <AvatarFallback className="text-lg">AR</AvatarFallback>
</Avatar>

// Member list example
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-medium">Ahmad Rizki</p>
    <p className="text-sm text-gray-600">Admin</p>
  </div>
</div>

// Overlapping avatars
<div className="flex -space-x-2">
  <Avatar className="ring-2 ring-white">
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
  <Avatar className="ring-2 ring-white">
    <AvatarFallback>SN</AvatarFallback>
  </Avatar>
  {/* More avatars... */}
</div>
```

---

## Utility Functions

### `cn()` - Class Name Merger

Located in `lib/utils.ts`, this utility merges class names using `clsx` and `tailwind-merge`.

```tsx
import { cn } from '@/lib/utils';

// Merge classes with conditional logic
<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />

// Tailwind classes are properly merged
cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4'
```

---

## Design System Integration

All components use the design system defined in `tailwind.config.ts`:

### Colors
```tsx
// Primary emerald green
bg-primary-500 // #10B981
text-primary-600
border-primary-500

// Secondary
bg-secondary-600 // #059669

// Accent colors
accent-amber-500 // #F59E0B
accent-coral-500 // #FF6B6B
accent-purple-500 // #9D4EDD
accent-yellow-500 // #FFD93D
```

### Border Radius
```tsx
rounded-xl  // 12px - Inputs
rounded-2xl // 16px - Cards
rounded-3xl // 32px - Extra playful
rounded-full // Pills/badges
```

### Shadows
```tsx
shadow-md // Default card shadow
shadow-lg // Hover state
shadow-primary // Colored shadow for CTAs
```

### Spacing
```tsx
min-h-[48px] // Minimum touch target
p-6 // Card padding
gap-3 // Component spacing
```

---

## CSS Variables

The following CSS variables are defined in `app/globals.css`:

```css
:root {
  --primary: 160 84% 39%;        /* Emerald #10B981 */
  --primary-foreground: 0 0% 100%;
  --secondary: 160 100% 40%;     /* Deeper emerald */
  --accent: 43 96% 56%;          /* Amber */
  --destructive: 0 84.2% 60.2%;  /* Red */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 160 84% 39%;           /* Focus ring */
  --radius: 0.75rem;             /* 12px */
}
```

---

## Best Practices

### 1. Touch Targets
All interactive elements have a minimum height of 48px for comfortable mobile interaction.

```tsx
// ✅ Good - Meets touch target
<Button>Click me</Button> // 48px height

// ❌ Bad - Too small for mobile
<button className="h-8">Click</button> // 32px height
```

### 2. Color Consistency
Use the emerald green primary color for CTAs and important actions.

```tsx
// ✅ Good - Clear primary action
<Button variant="casual">Join Arisan 🎉</Button>

// ✅ Good - Secondary action
<Button variant="outline">Cancel</Button>

// ❌ Bad - Confusing color usage
<Button variant="destructive">Join</Button>
```

### 3. Indonesian Localization
Use Indonesian language for all user-facing text.

```tsx
// ✅ Good - Indonesian, friendly
<Input placeholder="Masukkan nama Anda" />

// ❌ Bad - English
<Input placeholder="Enter your name" />

// ✅ Good - Conversational
<Button>Gabung Sekarang</Button>

// ❌ Bad - Too formal
<Button>Submit</Button>
```

### 4. Emoji Usage
Emojis are encouraged for Gen Z appeal.

```tsx
// ✅ Good - Adds personality
<Badge variant="success">✅ Aktif</Badge>
<Button variant="casual">Join 🎉</Button>
<CardTitle>💰 Total Arisan</CardTitle>

// ⚠️ Use sparingly - Don't overdo it
<Badge>🎉✨💰🚀</Badge> // Too many
```

### 5. Accessibility
Always provide proper labels and semantic HTML.

```tsx
// ✅ Good - Proper label
<label htmlFor="name" className="block text-sm font-medium mb-2">
  Nama Lengkap
</label>
<Input id="name" placeholder="Masukkan nama Anda" />

// ❌ Bad - No label
<Input placeholder="Name" />

// ✅ Good - Error message
<Input
  error
  errorMessage="Nomor HP harus diisi"
  aria-invalid="true"
/>
```

### 6. Spacing
Maintain consistent spacing using Tailwind's spacing scale.

```tsx
// ✅ Good - Consistent spacing
<div className="space-y-6">
  <Card />
  <Card />
</div>

// ✅ Good - Gap utilities
<div className="flex gap-3">
  <Button />
  <Button />
</div>
```

---

## Component Checklist

Before using components in production, ensure:

- [ ] Minimum 48px touch targets for interactive elements
- [ ] Proper TypeScript types and interfaces
- [ ] Indonesian language for all text
- [ ] Accessibility attributes (aria-*, role, etc.)
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Responsive design tested on mobile
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)

---

## Demo Page

View all components in action:

```tsx
import ComponentsDemo from '@/components/ui/COMPONENTS_DEMO';

// In your page
export default function DemoPage() {
  return <ComponentsDemo />;
}
```

Visit `/demo` to see the interactive demo with code examples.

---

## Installation

All required dependencies are already installed:

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.15",
    "tailwindcss-animate": "^1.0.7",
    "@tailwindcss/forms": "^0.5.11"
  }
}
```

---

## Architecture

### File Structure
```
components/ui/
├── avatar.tsx           # Avatar component
├── badge.tsx            # Badge component
├── button.tsx           # Button component
├── card.tsx             # Card components
├── input.tsx            # Input component
├── index.ts             # Barrel export
├── COMPONENTS_DEMO.tsx  # Interactive demo
└── README.md            # This file
```

### Import Pattern
```tsx
// Recommended: Import from barrel
import { Button, Input, Card, Badge, Avatar } from '@/components/ui';

// Also valid: Direct import
import { Button } from '@/components/ui/button';
```

---

## Troubleshooting

### Issue: Styles not applying
**Solution:** Ensure `app/globals.css` is imported in your root layout:
```tsx
import './globals.css';
```

### Issue: TypeScript errors
**Solution:** Check that all types are properly imported:
```tsx
import type { ButtonProps } from '@/components/ui/button';
```

### Issue: Radix UI not working
**Solution:** Add `'use client'` directive for client components:
```tsx
'use client';

import { Avatar } from '@/components/ui/avatar';
```

### Issue: Focus ring not visible
**Solution:** CSS variables must be defined in `globals.css`:
```css
--ring: 160 84% 39%;
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Class Variance Authority](https://cva.style/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Contributing

When adding new components:

1. Follow the existing component structure
2. Use class-variance-authority for variants
3. Include proper TypeScript types
4. Add JSDoc comments
5. Ensure 48px minimum touch targets
6. Test on mobile devices
7. Document usage in this README
8. Add examples to COMPONENTS_DEMO.tsx

---

**Built with ❤️ for Gen Z by the Arisan Digital team**
