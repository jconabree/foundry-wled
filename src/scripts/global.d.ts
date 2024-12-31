interface ActorSegment {
    name: string;
    actorType: string;
    startLed: number;
    stopLed: number;
    healthPercent: number;
    isGM: boolean;
}

interface CombatSegment extends ActorSegment {
    isActive?: boolean;
}

interface WLEDSegment extends CombatSegment {
    isOn?: boolean;
}

interface RawWLEDSegment {
    
}
