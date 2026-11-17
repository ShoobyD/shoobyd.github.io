/**
 * Projects shown on the home page's "code" tier, as doorways in the tower. Each stands on its own,
 * away from the site (its own repo, its own page), so its card and its doorway open it in a new tab.
 * A project in development has no link yet: its bricked doorway only marks it, and its card opens
 * a gallery of its screenshots (home/ProjectGallery.astro), if it has some.
 */
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';
import giftedHomeDesktop from '../assets/projects/gifted-prep/home-desktop.png';
import giftedHomePhone from '../assets/projects/gifted-prep/home-phone.jpg';
import giftedRiddle from '../assets/projects/gifted-prep/riddle-phone.png';
import giftedSummary from '../assets/projects/gifted-prep/summary-phone.png';
import shopGallery from '../assets/projects/itamar-shop/gallery-desktop.jpg';
import shopDrawing from '../assets/projects/itamar-shop/drawing-desktop.jpg';
import shopHome from '../assets/projects/itamar-shop/home-phone.jpg';
import shopCrop from '../assets/projects/itamar-shop/crop-phone.jpg';
import shopPrice from '../assets/projects/itamar-shop/price-phone.jpg';

/** `dev`: in development and not public yet (it may turn commercial), so it has no link. */
export type ProjectStatus = 'live' | 'archive' | 'dev';

export interface Project {
	id: string;
	/** A proper name shown as-is in both languages, or a per-language name. */
	name: string | Record<Lang, string>;
	/** Omitted for projects that are not public. */
	href?: string;
	status: ProjectStatus;
	description: Record<Lang, string>;
	/** A project in development shows what it is in screenshots: original or generated content only. */
	shots?: Shot[];
	/** A project in development: the desktop screenshot on the sign hung on its bricked doorway. */
	sign?: ImageMetadata;
}

export interface Shot {
	image: ImageMetadata;
	/** What the screenshot shows, for screen readers. */
	alt: Record<Lang, string>;
	/** A short line under it. */
	caption: Record<Lang, string>;
}

