/**
 * ProgressIuran — unit tests
 *
 * A labelled progress bar with a meta row.
 */

import { render, screen } from '@testing-library/react';
import ProgressIuran from './ProgressIuran';

const mockProgress = {
  label: 'Progres Iuran Bulan Ini',
  pct: 50,
  left: '5 dari 10 anggota',
  right: 'Rp 500.000 terkumpul',
};

describe('ProgressIuran', () => {
  it('renders the label text', () => {
    render(<ProgressIuran progress={mockProgress} />);
    expect(screen.getByText('Progres Iuran Bulan Ini')).toBeInTheDocument();
  });

  it('renders the percentage text', () => {
    render(<ProgressIuran progress={mockProgress} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders the left meta text', () => {
    render(<ProgressIuran progress={mockProgress} />);
    expect(screen.getByText('5 dari 10 anggota')).toBeInTheDocument();
  });

  it('renders the right meta text', () => {
    render(<ProgressIuran progress={mockProgress} />);
    expect(screen.getByText('Rp 500.000 terkumpul')).toBeInTheDocument();
  });

  it('sets the progress fill width based on pct', () => {
    const { container } = render(<ProgressIuran progress={mockProgress} />);
    const fill = container.querySelector('.prog-fill');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('renders 0% correctly', () => {
    render(<ProgressIuran progress={{ ...mockProgress, pct: 0 }} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders 100% correctly', () => {
    render(<ProgressIuran progress={{ ...mockProgress, pct: 100 }} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
