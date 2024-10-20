import settings from './settings.js';
import wled from './wled.js';

class FWIActor {
    #flagKey = 'foundry-wled'

    init() {
        this.initSheet();
        this.initSummonInfo();
        this.initCombat();
    }

    initSheet() {
        const pcSheetNames = Object.values(CONFIG.Actor.sheetClasses.character)
            .map((sheetClass) => sheetClass.cls)
            .map((sheet) => sheet.name);

        pcSheetNames.forEach((sheetName) => {
            Hooks.on(`get${sheetName}HeaderButtons`, (app, buttons) => {
                if (buttons.find(({ label }) => label === 'WLED Configurations')) {
                    return buttons;
                }

                return buttons.splice(
                    buttons.findIndex(({ label }) => label === 'Sheet'),
                    0,
                    {
                        label: 'WLED Configurations',
                        class: 'wled-config',
                        icon: 'fas fa-traffic-light',
                        onclick: this.getConfigButtonClick(app.object)
                    }
                )
            });
        });
    }

    getConfigButtonClick(actor) {
        return (...clickData) => {
            new foundry.applications.api.DialogV2({
                window: { title: `${actor.name} WLED Configuration` },
                content: `
                    <label for="wled-actor-start-${actor.id}">
                        Start LED
                        <input
                            name="wled-actor-start"
                            id="wled-actor-start-${actor.id}"
                            type="number"
                            value="${this.getValue(actor, 'startLed') || 0}"
                        />
                    </label>
                    <label for="wled-actor-stop-${actor.id}">
                        End LED
                        <input
                            name="wled-actor-stop"
                            id="wled-actor-stop-${actor.id}"
                            type="number"
                            value="${this.getValue(actor, 'stopLed') || 0}"
                        />
                    </label>
                `,
                buttons: [{
                    action: 'submit',
                    label: 'Save',
                    callback: (event, button, dialog) => ({
                        start: button.form.elements['wled-actor-start'].value,
                        stop: button.form.elements['wled-actor-stop'].value,
                    })
                }],
                submit: (result) => {
                    this.setValue(actor, 'startLed', result.start);
                    this.setValue(actor, 'stopLed', result.stop);
                }
            }).render({ force: true });
        }
    }

    initSummonInfo() {
        Hooks.on('dnd5e.postSummon', (summonData, _, [token]) => {
            const summonedActor = game.actors.find((a) => a.id === token.actorId);

            this.setValue(summonedActor, 'parentActorId', summonData.parent.parent.parent.id);

            console.log(summonedActor);
        });
    }

    initCombat() {        
        Hooks.on('updateActor', (actor, updated) => {
            this.onUpdate(actor, updated);
        });
    }

    getActorSegment(actor) {
        let segmentActor = actor;

        const hp = actor.system?.attributes?.hp;

        if (!hp) {
            return;
        }

        const healthPercent = (hp.value / hp.max) * 100;

        if (isNaN(healthPercent)) {
            return;
        }
        
        if (actor.flags.dnd5e.summonedCopy) {
            const parentActorId = this.getValue(actor, 'parentActorId');

            // Summoned but no attachment
            if (!parentActorId) {
                console.warn('Summoned creature has no parent actor');

                return;
            }

            segmentActor = game.actors.find(a => a.id === parentActorId);
        }

        let startLed = this.getValue(segmentActor, 'startLed');
        let stopLed = this.getValue(segmentActor, 'stopLed');
        let isGM = false;

        if (!startLed || !stopLed) {
            const nonPlayerUsers = game.users
                    .filter(({ name }) => ['Gamemaster', 'Table'].includes(name))
                    .map(({ _id }) => _id);
            const hasNonGmOwner = Object.entries(segmentActor.ownership)
                .some(([uuid, level]) => level === 3 && !nonPlayerUsers.includes(uuid));
            
            if (!hasNonGmOwner) {
                startLed = settings.getValue('gm-start');
                stopLed = settings.getValue('gm-end');
                isGM = true;
            }

            if (!startLed || !stopLed) {
                return;
            }
        }

        startLed = Number.parseInt(startLed, 10);
        stopLed = Number.parseInt(stopLed, 10);

        return {
            name: segmentActor.name,
            actorType: segmentActor.type,
            startLed,
            stopLed,
            healthPercent,
            isGM
        };
    }

    onUpdate(actor, updated) {
        if (!game.combat?.isActive) {
            return;
        }

        if (typeof updated?.system?.attributes?.hp === 'undefined') {
            return;
        }

        const actorSegment = this.getActorSegment(actor);
        if (!actorSegment) {
            return;
        }

        wled.updateSegment(actorSegment)
    }

    setValue(entity, key, value) {
        if (typeof value === 'undefined') {
            return entity.unsetFlag(this.#flagKey, key);
        }

        return entity.setFlag(this.#flagKey, key, value);
    }

    getValue(entity, key) {
        return entity.getFlag(this.#flagKey, key);
    }
}

export default new FWIActor();