/**
 * The site's one way of filling placeholders in copy: `{name}` in a text takes `vars.name`, every
 * time it appears ("Image {n} of {total}", "{n} bricks"). A placeholder with no value is left as it
 * is, so a missing one shows rather than vanishing. Plain values only; a link inside a sentence
 * (`{link}`, `{he}`) is split around by the component that renders it.
 */
export type TemplateVars = Record<string, string | number>;

export function interpolate(template: string, vars: TemplateVars): string {
	return template.replace(/\{(\w+)\}/g, (match, name: string) => String(vars[name] ?? match));
}

