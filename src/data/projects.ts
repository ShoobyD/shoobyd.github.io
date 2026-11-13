/**
 * Projects shown on the home page's "code" tier, as doorways in the tower. Each stands on its own,
 * away from the site (its own repo, its own page), so its card and its doorway open it in a new tab.
 * A project in development has no link yet: its card and its bricked doorway only mark it.
 */
import type { Lang } from '../i18n/ui';

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
	},
	{
		id: 'chinese-vocabulary',
		name: {
			he: 'לימוד סינית',
			en: 'Chinese Vocabulary',
		},
		href: '/chinese-vocabulary/',
		status: 'live',
		description: {
			he: 'אוצר מילים בסינית לדוברי עברית: כרטיסיות ובחנים',
			en: 'Chinese vocabulary for Hebrew speakers: flashcards and quizzes',
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

