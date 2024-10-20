import settings from './settings.js';
import actor from './actor.js';
import encounter from './encounter.js';

Hooks.once('init', async function() {
    settings.init();
});

Hooks.once('ready', async function() {
    actor.init();
    encounter.init();
});
