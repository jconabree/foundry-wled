import settings from './settings';
import actor from './actor';
import encounter from './encounter';

Hooks.once('init', async function() {
    settings.init();
});

Hooks.once('ready', async function() {
    actor.init();
    encounter.init();
});
