/**
 * The event sent on `window` once the page's language has changed in place (the language switch
 * patches the page rather than loading the other one): `detail.lang` is the new language. Islands
 * follow `<html lang>` by themselves (./page-lang.ts); this is for the page's plain scripts, so
 * whatever copied text once (the sheets' peeks), sized itself by it (reserved heights, a sheet's
 * peek) or read it once does so again.
 */
import type { Lang } from './ui';

export const LANG_EVENT = 'site:lang';

export interface LangEventDetail {
	lang: Lang;
}

