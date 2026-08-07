/**
 * Gleason pattern -> ISUP/WHO Grade Group — pure logic (Epstein et al. 2016,
 * PMID 26492179). Modern reporting uses patterns 3–5 only (patterns 1–2 are
 * no longer assigned per the 2005/2014 ISUP modifications).
 */

export type GleasonPattern = 3 | 4 | 5;

export interface GradeGroupResult {
  gradeGroup: 1 | 2 | 3 | 4 | 5;
  gleasonScore: number;
}

/** Converts a primary + secondary Gleason pattern to its ISUP Grade Group. */
export function gleasonToGradeGroup(primary: GleasonPattern, secondary: GleasonPattern): GradeGroupResult {
  const gleasonScore = primary + secondary;

  let gradeGroup: 1 | 2 | 3 | 4 | 5;
  if (gleasonScore <= 6) {
    gradeGroup = 1;
  } else if (gleasonScore === 7) {
    gradeGroup = primary === 3 ? 2 : 3; // 3+4 -> GG2, 4+3 -> GG3
  } else if (gleasonScore === 8) {
    gradeGroup = 4; // 4+4, 3+5, 5+3
  } else {
    gradeGroup = 5; // 9-10
  }

  return { gradeGroup, gleasonScore };
}
