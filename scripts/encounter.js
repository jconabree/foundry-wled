import actor from './actor.js';
import settings from './settings.js';
import wled from './wled.js';

class FWIEncounter {
    init() {
        if (!game.user.isGM) {
            return;
        }

        Hooks.on('combatStart', (combat, update) => {
            this.onCombatUpdate(combat, update?.turn || 0);
        })

        Hooks.on('combatTurn', (combat, update) => {
            this.onCombatUpdate(combat, update?.turn || 0);
        })
        
        Hooks.on('combatRound', (combat, update) => {
            this.onCombatUpdate(combat, update?.turn || 0);
        })

        Hooks.on('deleteCombat', (combat) => {
            this.onCombatDelete(combat);
        })
    }

    getCombatSegments(combat, turnNumber) {
        if (!combat.turns.length) {
            return;
        }

        return combat.turns.map((turn, index) => {
            const isActive = combat.active && index === turnNumber;
            const combatActor = game.actors.find((a) => a.id === turn.actorId);
        
            const actorSegment = actor.getActorSegment(combatActor);

            if (!actorSegment) {
                return;
            }

            return {
                ...actorSegment,
                isActive
            }
        })
        .filter(Boolean)
        .reduce((unique, segment, index) => {
            const existingIndex = unique.findIndex(({ name }) => name === segment.name);
            if (existingIndex === -1) {
                unique.push(segment);
            } else if (segment.actorType === 'character' && !unique[existingIndex].isActive) {
                unique[existingIndex] = segment;
            } else {
                unique[existingIndex].isActive = segment.isActive || unique[existingIndex].isActive;
            }

            return unique;
        }, []);
    }

    onCombatUpdate(combat, turn) {
        if (!settings.getValue('enable-encounter')) {
            return;
        }

        if (!combat.active || !combat.turns.length) {
            return;
        }

        const actorSegments = this.getCombatSegments(combat, turn);

        if (!actorSegments.length) {
            return;
        }
        
        wled.updateSegments(actorSegments);
    }

    onCombatDelete(combat) {
        if (!settings.getValue('enable-encounter')) {
            return;
        }

        const actorSegments = this.getCombatSegments(combat);

        if (!actorSegments.length) {
            return;
        }
        
        wled.updateSegments(
            actorSegments.map((segment) => ({ ...segment, isOn: false }))
        );
    }
}

export default new FWIEncounter();