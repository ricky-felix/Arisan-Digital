/**
 * MenuSection — unit tests
 *
 * Optional uppercase label + a rounded card wrapping MenuRow items.
 */

import { render, screen } from '@testing-library/react';
import MenuSection from './MenuSection';

describe('MenuSection', () => {
  it('renders the title when provided', () => {
    render(<MenuSection title="Akun"><div>Child</div></MenuSection>);
    expect(screen.getByText('Akun')).toBeInTheDocument();
  });

  it('does NOT render a title element when title is omitted', () => {
    const { container } = render(
      <MenuSection><div>Child</div></MenuSection>
    );
    // Only the container div and the card div should be present as wrappers
    expect(container.querySelector('[class*="uppercase"]')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <MenuSection title="Lainnya">
        <div data-testid="menu-row">Row 1</div>
      </MenuSection>
    );
    expect(screen.getByTestId('menu-row')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <MenuSection title="Pengaturan">
        <div data-testid="row-1">Bahasa</div>
        <div data-testid="row-2">Notifikasi</div>
      </MenuSection>
    );
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
  });

  it('wraps children in the card with expected classes', () => {
    const { container } = render(
      <MenuSection title="Title">
        <div>Child</div>
      </MenuSection>
    );
    const card = container.querySelector('.rounded-card');
    expect(card).toBeInTheDocument();
  });
});
