import { describe, expect, it } from 'vitest';
import { greetingFor, initialsOf } from './homeText';

describe('home header text', () => {
  it('greets by time of day', () => {
    expect(greetingFor(6)).toBe('Good morning');
    expect(greetingFor(13)).toBe('Good afternoon');
    expect(greetingFor(21)).toBe('Good evening');
    expect(greetingFor(2)).toBe('Good evening');
  });

  it('takes first and last initials and skips a title', () => {
    expect(initialsOf('Dr Ghaleb Al-Mekhlafi')).toBe('GA');
    expect(initialsOf('Dr. Sara')).toBe('S');
    expect(initialsOf('  ghaleb  ')).toBe('G');
    expect(initialsOf('غالب المخلافي')).toBe('غا');
    expect(initialsOf('')).toBe('');
  });
});
