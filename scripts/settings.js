class FWISettings {
    #SETTINGS_ID = 'foundry-wled';

    /**
     * 
     * @param {string} configName 
     * @param {SettingsConfig} setting
     * @public 
     */
    registerSetting(configName, setting) {
        game.settings.register(
            this.#SETTINGS_ID,
            configName,
            setting
        );
    }

    registerSubmenu(menuName, config) {
        game.settings.registerMenu(
            this.#SETTINGS_ID,
            menuName,
            config
        );
    }

    /**
     * @public
     */
    init() {
        this.registerSetting(
            'enable-initiative',
            {
                name: 'Enable Auto Initiative',
                scope: 'world',
                config: true,
                type: Boolean,
                default: false
            }
        );

        this.registerSetting(
            'uri',
            {
                name: 'WLED Address',
                hint: 'Include http://',
                scope: 'world',
                config: true,
                type: String
            }
        );

        this.registerSetting(
            'use-freeze',
            {
                name: 'Use Freeze/Unfreeze',
                hint: 'WLED will sometimes leave gaps in segment 0 when unfrozen segments are off',
                scope: 'world',
                config: true,
                type: Boolean,
                default: true
            }
        );

        this.registerSetting(
            'gm-start',
            {
                name: 'GM Area Start LED',
                scope: 'world',
                config: true,
                type: new foundry.data.fields.NumberField({
                    min: 0,
                    max: 1000,
                    step: 1,
                    initial: 0,
                    nullable: false
                })
            }
        )

        this.registerSetting(
            'gm-end',
            {
                name: 'GM Area End LED',
                scope: 'world',
                config: true,
                type: new foundry.data.fields.NumberField({
                    min: 0,
                    max: 1000,
                    step: 1,
                    initial: 0,
                    nullable: false
                })
            }
        );
        
        this.registerSetting(
            'gm-inactive',
            {
                name: 'GM Area Inactive Strength',
                scope: 'world',
                config: true,
                type: new foundry.data.fields.NumberField({
                    min: 0,
                    max: 255,
                    initial: 255,
                    nullable: false
                })
            }
        );
    }

    getValue(key) {
        return game.settings.get(this.#SETTINGS_ID, key);
    }

    setValue(key, value) {
        return game.settings.set(this.#SETTINGS_ID, key, value);
    }
}

export default new FWISettings();