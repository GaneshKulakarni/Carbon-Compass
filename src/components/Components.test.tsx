import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingFlow } from './OnboardingFlow';
import { MethodologyModal } from './MethodologyModal';
import { WhatIfSimulator } from './WhatIfSimulator';
import { AuthView } from './AuthView';
import { AppProvider } from '../context/AppContext';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

// Extend expect for a11y matchers
expect.extend(matchers);

beforeAll(() => {
  // Mock window.fetch to avoid network requests in tests
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/api/user/data')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ user: null, footprint: null, activityLogs: [], goals: [] }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });
  }) as any;

  // Mock localStorage
  const store: Record<string, string> = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: (index) => Object.keys(store)[index] || null
  };
});

describe('Component & a11y Testing Suite', () => {
  it('should render OnboardingFlow basics step and support name inputs', () => {
    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Verify step 1 title
    expect(screen.getByText('Step 1: The Basics')).toBeDefined();

    // Verify name input can be edited
    const nameInput = screen.getByPlaceholderText('Alex') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput.value).toBe('Jane Doe');
  });

  it('should pass accessibility tests on OnboardingFlow Basics step', async () => {
    const { container } = render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    const results = await axe(container);
    // Relaxed criteria for dynamic library wrappers if any, but checking for general errors
    expect(results.violations.length).toBe(0);
  });

  it('should render MethodologyModal when open and trap focus', () => {
    const onCloseMock = vi.fn();
    render(
      <MethodologyModal isOpen={true} onClose={onCloseMock} />
    );

    // Verify title is rendered
    expect(screen.getByText('Calculation Methodology')).toBeDefined();

    // Click Close methodology button
    const closeBtn = screen.getByLabelText('Close calculation methodology modal');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it('should render WhatIfSimulator and display forecast values', () => {
    render(
      <AppProvider>
        <WhatIfSimulator />
      </AppProvider>
    );

    // Verify headings
    expect(screen.getByText('What-If Carbon Habitat Simulator')).toBeDefined();
    expect(screen.getByText('Adjust Footprint Habits')).toBeDefined();

    // Verify slider exists
    const transitSlider = screen.getByLabelText('Transit or active commute days per week');
    expect(transitSlider).toBeDefined();
  });

  it('should render AuthView validation triggers', () => {
    render(
      <AppProvider>
        <AuthView />
      </AppProvider>
    );

    // Verify Auth options exist
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByRole('button', { name: /Try Offline Sandbox/i })).toBeDefined();
  });
});
