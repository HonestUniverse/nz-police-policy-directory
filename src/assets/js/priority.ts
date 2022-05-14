// The contents of this script run while the page is loading.
// Therefore it should be kept as short and quick as possible, and only
// script that is necessary to adjust the page as it loads should appear here.

import { initColourScheme } from './colour-scheme/init-colour-scheme.js';

document.body.classList.remove('no-js');

initColourScheme();
