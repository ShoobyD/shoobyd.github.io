/**
 * Home page copy, one entry per tier of the tower (base → summit).
 * Hebrew is published; English is filled in so the page can be checked in LTR
 * and is ready for the bilingual phase.
 */
import type { Lang } from './ui';
import type { ProjectStatus } from '../data/projects';

export const tierIds = ['base', 'code', 'math', 'languages', 'making', 'summit'] as const;
export type TierId = (typeof tierIds)[number];

/** Height of each tier in cubits (אמות), shown on the altitude gauge. */
export const tierAltitude: Record<TierId, number> = {
	base: 0,
	code: 32,
	math: 64,
	languages: 96,
	making: 128,
	summit: 160,
};

interface HomeCopy {
	/** Shown on the full-screen loader while the 3D tower is being prepared. */
	loader: string;
	gauge: { label: string; unit: string; tiers: Record<TierId, string> };
	/** The handle that opens and closes a tier panel on narrow screens (its state is aria-expanded). */
	sheet: { toggle: string };
	/** What shows instead of the page without JavaScript, or when it failed to load. */
	noJs: { title: string; text: string };
	/**
	 * The self-portrait in the base panel: `portraitAlt` describes the drawing, `portraitOpen`
	 * labels the link that enlarges it, `portraitCaption` / `portraitClose` belong to the dialog.
	 */
	/** `leadMore` follows `lead` on the same line, its punchline, kept whole (it doesn't break). */
	base: {
		title: string;
		lead: string;
		leadMore: string;
		hint: string;
		portraitAlt: string;
		portraitOpen: string;
		portraitCaption: string;
		portraitClose: string;
	};
	/** `doorHint`, like `making.stringsHint`, is shown only while the 3D tower is on screen. */
	code: { title: string; lead: string; doorHint: string; status: Record<ProjectStatus, string> };
	math: { title: string; lead: string; aside: string };
	languages: { title: string; quote: string; cite: string; topics: string[]; latin: string; latinLink: string };
	/** `stringsHint` is for a hovering pointer, `stringsHintTouch` for fingers (a sideways swipe). */
	making: { title: string; guitar: string; drawing: string; drawingLink: string; cooking: string; diy: string; stringsHint: string; stringsHintTouch: string };
	/** `babel`: the languages the heading passes through before it settles (the summit joke). */
	/** `contacts` are the main ways to reach him; `alsoOn` / `elsewhere` the lighter row of other profiles under them. */
	summit: {
		title: string;
		wink: string;
		babel: string[];
		contacts: { linkedin: string; email: string; github: string; cv: string };
		alsoOn: string;
		elsewhere: { facebook: string; deviantart: string; wikipedia: string };
		/** The dialog that shows the CV in place. */
		cvView: { title: string; download: string; close: string };
	};
	game: GameCopy;
}

/**
 * Game mode (only while the 3D tower is on screen): `enter` / `exit` label the header toggle,
 * `cue` the label floating over the tower's top on touch screens (a click or tap there starts
 * the game). `{n}` is the brick count, and `{bricks}` the count in words (`brickCount`, see
 * `countBricks`: "one brick" reads better than "1 bricks"). `overNone` replaces `overText` when no
 * brick was laid. `hint` is for a keyboard and pointer, `hintTouch` for fingers. `announce*` are
 * read out by the screen-reader live region only.
 */
export interface GameCopy {
	enter: string;
	exit: string;
	cue: string;
	bricks: string;
	best: string;
	hint: string;
	hintTouch: string;
	perfect: string;
	overTitle: string;
	overText: string;
	overNone: string;
	brickCount: BrickCount;
	again: string;
	secretTitle: string;
	secretBody: string;
	announceStart: string;
	announceScore: string;
	announceBest: string;
	board: BoardCopy;
}

/** A number of bricks in words: `one` for a single brick, `many` (with `{n}`) for any other count. */
export interface BrickCount {
	one: string;
	many: string;
}

/** "one brick" / "12 bricks" (and their Hebrew), for every message that counts bricks. */
export const countBricks = (c: BrickCount, n: number) => (n === 1 ? c.one : c.many.replace('{n}', String(n)));

/**
 * The shared leaderboard on the game-over card, filled in by the game: `{n}` a rank, and the
 * counts of bricks in words (`{min}`, `{score}`, and `shortBy` for how many were missing).
 */
