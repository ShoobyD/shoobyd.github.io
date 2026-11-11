/**
 * UI strings and language helpers.
 * Hebrew is the default locale (served at `/`); English will live under `/en/`.
 * English strings are filled in so the layout can already be checked in LTR,
 * even though no English pages are published yet.
 */

export const languages = {
	he: 'עברית',
	en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'he';

const directions: Record<Lang, 'rtl' | 'ltr'> = {
	he: 'rtl',
	en: 'ltr',
};

export function dirFor(lang: Lang): 'rtl' | 'ltr' {
	return directions[lang];
}

export function isLang(value: string | undefined): value is Lang {
	return !!value && value in languages;
}

export const ui = {
	he: {
		'site.title':       'ברוך מוסטקיס · ShoobyD',
		'site.description': 'ברוך מוסטקיס (ShoobyD), מפתח פרונטאנד בכיר, מתמחה בארכיטקטורה ובהובלה טכנית. מגדל בבל אישי שעוד בבנייה: פרויקטים, ניסיון, תחומי־עניין, יצירה, ומשחק לבנים בפסגה.',
		'share.role':       'מפתח פרונטאנד בכיר · ארכיטקטורה והובלה טכנית',
		'share.imageAlt':   'מגדל בבל שעוד בבנייה, בשמי שחר מעל כפר, ולצדו: ברוך מוסטקיס, מפתח פרונטאנד בכיר.',
		'brand.name':       'ShoobyD',
		'brand.tagline':    'ברוך מוסטקיס',
		'nav.home':         'לעמוד הבית',
		'nav.skip':         'דילוג לתוכן',
		'lang.label':       'EN',
		'lang.aria':        'Switch to English',
		'footer.credit':    'נבנה ועוצב בידי ברוך מוסטקיס',
		'footer.copyright': '© {year} ShoobyD',
	},
	en: {
		'site.title':       'Baruch Mustakis · ShoobyD',
		'site.description': 'Baruch Mustakis (ShoobyD), senior frontend engineer specializing in architecture and technical leadership. A personal Tower of Babel still under construction: projects, experience, interests, creative work, and a brick game at the summit.',
		'share.role':       'Senior Frontend Engineer · Architecture and technical leadership',
		'share.imageAlt':   'A Tower of Babel still under construction, in a dawn sky over a village, and beside it: Baruch Mustakis, senior frontend engineer.',
		'brand.name':       'ShoobyD',
		'brand.tagline':    'Baruch Mustakis',
		'nav.home':         'Home page',
		'nav.skip':         'Skip to content',
		'lang.label':       'עב',
		'lang.aria':        'לעברית',
		'footer.credit':    'Designed and built by Baruch Mustakis',
		'footer.copyright': '© {year} ShoobyD',
	},
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['he'];

export type TemplateVars = Record<string, string | number>;

/** Fills `{name}` placeholders in a template from `vars`; unknown placeholders are left as-is. */
export function interpolate(template: string, vars: TemplateVars = {}): string {
	return template.replace(/\{(\w+)\}/g, (match, name: string) => String(vars[name] ?? match));
}

/** Returns a translator for one language, falling back to the default language per key. */
export function useTranslations(lang: Lang) {
	return function t(key: UiKey, vars?: TemplateVars): string {
		return interpolate(ui[lang][key] ?? ui[defaultLang][key], vars);
	};
}

/** The other language, for the header's language switch. */
export function otherLang(lang: Lang): Lang {
	return lang === 'he' ? 'en' : 'he';
}

