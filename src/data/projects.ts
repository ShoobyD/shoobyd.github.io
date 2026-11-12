/**
 * Projects shown on the home page's "code" tier, as doorways in the tower. Each stands on its own,
 * away from the site (its own repo, its own page), so its card and its doorway open it in a new tab.
 * Facts only (see PRODUCT.md → Evidence on Hand); the content phase will extend this list.
 */
import type { Lang } from '../i18n/ui';

export type ProjectStatus = 'live' | 'archive' | 'closed';

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
		id: 'sudoku',
		name: 'Sudoku Solver',
		href: '/sudoku/',
		status: 'live',
		description: {
			he: 'פותר סודוקו',
			en: 'A sudoku solver',
		},
	},
	{
		id: 'balloonz',
		name: 'balloonz',
		href: '/balloonz/',
		status: 'live',
		description: {
			he: 'משחק פיצוץ בלונים שאפשר להטמיע בכל אתר',
			en: 'An embeddable balloon-popping game',
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
	{
		id: 'fresh',
		name: 'Fresh',
		href: '/fresh/',
		status: 'archive',
		description: {
			he: 'תוספי דפדפן, קאונטרים ועיצובים לפורום פרש',
			en: 'Browser add-ons, counters and skins for the Fresh forum',
		},
	},
	{
		id: 'books',
		name: {
			he: 'מערכת הורדת ספרים',
			en: 'Book downloads',
		},
		status: 'closed',
		description: {
			he: 'סגורה לקהל הרחב',
			en: 'A book-download system, closed to the public',
		},
	},
];

export function projectName(project: Project, lang: Lang): string {
	return typeof project.name === 'string' ? project.name : project.name[lang];
}

