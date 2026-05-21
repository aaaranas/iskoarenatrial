// Sport photo library — maps canonical DB sport names to real photos.
//
// Photos live in public/sport/<folder>/ and are served by Vercel's CDN.
// This is the ONLY place sport-photo paths are defined; every consumer
// imports pickSportPhoto() from here instead of hardcoding /iskolaroXxx.jpg.
//
// DETERMINISTIC SELECTION
//   pickSportPhoto(sport, seed) always returns the same photo for the same
//   (sport, seed) pair. Use match.id as the seed so each match shows a stable
//   sport-specific photo that doesn't change on refresh. Omit seed to get the
//   first photo in the list (useful for section headers or fallbacks).
//
// ADDING PHOTOS
//   Drop new files into public/sport/<folder>/ and add the path to the array
//   below. File extension casing must match the actual filename exactly —
//   Linux (Vercel) is case-sensitive.
//
// NOTE: public/sport/basketball/IMG_4522 (1).JPG is intentionally excluded —
//   spaces and parentheses in URL path segments are unreliable across runtimes.

const SPORT_PHOTOS: Record<string, string[]> = {
  // ── Team sports ─────────────────────────────────────────────────────────
  Basketball: [
    "/sport/basketball/1.JPG",
    "/sport/basketball/IMG_4551.jpg",
    "/sport/basketball/IMG_7166.JPG",
    "/sport/basketball/IMG_7168.JPG",
    "/sport/basketball/20260323-A85CEB32-F829-45A9-97B8-9F833D651BDE-13304-000001B924EDEAD4.jpeg",
    "/sport/basketball/20260323-D8D9D9B8-B4F7-423C-B7E9-DA81E7F51301-10266-00000186A4038012.jpg",
  ],
  Volleyball: [
    "/sport/volleyball/IMG_5987.JPG",
    "/sport/volleyball/IMG_5988.JPG",
    "/sport/volleyball/IMG_5991.JPG",
    "/sport/volleyball/46fc52fa-96cd-4d8c-adce-88e996523ca7.jpg",
    "/sport/volleyball/20260324-00961ED0-8D51-472E-8ABF-889D6AD30070-493-000000153CCCBD4B.jpg",
    "/sport/volleyball/20260324-3F25E628-3659-4947-B136-65586D424F55-493-00000020883402EA.jpg",
    "/sport/volleyball/20260324-4BFDC3DA-EEDC-4093-A356-32B850BE5589-493-0000001560F37552.jpg",
  ],
  Soccer: [
    "/sport/soccer/DSC_5696.jpg",
    "/sport/soccer/DSC_5704.jpg",
    "/sport/soccer/DSC_5748.jpg",
    "/sport/soccer/IMG_5915.JPG",
    "/sport/soccer/IMG_5930.JPG",
    "/sport/soccer/IMG_5932.JPG",
    "/sport/soccer/IMG_5936.JPG",
  ],
  Softball: [
    "/sport/softball/DSC_4865.jpeg",
    "/sport/softball/DSC_4870.jpeg",
    "/sport/softball/DSC_4877.jpeg",
    "/sport/softball/DSC_4943.jpeg",
    "/sport/softball/DSC_5040.jpeg",
    "/sport/softball/DSC_5078.jpeg",
    "/sport/softball/DSC_5185.jpeg",
    "/sport/softball/DSC_5288.jpeg",
    "/sport/softball/DSC_5421.jpeg",
    "/sport/softball/DSC_5596.jpeg",
  ],
  Frisbee: [
    "/sport/frisbee/IMG_1846.JPG",
    "/sport/frisbee/IMG_1853.JPG",
    "/sport/frisbee/IMG_7132.JPG",
    "/sport/frisbee/IMG_7172.JPG",
  ],

  // ── Racquet / individual ─────────────────────────────────────────────────
  Badminton: [
    "/sport/badminton/102_0912.JPG",
  ],
  Pickleball: [
    "/sport/pickleball/IMG_6045.JPG",
    "/sport/pickleball/IMG_6046.JPG",
    "/sport/pickleball/IMG_6047.JPG",
    "/sport/pickleball/IMG_6048.JPG",
    "/sport/pickleball/IMG_6050.JPG",
  ],
  "Table Tennis": [
    "/sport/tabletennis/DSCF0223.jpg",
    "/sport/tabletennis/DSCF0249.jpg",
    "/sport/tabletennis/DSC_3975.jpg",
    "/sport/tabletennis/DSC_4219.jpg",
    "/sport/tabletennis/DSC_4261.jpg",
    "/sport/tabletennis/DSC_4559.jpg",
    "/sport/tabletennis/DSC_4635.jpg",
    "/sport/tabletennis/DSC_4712.jpg",
    "/sport/tabletennis/DSC_4822.jpg",
  ],

  // ── Mind & Culture ───────────────────────────────────────────────────────
  Scrabble: [
    "/sport/scrabble/IMG_1986.jpeg",
    "/sport/scrabble/IMG_1989.jpeg",
  ],
  Cheerdance: [
    "/sport/cheerdance/1.jpg",
    "/sport/cheerdance/2.jpg",
    "/sport/cheerdance/5.jpg",
    "/sport/cheerdance/17.jpg",
    "/sport/cheerdance/27.jpg",
    "/sport/cheerdance/28.jpg",
    "/sport/cheerdance/31.jpg",
    "/sport/cheerdance/32.JPG",
    "/sport/cheerdance/IMG_3513.JPG",
    "/sport/cheerdance/IMG_3555.jpg",
    "/sport/cheerdance/IMG_3570.JPG",
  ],
  Cosplay: [
    "/sport/cosplay/20260304-IMG_4864.jpg",
    "/sport/cosplay/20260304-IMG_4880.jpg",
    "/sport/cosplay/20260304-IMG_4903.jpg",
    "/sport/cosplay/IMG_8308.JPG",
    "/sport/cosplay/IMG_8310.JPG",
  ],
  "Pinoy Games": [
    "/sport/pinoy_games/DSC_6304.jpg",
    "/sport/pinoy_games/DSC_6418.jpg",
    "/sport/pinoy_games/DSC_6448.jpg",
    "/sport/pinoy_games/DSC_6505.jpg",
    "/sport/pinoy_games/35F2BB04-76CC-4950-8B04-693CB0467BD0-597-0000000640AAFEF1.JPG",
  ],
  "Mr. & Ms. Fitness": [
    "/sport/mr&ms_fitness/34.JPG",
    "/sport/mr&ms_fitness/35.JPG",
    "/sport/mr&ms_fitness/36.JPG",
    "/sport/mr&ms_fitness/37.JPG",
    "/sport/mr&ms_fitness/38.JPG",
    "/sport/mr&ms_fitness/39.JPG",
    "/sport/mr&ms_fitness/40.JPG",
    "/sport/mr&ms_fitness/42.JPG",
    "/sport/mr&ms_fitness/DSC_7574.jpg",
    "/sport/mr&ms_fitness/DSC_7653.jpg",
    "/sport/mr&ms_fitness/DSC_7749.jpg",
    "/sport/mr&ms_fitness/DSC_7796.jpg",
    "/sport/mr&ms_fitness/DSC_7911.jpg",
    "/sport/mr&ms_fitness/DSC_7914.jpg",
    "/sport/mr&ms_fitness/DSC_8429.jpg",
    "/sport/mr&ms_fitness/IMG_0332.jpg",
  ],

  // ── Esports ─────────────────────────────────────────────────────────────
  // CODM has its own folder; all other esports share the generic esports folder.
  CODM: [
    "/sport/codm/DSC_6074.jpg",
    "/sport/codm/DSC_6079.jpg",
    "/sport/codm/DSC_6136.jpg",
  ],
  MLBB:           esportsPhotos(),
  Valorant:       esportsPhotos(),
  "Dota 2":       esportsPhotos(),
  "Block Blast":  esportsPhotos(),
  Tetris:         esportsPhotos(),
};

