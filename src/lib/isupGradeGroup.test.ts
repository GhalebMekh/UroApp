import { describe, expect, it } from 'vitest';
import { gleasonToGradeGroup } from './isupGradeGroup';

describe('gleasonToGradeGroup', () => {
  it.each([
    [3, 3, 1, 6],
    [3, 4, 2, 7],
    [4, 3, 3, 7], // same Gleason sum as 3+4, but worse prognosis -> different Grade Group
    [4, 4, 4, 8],
    [3, 5, 4, 8],
    [5, 3, 4, 8],
    [4, 5, 5, 9],
    [5, 4, 5, 9],
    [5, 5, 5, 10],
  ] as const)('Gleason %i+%i -> Grade Group %i (score %i)', (p, s, expectedGG, expectedScore) => {
    const r = gleasonToGradeGroup(p, s);
    expect(r.gradeGroup).toBe(expectedGG);
    expect(r.gleasonScore).toBe(expectedScore);
  });

  it('3+4 and 4+3 share a Gleason score but map to different Grade Groups', () => {
    expect(gleasonToGradeGroup(3, 4).gradeGroup).not.toBe(gleasonToGradeGroup(4, 3).gradeGroup);
  });
});
