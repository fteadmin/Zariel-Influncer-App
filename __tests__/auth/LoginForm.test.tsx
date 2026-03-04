/**
 * Tests: LoginForm component
 *
 * Covers:
 * 1. Renders all required fields and the submit button
 * 2. Does not call signIn when fields are empty
 * 3. Calls supabase.auth.signInWithPassword with the correct credentials
 * 4. Shows an error alert when Supabase returns an error
 * 5. Calls onSuccess callback after a successful login
 * 6. Disables the submit button while loading
 * 7. "Switch to signup" button triggers the onSwitchToSignup callback
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { supabase } from '@/lib/supabase';

// ── Supabase mock ───────────────────────────────────────────────────────────
// jest.mock is hoisted before ANY variable declarations, so all mock
// functions must be created inside the factory (not from outer scope).
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: jest.fn(),
  },
  supabaseAnonKey: 'test-anon-key',
}));

// Accessor so each test always gets the current mock reference
const mockSignIn = () => supabase.auth.signInWithPassword as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────
const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  email = 'test@example.com',
  password = 'password123'
) => {
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole('button', { name: /log in/i }));
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('LoginForm', () => {
  beforeEach(() => {
    mockSignIn().mockReset();
  });

  // 1. Rendering
  it('renders email field, password field, and submit button', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  // 2. Empty form — HTML required attribute prevents submission
  it('does not call signIn when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockSignIn()).not.toHaveBeenCalled();
  });

  // 3. Correct credentials forwarded to Supabase
  it('calls signInWithPassword with the typed email and password', async () => {
    mockSignIn().mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillAndSubmit(user, 'creator@zariel.co', 'securePass!1');
    expect(mockSignIn()).toHaveBeenCalledWith({
      email: 'creator@zariel.co',
      password: 'securePass!1',
    });
  });

  // 4. Error message displayed on Supabase error
  it('displays an error alert when Supabase returns an error', async () => {
    mockSignIn().mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillAndSubmit(user);
    await waitFor(() =>
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
    );
  });

  // 5. onSuccess callback fired after successful login
  it('calls onSuccess after a successful login', async () => {
    mockSignIn().mockResolvedValueOnce({ error: null });
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<LoginForm onSuccess={onSuccess} />);
    await fillAndSubmit(user);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  // 6. Submit button disabled while loading
  it('disables the submit button while the request is in-flight', async () => {
    mockSignIn().mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pass123');
    // Intentionally not awaited — we assert mid-flight state
    user.click(screen.getByRole('button', { name: /log in/i }));
    // Button label changes to "Logging In..." mid-flight — query by type
    await waitFor(() => {
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn).toBeDisabled();
    });
  });

  // 7. Switch-to-signup link
  it('calls onSwitchToSignup when the switch link is clicked', async () => {
    const onSwitch = jest.fn();
    const user = userEvent.setup();
    render(<LoginForm onSwitchToSignup={onSwitch} />);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