// Separate function to prevent the array literal from being shared by reference
// across multiple sport keys.
function esportsPhotos(): string[] {
  return [
    "/sport/esports/IMG_1869.JPG",
    "/sport/esports/IMG_1870.JPG",
    "/sport/esports/IMG_1872.JPG",
    "/sport/esports/IMG_1873.JPG",
    "/sport/esports/IMG_1923.JPG",
    "/sport/esports/IMG_1926.JPG",
    "/sport/esports/IMG_1927.JPG",
    "/sport/esports/IMG_1936.JPG",
    "/sport/esports/IMG_4448.png",
    "/sport/esports/IMG_8332.JPG",
  ];
}

// Sports without a dedicated photo folder (Chess, Dancesports, Petanque,
// Rubiks Cube, Sudoku) — pickSportPhoto returns null and consumers should
// skip image rendering gracefully.

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns a sport photo path for the given sport, or null if none are
 * available.
 *
 * When `seed` is provided the selection is deterministic — the same
 * (sport, seed) pair always returns the same photo. Pass `match.id` as the
 * seed so each match shows a stable, sport-specific background that does not
 * change between page loads.
 *
 * When `seed` is omitted the first photo in the sport's list is returned.
 */
export function pickSportPhoto(sport: string, seed?: string): string | null {
  const photos = SPORT_PHOTOS[sport];
  if (!photos || photos.length === 0) return null;
  if (!seed) return photos[0];

  // djb2 hash — fast, low collision, deterministic in JS.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return photos[h % photos.length];
}

/** Returns all photo paths for a given sport (useful for galleries). */
export function getSportPhotos(sport: string): string[] {
  return SPORT_PHOTOS[sport] ?? [];
}
