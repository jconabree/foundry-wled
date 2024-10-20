import settings from './settings.js';
import actor from './actor.js';
import initiative from './initiative.js';

Hooks.once('init', async function() {
    settings.init();
});

Hooks.once('ready', async function() {
    actor.init();
    initiative.init();
});