export interface BoardCopy {
	title: string;
	loading: string;
	unavailable: string;
	qualifies: string;
	nameLabel: string;
	namePlaceholder: string;
	submit: string;
	submitting: string;
	yourSpot: string;
	added: string;
	short: string;
	/** The missing bricks after `short`, in a sentence of their own (its verb agrees with the count). */
	shortBy: BrickCount;
	/** Read by screen readers for each row: "{rank}. {name}, {score} bricks". */
	rowLabel: string;
	/** One message per reason the server can refuse a name or a run, plus `network`. */
	errors: Record<
		| 'name_empty'
		| 'name_long'
		| 'name_chars'
		| 'name_banned'
		| 'rate_limited'
		| 'too_fast'
		| 'score_invalid'
		| 'not_on_board'
		| 'network',
		string
	>;
}

export const home: Record<Lang, HomeCopy> = {
	he: {
		loader: 'מניחים לבנים…',
		gauge: {
			label: 'קומות המגדל',
			unit: 'אמות',
			tiers: { base: 'יסוד', code: 'קוד', math: 'מתמטיקה', languages: 'שפות', making: 'יצירה', summit: 'פסגה' },
		},
		sheet: { toggle: 'תוכן הקומה' },
		noJs: {
			title: 'האתר צריך JavaScript',
			text: 'המגדל נבנה כאן בדפדפן, קומה אחר קומה, ובשביל זה הוא צריך JavaScript. הפעילו אותו ורעננו את הדף.',
		},
		base: {
			title: 'ברוך מוסטקיס',
			lead: 'מפתח פרונטאנד בכיר, מתמטיקאי בהכשרתו.',
			leadMore: 'כל השאר – במעלה המגדל.',
			hint: 'גללו כדי לטפס',
			portraitAlt: 'דיוקן עצמי בקווי עט: ברוך יושב מול מחשב, יד על הפנים, ומביט במסך כחול של שגיאה.',
			portraitOpen: 'הגדלת הדיוקן העצמי',
			portraitCaption: 'BSoD: קורה גם לטובים ביותר (דיוקן עצמי)',
			portraitClose: 'סגירה',
		},
		code: {
			title: 'קוד',
			lead: 'כל פתח מואר בקיר הוא פרויקט.',
			doorHint: 'רחפו מעל פתח, והוא נדלק.',
			status: { live: 'חי', archive: 'ארכיון', closed: 'סגור' },
		},
		math: {
			title: 'מתמטיקה ופיזיקה',
			// the LRM after "B.Sc." keeps its final period with it in the Hebrew line (not before the B)
			lead: 'תואר B.Sc.‎ במתמטיקה עיונית, בהצטיינות, לצד לימודי השלמה במדעי המחשב.',
			aside: 'הקומה הזאת עומדת על הוכחות, לא על טיח.',
		},
		languages: {
			title: 'שפות ומיתוס',
			quote: 'וַיְהִי כָל־הָאָרֶץ שָׂפָה אֶחָת וּדְבָרִים אֲחָדִים',
			cite: 'בראשית י״א, א׳',
			topics: ['בלשנות', 'לימוד תנ״ך', 'מיתולוגיה', 'היסטוריה', 'פילוסופיה'],
			latin: 'לימדתי {link} בפורום פרש.',
			latinLink: 'קורס לטינית',
		},
		making: {
			title: 'יצירה',
			guitar: 'גיטרה',
			drawing: 'ציור ואיור, בקבוצת הפייסבוק {link}',
			drawingLink: '„ציירו אותי”',
			cooking: 'בישול',
			diy: 'עשה־זאת־בעצמך',
			stringsHint: 'העבירו את הסמן על פני המיתרים שליד המגדל.',
			stringsHintTouch: 'החליקו לרוחב על המיתרים שליד המגדל.',
		},
		summit: {
			title: 'בואו נדבר',
			wink: 'הפסגה עדיין בבנייה. זהירות: מעל גובה מסוים השפות מתחילות להתבלבל.',
			babel: ['Loquamur', '我们聊聊吧', 'Ας μιλήσουμε', "Let's talk"],
			contacts: { linkedin: 'לינקדאין', email: 'אימייל', github: 'גיטהאב', cv: 'קורות־חיים' },
			alsoOn: 'גם ב:',
			elsewhere: { facebook: 'פייסבוק', deviantart: 'DeviantArt', wikipedia: 'ויקיפדיה' },
			cvView: { title: 'קורות־חיים', download: 'הורדה', close: 'סגירה' },
		},
		game: {
			enter: 'מצב משחק',
			exit: 'חזרה לטיפוס',
			cue: 'לחצו להוספת קומה',
			bricks: 'לבנים',
			best: 'שיא',
			hint: 'לחיצה, נגיעה או רווח מניחים לבנה · Esc ליציאה',
			hintTouch: 'נגיעה מניחה לבנה',
			perfect: 'מושלם!',
			overTitle: 'המגדל קרס',
			overText: 'הנחתם {bricks} לפני שהכול התבלבל.',
			overNone: 'הלבנה הראשונה כבר בלבלה את הכול.',
			brickCount: { one: 'לבנה אחת', many: '{n} לבנים' },
			again: 'עוד סיבוב',
			secretTitle: 'SD-08 · סוד נפתח',
			secretBody: 'שמונה לבנים, ואף אחד עוד לא התחיל לדבר בשפה אחרת. בבל המקורית לא הגיעה לזה.',
			announceStart: 'מצב משחק. לבנה נעה מעל הפסגה; רווח או Enter מניחים אותה, Esc יוצא.',
			announceScore: 'לבנים: {n}',
			announceBest: 'שיא חדש',
			board: {
				title: 'בוני המגדל',
				loading: 'טוענים את הלוח…',
				unavailable: 'הלוח לא זמין כרגע.',
				qualifies: 'נכנסתם לעשרת הראשונים!',
				nameLabel: 'השם שלכם בלוח',
				namePlaceholder: 'עד 20 תווים',
				submit: 'הוספה ללוח',
				submitting: 'מוסיפים…',
				yourSpot: 'המקום שלכם',
				added: 'נוספתם ללוח במקום {n}. המגדל זוכר.',
				short: 'כדי להיכנס ללוח צריך לפחות {min}. {missing}',
				shortBy: { one: 'חסרה לכם לבנה אחת.', many: 'חסרות לכם {n} לבנים.' },
				rowLabel: 'מקום {rank}: {name}, {score}',
				errors: {
					name_empty: 'כתבו שם, ולו של מישהו אחר.',
					name_long: 'עד 20 תווים.',
					name_chars: 'רק אותיות, ספרות ורווחים, ונקודה, מקף או גרש.',
					name_banned: 'השם הזה לא ייחקק במגדל. נסו אחר.',
					rate_limited: 'יותר מדי ניסיונות. נסו שוב בעוד דקה.',
					too_fast: 'התוצאה הזאת לא נראית אפשרית, ולכן לא נשמרה.',
					score_invalid: 'משהו בתוצאה השתבש, והיא לא נשמרה.',
					not_on_board: 'בינתיים מישהו עקף אתכם. הלוח עודכן.',
					network: 'לא הצלחנו להגיע ללוח. נסו שוב.',
				},
			},
		},
	},
	en: {
		loader: 'Laying bricks…',
		gauge: {
			label: 'Tower tiers',
			unit: 'cubits',
			tiers: { base: 'Base', code: 'Code', math: 'Math', languages: 'Languages', making: 'Making', summit: 'Summit' },
		},
		sheet: { toggle: 'Tier content' },
		noJs: {
			title: 'This site needs JavaScript',
			text: 'The tower is built right here in your browser, floor by floor, and for that it needs JavaScript. Turn it on and reload the page.',
		},
		base: {
			title: 'Baruch Mustakis',
			lead: 'Senior frontend engineer, mathematician by training.',
			leadMore: 'Everything else – up the tower.',
			hint: 'Scroll to climb',
			portraitAlt: 'A self-portrait in pen: Baruch at a computer, hand on his face, staring at a blue error screen.',
			portraitOpen: 'Enlarge the self-portrait',
			portraitCaption: 'BSoD: it happens to the best of us (self-portrait)',
			portraitClose: 'Close',
		},
		code: {
			title: 'Code',
			lead: 'Every lit doorway in the wall is a project.',
			doorHint: 'Hover a doorway and it lights up.',
			status: { live: 'Live', archive: 'Archive', closed: 'Closed' },
		},
		math: {
			title: 'Mathematics & Physics',
			lead: 'B.Sc. in pure mathematics, with honors, plus supplementary computer science studies.',
			aside: 'This tier stands on proofs, not plaster.',
		},
		languages: {
			title: 'Languages & Myth',
			quote: 'And the whole earth was of one language, and of one speech.',
			cite: 'Genesis 11:1',
			topics: ['Linguistics', 'Bible study', 'Mythology', 'History', 'Philosophy'],
			latin: 'I taught a {link} on the Fresh forum.',
			latinLink: 'Latin course',
		},
		making: {
			title: 'Making',
			guitar: 'Guitar',
			drawing: 'Drawing & illustration, in the {link} Facebook group',
			drawingLink: '“ציירו אותי” (Draw Me)',
			cooking: 'Cooking',
			diy: 'DIY',
			stringsHint: 'Sweep the pointer across the strings by the tower.',
			stringsHintTouch: 'Swipe sideways across the strings by the tower.',
		},
		summit: {
			title: "Let's talk",
			wink: 'The summit is still under construction. Careful: above a certain altitude, languages start to get confused.',
			babel: ['Loquamur', '我们聊聊吧', 'Ας μιλήσουμε', 'בואו נדבר'],
			contacts: { linkedin: 'LinkedIn', email: 'Email', github: 'GitHub', cv: 'CV' },
			alsoOn: 'Also on:',
			elsewhere: { facebook: 'Facebook', deviantart: 'DeviantArt', wikipedia: 'Wikipedia' },
			cvView: { title: 'CV', download: 'Download', close: 'Close' },
		},
		game: {
			enter: 'Game mode',
			exit: 'Back to the climb',
			cue: 'Tap to add a tier',
			bricks: 'BRICKS',
			best: 'Best',
			hint: 'Click, tap or press Space to drop a brick · Esc to leave',
			hintTouch: 'Tap to drop a brick',
			perfect: 'Perfect!',
			overTitle: 'The tower fell',
			overText: 'You laid {bricks} before everything got confused.',
			overNone: 'The very first brick confused everything.',
			brickCount: { one: 'one brick', many: '{n} bricks' },
			again: 'Again',
			secretTitle: 'SD-08 · Secret unlocked',
			secretBody: "Eight bricks, and nobody's language got scrambled yet. The original Babel never got this far.",
			announceStart: 'Game mode. A brick slides over the summit; Space or Enter drops it, Escape leaves.',
			announceScore: 'Bricks: {n}',
			announceBest: 'New best',
			board: {
				title: 'Tower builders',
				loading: 'Loading the board…',
				unavailable: "The board isn't available right now.",
				qualifies: 'You made the top ten!',
				nameLabel: 'Your name on the board',
				namePlaceholder: 'Up to 20 characters',
				submit: 'Add to the board',
				submitting: 'Adding…',
				yourSpot: 'Your spot',
				added: 'You’re on the board at number {n}. The tower remembers.',
				short: 'The board starts at {min}. {missing}',
				shortBy: { one: 'You were one brick short.', many: 'You were {n} bricks short.' },
				rowLabel: 'Number {rank}: {name}, {score}',
				errors: {
					name_empty: "Write a name, even if it isn't yours.",
					name_long: 'Up to 20 characters.',
					name_chars: 'Only letters, digits and spaces, plus a dot, hyphen or apostrophe.',
					name_banned: "That name won't be carved into the tower. Try another.",
					rate_limited: 'Too many tries. Try again in a minute.',
					too_fast: "That score doesn't look possible, so it wasn't saved.",
					score_invalid: "Something was off with that run, so it wasn't saved.",
					not_on_board: 'Someone overtook you in the meantime. The board is updated.',
					network: "Couldn't reach the board. Try again.",
				},
			},
		},
	},
};

export const links = {
	latinCourse: 'http://bit.ly/latincourse',
	drawMeGroup: 'https://www.facebook.com/groups/tzayruoti/',
	linkedin: 'https://www.linkedin.com/in/ShoobyD/',
	email: 'mailto:bmusty@gmail.com',
	github: 'https://github.com/ShoobyD',
	/** The public CV (no phone number); the full one is kept off the site. */
	cv: '/files/baruch-mustakis-cv.pdf',
	facebook: 'https://www.facebook.com/ShoobyD',
	deviantart: 'https://www.deviantart.com/shoobyd',
	wikipedia: 'https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%AA%D7%9E%D7%A9:ShoobyD',
} as const;

