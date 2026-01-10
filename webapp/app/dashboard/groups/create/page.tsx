/**
 * Create Group Page
 *
 * Multi-step wizard for creating a new arisan group.
 * Steps: 1) Group details, 2) Preview, 3) Invite members
 */

import * as React from 'react';
import type { Metadata } from 'next';
import { CreateGroupWizard } from './create-group-wizard';

export const metadata: Metadata = {
  title: 'Buat Arisan Baru',
  description: 'Buat arisan baru dan undang teman-teman',
};

export default function CreateGroupPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Buat Arisan Baru
        </h1>
        <p className="text-neutral-600">
          Atur detail arisan dan mulai patungan bareng teman-teman
        </p>
      </div>

      {/* Wizard */}
      <CreateGroupWizard />
    </div>
  );
}
