/**
 * Words a leaderboard name may not contain. Matching (see `isBanned` in rules.ts) is
 * case-insensitive and ignores dots, hyphens and Hebrew vowel points; words shorter than five
 * letters only match a whole word, longer ones also match inside a word.
 *
 * A short starting list: extend it as needed, and remove anything that slips through with the
 * admin DELETE endpoint (see README.md).
 */
export const BANNED: readonly string[] = [
	// English
	'fuck', 'fucker', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'nazi', 'hitler',
	// Hebrew
	'זין', 'זונה', 'שרמוטה', 'כוסאמא', 'כוסעמק', 'כוסאמק', 'מזדיין', 'לזיין', 'נאצי', 'היטלר',
];

