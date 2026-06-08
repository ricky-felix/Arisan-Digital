/**
 * MenuRow — unit tests
 *
 * Tests label/sub rendering, danger mode, tile color classes, click handler,
 * and the ChevronRight visibility rules.
 */

// ChevronRight is from icons.jsx — real SVG, no mock needed
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuRow from './MenuRow';

describe('MenuRow', () => {
  it('renders the label', () => {
    render(<MenuRow label="Keamanan & PIN" onClick={() => {}} />);
    expect(screen.getByText('Keamanan & PIN')).toBeInTheDocument();
  });

  it('renders the sub text when provided', () => {
    render(<MenuRow label="Bahasa" sub="Indonesia" onClick={() => {}} />);
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
  });

  it('does not render sub text when omitted', () => {
    render(<MenuRow label="Hanya Label" onClick={() => {}} />);
    // There should be only the label visible, no sub
    expect(screen.queryByText('Indonesia')).not.toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<MenuRow label="Klik Saya" onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is rendered as a button element', () => {
    render(<MenuRow label="Test" onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('danger mode applies red styling to the label', () => {
    render(<MenuRow label="Keluar" danger onClick={() => {}} />);
    const labelEl = screen.getByText('Keluar');
    expect(labelEl.className).toContain('text-error');
  });

  it('danger mode omits the chevron', () => {
    const { container } = render(<MenuRow label="Keluar" danger onClick={() => {}} />);
    // ChevronRight renders as svg; in danger mode it should not exist
    expect(container.querySelector('svg')).toBeNull();
  });

  it('non-danger mode renders the chevron SVG', () => {
    const { container } = render(<MenuRow label="Profil" onClick={() => {}} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders the icon prop inside the tile div', () => {
    render(
      <MenuRow
        label="Test"
        icon={<span data-testid="custom-icon" />}
        tileClass="em"
        onClick={() => {}}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies tileClass "em" styling to the tile container', () => {
    const { container } = render(
      <MenuRow label="Em" tileClass="em" icon={<span />} onClick={() => {}} />
    );
    // The tile div is the first div inside the button
    const tileDiv = container.querySelector('button > div:first-child');
    expect(tileDiv.className).toContain('bg-brand-primary-soft');
  });

  it('applies tileClass "gray" to the tile', () => {
    const { container } = render(
      <MenuRow label="Gray" tileClass="gray" icon={<span />} onClick={() => {}} />
    );
    const tileDiv = container.querySelector('button > div:first-child');
    expect(tileDiv.className).toContain('bg-gray-soft');
  });
});
