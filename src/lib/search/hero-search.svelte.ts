/**
 * Whether the big search box of the home hero is on screen. While it is, the header hides its
 * own "Buscar" button so the visitor sees one search at a time; scrolling past the hero brings
 * the header button back.
 *
 * Starts as `true` because the hero sits at the top of the home page: the server render and the
 * first paint already match what the observer reports, so the header button does not flicker.
 * Only the layout reads it, and only on `/`.
 */
export const heroSearch = $state({ visible: true });