export const projects: Project[] = [
	{
		id: 'gifted-prep',
		name: {
			he: 'מחוננים – תרגול',
			en: 'Gifted Prep',
		},
		status: 'dev',
		description: {
			he: 'אפליקציית תרגול למבחן המחוננים, שעובדת גם בלי אינטרנט',
			en: 'A practice app for the gifted screening test, offline too',
		},
		sign: giftedHomeDesktop,
		shots: [
			{
				image: giftedHomeDesktop,
				alt: {
					he: 'העמוד הראשי של האפליקציה במחשב: האלבום של איתמר, 36 מתוך 50 מדבקות, חבילת עשר השאלות של היום, ולשוניות לקריאה, חשבון, מבחנים וחברים.',
					en: "The app's home page on a computer: Itamar's album, 36 of 50 stickers, the day's pack of ten questions, and tabs for reading, math, tests and friends.",
				},
				caption: { he: 'העמוד הראשי: אלבום המדבקות וחבילת השאלות של היום', en: "The home page: the sticker album and the day's pack of questions" },
			},
			{
				image: giftedHomePhone,
				alt: {
					he: 'העמוד הראשי בטלפון: פרגון מחבר על שלושה ימים ברציפות, חבילת השאלות של היום, חזרה על טעות אחת, והמדבקות שנאספו.',
					en: "The home page on a phone: a friend's cheer for three days in a row, the day's pack of questions, one mistake to review, and the stickers collected.",
				},
				caption: { he: 'בטלפון: פרגון מחבר, וחזרה על טעויות', en: "On a phone: a friend's cheer, and the mistakes to go over" },
			},
			{
				image: giftedRiddle,
				alt: {
					he: 'חידת ציורים ברמה הקשה: עוגייה ועוגייה הן 14, עוגייה ותפוח 16, תפוח וכדור 24, וכמה הם שלושתם יחד? התשובה 31 מסומנת נכונה, עם הסבר שלב אחר שלב.',
					en: 'A picture riddle at the hardest level: two cookies make 14, a cookie and an apple 16, an apple and a ball 24; what are all three together? The answer, 31, is marked right, with a step-by-step explanation.',
				},
				caption: { he: 'חידת ציורים ברמה הקשה, והסבר לתשובה', en: 'A picture riddle at the hardest level, with the answer explained' },
			},
			{
				image: giftedSummary,
				alt: {
					he: 'סוף סבב: "משולם, איתמר!", 10 מתוך 10 נכונות, חבילת מדבקות ו־20 כוכבים, וכפתורים לעוד סבב ולאלבום.',
					en: 'The end of a round: "Perfect, Itamar!", 10 of 10 right, a sticker pack and 20 stars, and buttons for another round and the album.',
				},
				caption: { he: 'סוף סבב: כוכבים, ומדבקות לאלבום', en: 'The end of a round: stars, and stickers for the album' },
			},
		],
	},
	{
		id: 'itamar-shop',
		name: {
			he: 'גלריית ציורים לילדים',
			en: "Children's Drawings Gallery",
		},
		status: 'dev',
		description: {
			he: 'חנות שבה הילד מעלה, מתמחר ומסמן מה נמכר',
			en: "A shop where the child uploads, prices and marks what's sold",
		},
		sign: shopGallery,
		// the drawings in these are generated, not Itamar's; the story runs from the visitor's side
		// (the wall, a drawing) to the kid's (his home, hanging a new drawing)
		shots: [
			{
				image: shopGallery,
				alt: {
					he: 'קיר התערוכה במחשב: שמונה ציורים תלויים בסלוטייפ על קיר אבן, עם פתקי מחיר, סימוני "מבצע!" ו"נמכר!" בכתב יד, ושורת סינון לפי תגיות.',
					en: 'The exhibition wall on a computer: eight drawings taped to a stone wall, with price notes, hand-drawn "Sale!" and "Sold!" marks, and a row of tag filters.',
				},
				caption: { he: 'קיר התערוכה: הציורים תלויים על אבן, עם פתקי מחיר', en: 'The exhibition wall: drawings taped to stone, with price notes' },
			},
			{
				image: shopDrawing,
				alt: {
					he: 'עמוד של ציור, "טס לירח": הציור בגדול עם פתק "מבצע!", ולצידו פתק עם המחיר 35 במקום 50, סיפור הציור, התגיות וכפתור "אני רוצה את זה!" לוואטסאפ.',
					en: 'A drawing\'s page, "Flying to the Moon": the drawing large with a "Sale!" note, and beside it a note with the price, 35 instead of 50, its story, its tags and an "I want this!" WhatsApp button.',
				},
				caption: { he: 'עמוד ציור: הפתק, וכפתור ההודעה בוואטסאפ', en: "A drawing's page: its note, and the WhatsApp message button" },
			},
			{
				image: shopHome,
				alt: {
					he: 'האזור של איתמר בטלפון: "היי איתמר! מה עושים היום?", ושלושה פתקים: לתלות ציור חדש, הקיר שלי ותגיות.',
					en: 'Itamar\'s area on a phone: "Hi Itamar! What are we doing today?", and three notes: hang a new drawing, my wall, and tags.',
				},
				caption: { he: 'האזור של הילד: מה עושים היום?', en: "The kid's area: what are we doing today?" },
			},
			{
				image: shopCrop,
				alt: {
					he: 'צילום ציור בטלפון: "מצאתי את הדף!", ארבע הפינות של הדף מזוהות בצילום, ואפשר לגרור כל אחת למקומה.',
					en: 'A drawing photographed on a phone: "I found the paper!", the paper\'s four corners found in the photo, each one draggable into place.',
				},
				caption: { he: 'מוצאים את הדף בצילום ומיישרים אותו', en: 'Finding the paper in the photo and straightening it' },
			},
			{
				image: shopPrice,
				alt: {
					he: 'שלב המחיר בטלפון: "כמה הוא עולה?", 50 שקלים עם כפתורי פלוס ומינוס גדולים, ומתג "מבצע!".',
					en: 'The price step on a phone: "How much is it?", 50 shekels with big plus and minus buttons, and a "Sale!" switch.',
				},
				caption: { he: 'קובעים מחיר, עם פלוס ומינוס גדולים', en: 'Setting the price, with big plus and minus' },
			},
		],
	},
	{
		id: 'hanzi',
		// the app's own name (汉字, the Chinese script), as it brands itself
		name: {
			he: 'Hanzi · לימוד סינית',
			en: 'Hanzi · Learn Chinese',
		},
		href: '/hanzi/',
		status: 'live',
		description: {
			he: 'אוצר מילים וכתב סיני לדוברי עברית, בכרטיסיות ובחנים',
			en: 'Chinese vocabulary and characters for Hebrew speakers, in flashcards and quizzes',
		},
	},
	{
		id: 'doppler',
		name: 'Doppler Simulator',
		// the repo, rather than the simulator itself: its README has the whole story, Radu's review too
		href: 'https://github.com/ShoobyD/doppler-effect-simulator',
		status: 'live',
		description: {
			he: 'סימולטור של אפקט דופלר, עם שינוי צליל אמיתי',
			en: 'A Doppler-effect simulator, with real pitch shift',
		},
	},
	{
		id: 'balloonz',
		name: 'balloonz',
		href: '/balloonz/',
		// a very old project
		status: 'archive',
		description: {
			he: 'משחק פיצוץ בלונים עתיק להטמעה באתרים, שנשמר למזכרת',
			en: 'An ancient embeddable balloon-popping game, kept as a keepsake',
		},
	},
	{
		id: 'icmptunnel',
		name: 'ICMP Tunnel',
		href: 'https://github.com/ShoobyD/icmptunnel',
		status: 'archive',
		description: {
			he: 'מנהרת ICMP, בפייתון',
			en: 'An ICMP tunnel, in Python',
		},
	},
];

export function projectName(project: Project, lang: Lang): string {
	return typeof project.name === 'string' ? project.name : project.name[lang];
}

