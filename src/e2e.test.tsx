import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AppProvider } from './context/AppContext';

beforeAll(() => {
  // Mock fetch
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    })
  ) as any;

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

describe('E2E Onboarding Flow Journey Integration', () => {
  it('should traverse landing → step 1 Basics → step 2 Commutes → step 3 Diet → step 4 Goals → step 5 Calculation Baseline summary', async () => {
    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // STEP 1: basics
    expect(screen.getByText('Step 1: The Basics')).toBeDefined();
    const nameInput = screen.getByPlaceholderText('Alex');
    fireEvent.change(nameInput, { target: { value: 'Alex' } });
    
    // Choose lifestyle button (suburban)
    const suburbanBtn = screen.getByText('Suburban Area');
    fireEvent.click(suburbanBtn);

    // Proceed to Step 2
    const proceedBtn = screen.getByRole('button', { name: /Proceed/i });
    fireEvent.click(proceedBtn);

    // STEP 2: Commutes
    await waitFor(() => {
      expect(screen.getByText('Step 2: Commutes & Air Travels')).toBeDefined();
    });
    const transportBtn = screen.getByText('Single Occupant Car (Daily)');
    fireEvent.click(transportBtn);
    
    fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));

    // STEP 3: Diet & Energy
    await waitFor(() => {
      expect(screen.getByText('Step 3: Food & Utility Energy')).toBeDefined();
    });
    const dietBtn = screen.getByText('Vegetarian');
    fireEvent.click(dietBtn);

    fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));

    // STEP 4: Goals & Consumption
    await waitFor(() => {
      expect(screen.getByText('Step 4: Consumption Habits & Core Focus')).toBeDefined();
    });
    const goalBtn = screen.getByText('Cut Emissions');
    fireEvent.click(goalBtn);

    fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));

    // STEP 5: Baseline Ready Summary
    await waitFor(() => {
      expect(screen.getByText('Your Personalized Carbon Baseline Ready!')).toBeDefined();
    });

    // Check that monthly estimate is rendered and ranges are visible
    expect(screen.getByText('Estimated Monthly Carbon Footprint')).toBeDefined();
    expect(screen.getByText(/Scientific Range:/i)).toBeDefined();

    // Check complete dashboard entry CTA
    const completeBtn = screen.getByRole('button', { name: /Enter My Carbon Compass Dashboard/i });
    expect(completeBtn).toBeDefined();
  });
});
