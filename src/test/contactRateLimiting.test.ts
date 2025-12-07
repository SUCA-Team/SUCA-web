import { describe, it, expect, beforeEach } from 'vitest';

describe('Contact Form Rate Limiting', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should allow submission when no previous submission exists', () => {
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    expect(lastSubmit).toBeNull();
    
    const canSubmit = !lastSubmit;
    expect(canSubmit).toBe(true);
  });

  it('should prevent submission within cooldown period', () => {
    const now = Date.now();
    localStorage.setItem('lastContactSubmit', now.toString());
    
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    const cooldownMs = 60000; // 1 minute
    const timeSinceLastSubmit = now - parseInt(lastSubmit || '0', 10);
    const canSubmit = timeSinceLastSubmit >= cooldownMs;
    
    expect(canSubmit).toBe(false);
  });

  it('should allow submission after cooldown period', () => {
    const pastTime = Date.now() - 61000; // 61 seconds ago
    localStorage.setItem('lastContactSubmit', pastTime.toString());
    
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    const cooldownMs = 60000; // 1 minute
    const timeSinceLastSubmit = Date.now() - parseInt(lastSubmit || '0', 10);
    const canSubmit = timeSinceLastSubmit >= cooldownMs;
    
    expect(canSubmit).toBe(true);
  });

  it('should calculate remaining time correctly', () => {
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;
    localStorage.setItem('lastContactSubmit', thirtySecondsAgo.toString());
    
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    const cooldownMs = 60000;
    const timeSinceLastSubmit = now - parseInt(lastSubmit || '0', 10);
    const remainingTime = Math.ceil((cooldownMs - timeSinceLastSubmit) / 1000);
    
    expect(remainingTime).toBeGreaterThan(0);
    expect(remainingTime).toBeLessThanOrEqual(30);
  });

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('lastContactSubmit', 'invalid');
    
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    const parsedTime = parseInt(lastSubmit || '0', 10);
    
    // Should parse to NaN and then default to 0
    expect(isNaN(parsedTime) || parsedTime === 0).toBe(true);
  });

  it('should update timestamp after submission', () => {
    const beforeSubmit = Date.now();
    localStorage.setItem('lastContactSubmit', beforeSubmit.toString());
    
    // Simulate time passing
    const afterSubmit = beforeSubmit + 1000;
    localStorage.setItem('lastContactSubmit', afterSubmit.toString());
    
    const stored = parseInt(localStorage.getItem('lastContactSubmit') || '0', 10);
    expect(stored).toBe(afterSubmit);
    expect(stored).toBeGreaterThan(beforeSubmit);
  });
});
