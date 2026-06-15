/**
 * NotifBubble — unit tests
 *
 * A simple structural wrapper for notification rows.
 */

import { render, screen } from '@testing-library/react';
import NotifBubble from './NotifBubble';

describe('NotifBubble', () => {
  it('renders children in the bub-body element', () => {
    render(
      <NotifBubble side="incoming" avatar="BS">
        <span>Iuran jatuh tempo</span>
      </NotifBubble>
    );
    expect(screen.getByText('Iuran jatuh tempo')).toBeInTheDocument();
  });

  it('applies the correct side class for incoming', () => {
    const { container } = render(
      <NotifBubble side="incoming" avatar="BS">Content</NotifBubble>
    );
    expect(container.firstChild.className).toContain('incoming');
  });

  it('applies the correct side class for outgoing', () => {
    const { container } = render(
      <NotifBubble side="outgoing">Content</NotifBubble>
    );
    expect(container.firstChild.className).toContain('outgoing');
  });

  it('renders the avatar for incoming side', () => {
    render(
      <NotifBubble side="incoming" avatar="BS">Content</NotifBubble>
    );
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('does NOT render the avatar element for outgoing side', () => {
    render(
      <NotifBubble side="outgoing" avatar="BS">Content</NotifBubble>
    );
    // Avatar text should not appear in outgoing bubbles
    expect(screen.queryByText('BS')).not.toBeInTheDocument();
  });

  it('renders a JSX node as avatar', () => {
    render(
      <NotifBubble side="incoming" avatar={<span data-testid="icon-node" />}>
        Content
      </NotifBubble>
    );
    expect(screen.getByTestId('icon-node')).toBeInTheDocument();
  });

  it('renders JSX children (not just text)', () => {
    render(
      <NotifBubble side="incoming" avatar="X">
        <strong>Bold notification</strong>
      </NotifBubble>
    );
    expect(screen.getByText('Bold notification')).toBeInTheDocument();
  });

  it('renders without avatar when not provided for outgoing', () => {
    expect(() =>
      render(<NotifBubble side="outgoing">Safe</NotifBubble>)
    ).not.toThrow();
  });
});
