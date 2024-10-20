import actor from './actor.js';
import wled from './wled.js';

class FWIInitiative {
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
        .reduce((unique, segment) => {
            const existingIndex = unique.findIndex(({ name }) => name === segment.name);
            if (existingIndex === -1) {
                unique.push(segment);
            } else if (segment.actorType === 'character') {
                unique[existingIndex] = segment;
            }

            return unique;
        }, []);
    }

    onCombatUpdate(combat, turn) {
        console.log('combat updated', combat);
        if (!combat.active || !combat.turns.length) {
            return;
        }

        console.log(turn);

        const actorSegments = this.getCombatSegments(combat, turn);

        console.log(actorSegments);

        if (!actorSegments.length) {
            return;
        }
        
        wled.updateSegments(actorSegments);
    }

    onCombatDelete(combat) {
        console.log('combat deleted', combat);
        const actorSegments = this.getCombatSegments(combat);

        console.log(actorSegments);

        if (!actorSegments.length) {
            return;
        }
        
        wled.updateSegments(
            actorSegments.map((segment) => ({ ...segment, isOn: false }))
        );
    }
}

export default new FWIInitiative();