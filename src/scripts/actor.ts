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
        const allCharacterSheets: {
            cls: typeof DocumentSheet
        // @ts-ignore
        }[] = Object.values(CONFIG.Actor.sheetClasses.character)
        const pcSheetNames = allCharacterSheets
            .map((sheetClass) => sheetClass.cls)
            .map((sheet) => sheet.name);

        pcSheetNames.forEach((sheetName) => {
            Hooks.on(
                `get${sheetName}HeaderButtons`,
                (
                    app: FormApplication<FormApplicationOptions, Actor>,
                    buttons: {
                        label: string;
                        class: string;
                        icon: string;
                        onclick: (param: unknown) => void;
                    }[]
                ) => {
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
                }
            );
        });
    }

    getConfigButtonClick(actor: Actor) {
        type WLEDActorFormValues = {
            start: string|number;
            stop: string|number;
        };

        return () => {
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
                    callback: (event, button, dialog): Promise<WLEDActorFormValues> => Promise.resolve({
                        start: (button.form!.querySelector('[name="wled-actor-start"]') as HTMLInputElement).value,
                        stop: (button.form!.querySelector('[name="wled-actor-stop"]') as HTMLInputElement).value,
                    })
                }],
                submit: async (result: WLEDActorFormValues) => {
                    this.setValue(actor, 'startLed', result.start);
                    this.setValue(actor, 'stopLed', result.stop);
                }
            // @ts-ignore
            }).render({ force: true });
        }
    }

    initSummonInfo() {
        Hooks.on(
            'dnd5e.postSummon',
            (
                summonData: {
                    parent: {
                        parent: {
                            parent: {
                                id: string;
                            }
                        }
                    }
                },
                _: any,
                [token]: TokenDocument[]
            ) => {
            const summonedActor = game.actors?.find((a) => a.id === token.actorId);

            if (!summonedActor) {
                return;
            }

            // Big assumption here
            this.setValue(summonedActor, 'parentActorId', summonData.parent.parent.parent.id);
        });
    }

    initCombat() {
        Hooks.on('updateActor', (actor: Actor, updated: { [key: string]: unknown }) => {
            this.onUpdate(actor, updated);
        });
    }

    getActorSegment(actor: Actor): ActorSegment|undefined {
        let segmentActor: Actor|undefined = actor;

        // @ts-ignore
        const hp = actor.system?.attributes?.hp;

        if (!hp) {
            return;
        }

        const healthPercent = (hp.value / hp.max) * 100;

        if (isNaN(healthPercent)) {
            return;
        }
        
        // @ts-ignore
        if (actor.flags.dnd5e?.summonedCopy) {
            const parentActorId = this.getValue(actor, 'parentActorId');

            // Summoned but no attachment
            if (!parentActorId) {
                console.warn('Summoned creature has no parent actor');

                return;
            }

            const parentActor = game.actors?.find(a => a.id === parentActorId) as Actor|undefined;

            if (!parentActor) {
                console.warn('Summoned creature parent actor not found');

                return;
            }

            segmentActor = parentActor;
        }

        let startLed = this.getValue(segmentActor, 'startLed');
        let stopLed = this.getValue(segmentActor, 'stopLed');
        let isGM = false;

        if (!startLed || !stopLed) {
            const nonPlayerUsers = game.users
                    // @ts-ignore
                    ?.filter(({ name }) => ['Gamemaster', 'Table'].includes(name))
                    ?.map(({ _id }) => _id);
            const hasNonGmOwner = Object.entries(segmentActor.ownership)
                .some(([uuid, level]) => level === 3 && !nonPlayerUsers?.includes(uuid));
            
            if (!hasNonGmOwner) {
                startLed = settings.getValue('gm-start');
                stopLed = settings.getValue('gm-end');
                isGM = true;
            }

            if ((!startLed && startLed !== 0) || (!stopLed && stopLed !== 0)) {
                return;
            }
        }

        startLed = Number.parseInt(startLed, 10);
        stopLed = Number.parseInt(stopLed, 10);

        return {
            name: segmentActor.name,
            actorType: actor.type,
            startLed,
            stopLed,
            healthPercent,
            isGM
        };
    }

    onUpdate(actor: Actor, updated: { [key: string]: unknown}) {
        if (!settings.getValue('enable-encounter')) {
            return;
        }

        if (!game.combat?.isActive) {
            return;
        }

        // @ts-ignore
        if (typeof updated?.system?.attributes?.hp === 'undefined') {
            return;
        }

        const actorSegment = this.getActorSegment(actor);
        if (!actorSegment) {
            return;
        }

        wled.updateSegment(actorSegment)
    }

    setValue(entity: Actor, key: string, value: unknown) {
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