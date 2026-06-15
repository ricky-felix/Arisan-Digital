/**
 * GroupLabel — unit tests
 *
 * Date-group separator pill for the notification feed.
 */

import { render, screen } from '@testing-library/react';
import GroupLabel from './GroupLabel';

describe('GroupLabel', () => {
  it('renders children text inside the pill', () => {
    render(<GroupLabel>Hari Ini</GroupLabel>);
    expect(screen.getByText('Hari Ini')).toBeInTheDocument();
  });

  it('applies the group-label class by default (spaced=false)', () => {
    const { container } = render(<GroupLabel>Kemarin</GroupLabel>);
    expect(container.firstChild.className).toBe('group-label');
  });

  it('applies "group-label spaced" when spaced=true', () => {
    const { container } = render(<GroupLabel spaced={true}>Minggu Lalu</GroupLabel>);
    expect(container.firstChild.className).toBe('group-label spaced');
  });

  it('renders the optional icon before children', () => {
    render(
      <GroupLabel icon={<span data-testid="clock-icon" />}>Besok</GroupLabel>
    );
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByText('Besok')).toBeInTheDocument();
  });

  it('renders correctly without an icon', () => {
    expect(() => render(<GroupLabel>No icon</GroupLabel>)).not.toThrow();
  });

  it('renders the group-pill wrapper div', () => {
    const { container } = render(<GroupLabel>Label</GroupLabel>);
    expect(container.querySelector('.group-pill')).toBeInTheDocument();
  });
});
