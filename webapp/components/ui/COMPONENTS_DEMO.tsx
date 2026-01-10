/**
 * UI Components Demo
 *
 * This file demonstrates all the shadcn/ui components with Gen Z customization
 * for Arisan Digital. Use this as a reference for implementing components
 * throughout the application.
 *
 * All components follow these principles:
 * - Emerald green (#10B981) as primary color
 * - Minimum 48px touch targets for mobile
 * - Rounded corners for friendly Gen Z aesthetic
 * - Proper TypeScript types
 * - Accessibility (WCAG 2.1 AA)
 */

'use client';

import { Button } from './button';
import { Input } from './input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Badge } from './badge';
import { Avatar, AvatarFallback } from './avatar';

export default function ComponentsDemo() {
  return (
    <div className="container mx-auto py-12 space-y-12 max-w-5xl">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Arisan Digital UI Components
        </h1>
        <p className="text-lg text-gray-600">
          Shadcn/ui components customized with Gen Z aesthetic and emerald green theme
        </p>
      </div>

      {/* Button Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Button Component</h2>
          <p className="text-gray-600">
            Fully customizable button with multiple variants and sizes. All buttons meet
            minimum 48px touch target requirement.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              Seven variants: default, secondary, outline, ghost, destructive, link, and
              casual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button variant="casual">Casual (Gen Z)</Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Disabled State</h4>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled Button</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { Button } from '@/components/ui/button';

// Default button
<Button>Click me</Button>

// Casual variant (Gen Z style)
<Button variant="casual">Join Arisan</Button>

// Outline with different size
<Button variant="outline" size="lg">
  Explore Groups
</Button>

// Disabled state
<Button disabled>Loading...</Button>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Input Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Input Component</h2>
          <p className="text-gray-600">
            Clean and friendly input with emerald focus ring and error states. Supports
            Indonesian placeholders.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Input States</CardTitle>
            <CardDescription>
              Normal, focused, error, and disabled states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Normal Input
              </label>
              <Input placeholder="Masukkan nama Anda" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input with Value
              </label>
              <Input defaultValue="Ahmad Rizki" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error State
              </label>
              <Input
                error
                errorMessage="Nomor HP harus diisi"
                placeholder="08123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disabled Input
              </label>
              <Input disabled placeholder="Tidak dapat diubah" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Input
              </label>
              <Input type="email" placeholder="email@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Input
              </label>
              <Input type="password" placeholder="Kata sandi minimal 8 karakter" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { Input } from '@/components/ui/input';

// Basic input with Indonesian placeholder
<Input placeholder="Masukkan nama Anda" />

// Input with error state
<Input
  error
  errorMessage="Nomor HP harus diisi"
  placeholder="08123456789"
/>

// Email input
<Input type="email" placeholder="email@example.com" />

// Disabled input
<Input disabled placeholder="Tidak dapat diubah" />`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Card Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Card Component</h2>
          <p className="text-gray-600">
            Flexible card component with soft shadows and rounded corners. Includes
            header, title, description, content, and footer subcomponents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>
                A basic card with header and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This is the content of the card. It can contain any content like text,
                images, or other components.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
              <CardDescription>
                Includes action buttons in footer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This card demonstrates how to add a footer with action buttons.
              </p>
            </CardContent>
            <CardFooter className="gap-3">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button size="sm">Confirm</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arisan Group</CardTitle>
              <CardDescription>Monthly contribution: Rp 100.000</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Members</span>
                <span className="font-semibold">10/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="success">Aktif</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="casual">
                Lihat Detail
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Ahmad Rizki</CardTitle>
                  <CardDescription>Group Admin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Total contribution: Rp 1.200.000
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Optional description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Badge Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Badge Component</h2>
          <p className="text-gray-600">
            Small, pill-shaped badges for status indicators, tags, and labels. Fully
            emoji-friendly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
            <CardDescription>
              Multiple color variants for different use cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="casual">Casual</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Semantic Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">With Emoji</h4>
              <div className="flex flex-wrap gap-3">
                <Badge>✨ New</Badge>
                <Badge variant="success">✅ Aktif</Badge>
                <Badge variant="warning">⏰ Pending</Badge>
                <Badge variant="destructive">🚫 Ditolak</Badge>
                <Badge variant="info">📊 Analytics</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Real-world Examples</h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Lunas</Badge>
                <Badge variant="warning">Menunggu Pembayaran</Badge>
                <Badge variant="destructive">Terlambat</Badge>
                <Badge variant="secondary">10/10 Members</Badge>
                <Badge variant="outline">Mingguan</Badge>
                <Badge variant="casual">🎉 Jackpot Winner</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { Badge } from '@/components/ui/badge';

// Basic badges
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>

// Semantic badges
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Destructive</Badge>

// With emoji
<Badge variant="success">✅ Aktif</Badge>
<Badge variant="casual">🎉 Winner</Badge>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Avatar Component */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Avatar Component</h2>
          <p className="text-gray-600">
            Circular avatar component with image support and fallback with initials.
            Multiple sizes available.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avatar Examples</CardTitle>
            <CardDescription>
              Images with fallbacks and different sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">With Fallbacks</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar>
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>SN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>DW</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>RP</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Different Sizes</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">SM</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">LG</AvatarFallback>
                </Avatar>
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">XL</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">
                In Context (Member List)
              </h4>
              <div className="space-y-3">
                {[
                  { name: 'Ahmad Rizki', role: 'Admin' },
                  { name: 'Siti Nurhaliza', role: 'Member' },
                  { name: 'Dewi Putri', role: 'Member' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

// In member list
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarFallback>AR</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-medium">Ahmad Rizki</p>
    <p className="text-sm text-gray-600">Admin</p>
  </div>
</div>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Complete Example */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Complete Example: Arisan Group Card
          </h2>
          <p className="text-gray-600">
            A real-world example combining multiple components
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Arisan Kantor 2026</CardTitle>
                <CardDescription>Monthly contribution: Rp 500.000</CardDescription>
              </div>
              <Badge variant="success">✅ Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-lg font-semibold">10/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pool</p>
                <p className="text-lg font-semibold">Rp 5.000.000</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Frequency</p>
                <Badge variant="outline">Bulanan</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Draw</p>
                <p className="text-sm font-medium">15 Jan 2026</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Recent Members</p>
              <div className="flex -space-x-2">
                {['AR', 'SN', 'DW', 'RP', 'MA'].map((initials, i) => (
                  <Avatar key={i} className="ring-2 ring-white">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 ring-2 ring-white text-xs font-semibold text-gray-600">
                  +5
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button variant="outline" className="flex-1">
              Share
            </Button>
            <Button variant="casual" className="flex-1">
              Join Group
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>Arisan Kantor 2026</CardTitle>
        <CardDescription>
          Monthly contribution: Rp 500.000
        </CardDescription>
      </div>
      <Badge variant="success">✅ Aktif</Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Members</p>
        <p className="text-lg font-semibold">10/10</p>
      </div>
      {/* More stats... */}
    </div>

    {/* Member avatars */}
    <div className="flex -space-x-2">
      <Avatar className="ring-2 ring-white">
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      {/* More avatars... */}
    </div>
  </CardContent>
  <CardFooter className="gap-3">
    <Button variant="outline" className="flex-1">
      Share
    </Button>
    <Button variant="casual" className="flex-1">
      Join Group
    </Button>
  </CardFooter>
</Card>`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Best Practices</h2>
          <p className="text-gray-600">
            Guidelines for using these components effectively
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Component Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Touch Targets</h4>
              <p className="text-sm text-gray-600">
                All interactive elements (buttons, inputs) have a minimum height of 48px
                for comfortable mobile interaction.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Color Consistency</h4>
              <p className="text-sm text-gray-600">
                Use the emerald green primary color (#10B981) for CTAs and important
                actions. Use the casual variant for extra emphasis on playful features.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Typography</h4>
              <p className="text-sm text-gray-600">
                Follow the Plus Jakarta Sans font family with appropriate weights. Use
                semibold (600) for headings and medium (500) for body text.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Spacing</h4>
              <p className="text-sm text-gray-600">
                Maintain consistent spacing using Tailwind's spacing scale. Cards use p-6
                padding, and components are spaced with gap-3 or gap-4.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">5. Accessibility</h4>
              <p className="text-sm text-gray-600">
                Always provide proper labels for inputs, use semantic HTML, and ensure
                sufficient color contrast (4.5:1 for normal text).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">6. Indonesian Content</h4>
              <p className="text-sm text-gray-600">
                Use Indonesian language for all user-facing text. Placeholders should be
                friendly and conversational (e.g., "Masukkan nama Anda" instead of "Name").
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">7. Emoji Usage</h4>
              <p className="text-sm text-gray-600">
                Emojis are encouraged for Gen Z appeal. Use them in badges, buttons, and
                card titles to add personality (e.g., ✨, 🎉, ✅, 💰).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
