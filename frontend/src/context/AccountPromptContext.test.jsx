/**
 * AccountPromptContext — unit tests
 *
 * The context was neutralised in C4: promptRegister is a deliberate no-op.
 * Tests confirm the API shape is stable, the provider renders children,
 * and the no-op guarantee holds.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountPromptProvider, useAccountPrompt } from './AccountPromptContext';

function Consumer() {
  const { promptRegister } = useAccountPrompt();
  return (
    <button type="button" onClick={promptRegister}>
      Prompt
    </button>
  );
}

describe('AccountPromptContext', () => {
  it('renders children inside the provider', () => {
    render(
      <AccountPromptProvider>
        <p>Konten anak</p>
      </AccountPromptProvider>
    );
    expect(screen.getByText('Konten anak')).toBeInTheDocument();
  });

  it('exposes a promptRegister function to consumers', () => {
    const { result } = (() => {
      let ctx;
      function Capture() {
        ctx = useAccountPrompt();
        return null;
      }
      render(
        <AccountPromptProvider>
          <Capture />
        </AccountPromptProvider>
      );
      return { result: ctx };
    })();

    expect(typeof result.promptRegister).toBe('function');
  });

  it('promptRegister is a no-op — calling it does not throw', async () => {
    const user = userEvent.setup();
    render(
      <AccountPromptProvider>
        <Consumer />
      </AccountPromptProvider>
    );

    await expect(user.click(screen.getByRole('button', { name: 'Prompt' }))).resolves.toBeUndefined();
  });

  it('useAccountPrompt falls back gracefully when used outside provider', () => {
    // The hook uses `?? { promptRegister: () => {} }` — should not throw
    function Orphan() {
      const { promptRegister } = useAccountPrompt();
      return <button onClick={promptRegister}>Orphan</button>;
    }
    expect(() => render(<Orphan />)).not.toThrow();
  });

  it('promptRegister returns undefined (truly a no-op)', () => {
    let returnValue = 'sentinel';
    function Capture() {
      const { promptRegister } = useAccountPrompt();
      returnValue = promptRegister();
      return null;
    }
    render(
      <AccountPromptProvider>
        <Capture />
      </AccountPromptProvider>
    );
    expect(returnValue).toBeUndefined();
  });
});
