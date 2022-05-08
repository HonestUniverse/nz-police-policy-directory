// This component is split across several modules to allow the initialisation
// code to be minimal, so it can run as the page loads with minimal blocking.

export { applyColourScheme, recallColourScheme } from './init-colour-scheme.js';
export { rememberColourScheme } from './remember-colour-scheme.js';
