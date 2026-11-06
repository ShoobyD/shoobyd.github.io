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
	base: { title: string; lead: string; hint: string };
	/** `doorHint`, like `making.stringsHint`, is shown only while the 3D tower is on screen. */
	code: { title: string; lead: string; doorHint: string; status: Record<ProjectStatus, string> };
	math: { title: string; lead: string; aside: string };
	languages: { title: string; quote: string; cite: string; topics: string[]; latin: string; latinLink: string };
	making: { title: string; guitar: string; drawing: string; drawingLink: string; cooking: string; diy: string; stringsHint: string };
	/** `babel`: the languages the heading passes through before it settles (the summit joke). */
	summit: { title: string; wink: string; babel: string[]; contacts: { linkedin: string; email: string; github: string; cv: string } };
}

export const home: Record<Lang, HomeCopy> = {
	he: {
		loader: 'מניחים לבנים…',
		gauge: {
			label: 'קומות המגדל',
			unit: 'אמות',
			tiers: { base: 'יסוד', code: 'קוד', math: 'מתמטיקה', languages: 'שפות', making: 'יצירה', summit: 'פסגה' },
		},
		base: {
			title: 'ברוך מוסטקיס',
			lead: 'מפתח־ווב, מתמטיקאי בהכשרתו. טפסו למעלה.',
			hint: 'גללו כדי לטפס',
		},
		code: {
			title: 'קוד',
			lead: 'כל פתח מואר בקיר הוא פרויקט.',
			doorHint: 'רחפו מעל פתח, והוא נדלק.',
			status: { live: 'חי', archive: 'ארכיון', closed: 'סגור' },
		},
		math: {
			title: 'מתמטיקה ופיזיקה',
			lead: 'תואר B.Sc. במתמטיקה עיונית, בהצטיינות, לצד לימודי השלמה במדעי המחשב.',
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
		},
		summit: {
			title: 'בואו נדבר',
			wink: 'הפסגה עדיין בבנייה. זהירות: מעל גובה מסוים השפות מתחילות להתבלבל.',
			babel: ['Loquamur', '我们聊聊吧', 'Ας μιλήσουμε', "Let's talk"],
			contacts: { linkedin: 'לינקדאין', email: 'אימייל', github: 'גיטהאב', cv: 'קורות־חיים' },
		},
	},
	en: {
		loader: 'Laying bricks…',
		gauge: {
			label: 'Tower tiers',
			unit: 'cubits',
			tiers: { base: 'Base', code: 'Code', math: 'Math', languages: 'Languages', making: 'Making', summit: 'Summit' },
		},
		base: {
			title: 'Baruch Mustakis',
			lead: 'Web developer, mathematician by training. Climb up.',
			hint: 'Scroll to climb',
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
		},
		summit: {
			title: "Let's talk",
			wink: 'The summit is still under construction. Careful: above a certain altitude, languages start to get confused.',
			babel: ['Loquamur', '我们聊聊吧', 'Ας μιλήσουμε', 'בואו נדבר'],
			contacts: { linkedin: 'LinkedIn', email: 'Email', github: 'GitHub', cv: 'CV' },
		},
	},
};

export const links = {
	latinCourse: 'http://bit.ly/latincourse',
	drawMeGroup: 'https://www.facebook.com/groups/tzayruoti/',
	linkedin: 'https://www.linkedin.com/in/ShoobyD/',
	email: 'mailto:bmusty@gmail.com',
	github: 'https://github.com/ShoobyD',
	cv: '/assets/files/Curriculum%20Vitae.pdf',
} as const;

