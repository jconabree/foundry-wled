import settings from './settings.js';

class FWIWled {
    #cache = null;
    #iniLength = 1;

    _getActorMainSegmentKey(actorName) {
        return actorName.toLowerCase().split(' ')[0].replace(/[^a-z1-9]/g, '');
    }
    _getActorSegmentKeys(actorName) {
        const mainSegment = this._getActorMainSegmentKey(actorName);

        return [
            mainSegment,
            `${mainSegment}-pre`,
            `${mainSegment}-post`
        ];
    }

    _isPre(key) {
        return /-pre$/.test(key);
    }

    _isPost(key) {
        return /-post$/.test(key);
    }

    _getHealthColor(healthPercent) {
        if (healthPercent < 0 || healthPercent > 100) {
            throw new Error('Percentage must be between 0 and 100.')
        }

        const green = (healthPercent / 100) * 255
        const red = 255 - ((healthPercent / 100) * 255)
        
        return [red, green, 5];
    }

    _getGMColor(isActive) {
        if (typeof isActive === 'undefined' || isActive) {
            return [255, 255, 255];
        }

        const strength = settings.getValue('gm-inactive');

        return [strength, strength, strength];
    }

    async _createMissingSegments(segmentKeys, startLed, stopLed) {
        const existingSegments = await this.getSegments();
        let missingSegments = segmentKeys;

        if (existingSegments) {
            missingSegments = segmentKeys.filter((segmentKey) => !existingSegments.find(({ n }) => n === segmentKey));
        }

        const segmentsToCreate = missingSegments.map((segmentKey) => {
            let start = startLed;
            let stop = stopLed;
            let color = [0, 255, 5];

            if (this._isPre(segmentKey)) {
                start = startLed - this.#iniLength;
                stop = startLed;
                color = [255, 255, 255]
            }

            if (this._isPost(segmentKey)) {
                start = stopLed;
                stop = stopLed + this.#iniLength;
                color = [255, 255, 255]
            }

            return {
                n: segmentKey,
                start,
                stop,
                on: false,
                frz: false, // TODO add check for freeze
                col: [color, [0,0,0], [0,0,0]]
            }
        });

        if (!segmentsToCreate.length) {
            return;
        }

        const seg = await this._prepareDataForCreate(
            segmentsToCreate.map((segment) => this.addBaseWledDataToSegment(segment))
        );

        await this._query(
            'state',
            {
                method: 'POST',
                body: {
                    seg
                }
            }
        );
    }

    /**
     * 
     * @param {Object} segmentData 
     * @param {string} segmentData.name
     * @param {number} segmentData.startLed
     * @param {number} segmentData.stopLed
     * @param {boolean} segmentData.isActive
     * @param {boolean} [segmentData.isGM]
     * @param {number} [segmentData.healthPercent]
     * @param {boolean} [segmentData.isOn]
     * @param {boolean} [batch]
     * @return {Array<Object>}
     */
    async updateSegment(segmentData, batch) {
        const {
            name,
            startLed,
            stopLed,
            isActive,
            isGM,
            healthPercent,
            isOn = true
        } = segmentData;

        const segmentKeys = isGM ? ['dm'] : this._getActorSegmentKeys(name);

        const color = isGM ? this._getGMColor(isActive) : this._getHealthColor(healthPercent);

        await this._createMissingSegments(segmentKeys, startLed, stopLed);
        const existingSegments = await this.getSegments();

        if (!existingSegments) {
            console.warn('Failed to create missing segments');

            return;
        }

        const segments = segmentKeys.map((segmentKey, index) => {
            const id = existingSegments.find(({ n }) => segmentKey === n).id;

            if (index === 0) {
                return {
                    key: segmentKey,
                    id,
                    col: [color, [0, 0, 0], [0, 0, 0]],
                    on: isOn,
                    frz: !(isOn) // TODO add check for freeze
                }
            }

            if (typeof isActive === 'undefined') {
                return;
            }

            return {
                key: segmentKey,
                id,
                on: isOn && isActive,
                frz: !(isOn && isActive) // TODO add check for freeze
            }
        }).filter(Boolean);

        if (batch) {
            return segments;
        }

        return this._updateSegments(segments);
    }

    async updateSegments(segmentDatas) {
        const allSegments = await this._iterateUpdateSegments(segmentDatas);

        return this._updateSegments(allSegments);
    }

    async _iterateUpdateSegments(remainingSegments, combinedSegments = []) {
        const currentSegment = remainingSegments[0];

        const updateSegments = await this.updateSegment(currentSegment, true);

        if (remainingSegments.length > 1) {
            return await this._iterateUpdateSegments(
                remainingSegments.slice(1),
                [
                    ...combinedSegments,
                    ...(updateSegments||[])
                ]
            );
        }

        return [
            ...combinedSegments,
            ...(updateSegments||[])
        ];
    }

    async _updateSegments(segments) {
        let seg = Object.values(
            segments.reduce((unique, {key, ...segment}) => {
                if (typeof unique[key] === 'undefined' || segment.on) {
                    unique[key] = segment;
                }

                return unique;
            }, {})
        );

        return this._query(
            'state',
            {
                method: 'POST',
                body: {
                    seg
                }
            }
        )
    }

    addBaseWledDataToSegment(segment) {
        return {
            "grp": 1,
            "spc": 0,
            "of": 0,
            "on": false,
            "frz": true,
            "bri": 255,
            "cct": 127,
            "set": 0,
            "fx": 0,
            "sx": 128,
            "ix": 128,
            "pal": 0,
            "c1": 128,
            "c2": 128,
            "c3": 16,
            "sel": false,
            "rev": false,
            "mi": false,
            "o1": false,
            "o2": false,
            "o3": false,
            "si": 0,
            "m12": 0,
            ...segment
        };
    }

    async _prepareDataForCreate(segments) {
        const allSegments = await this.getSegments();
        let defaultSegment = allSegments?.find(({ id }) => id === 0);


        if (!defaultSegment) {
            defaultSegment = {
                "id": 0,
                "start": 0,
                "stop": 120,
                "len": 120,
                "grp": 1,
                "spc": 0,
                "of": 0,
                "on": false,
                "frz": false,
                "bri": 137,
                "cct": 127,
                "set": 0,
                "col": [
                    [
                        255,
                        237,
                        135
                    ],
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        0
                    ]
                ],
                "fx": 0,
                "sx": 128,
                "ix": 128,
                "pal": 0,
                "c1": 128,
                "c2": 128,
                "c3": 16,
                "sel": false,
                "rev": false,
                "mi": false,
                "o1": false,
                "o2": false,
                "o3": false,
                "si": 0,
                "m12": 0
            };
        }

        const existingLength = allSegments?.length || 1;

        return [
            ...(allSegments?.filter(({ id }) => id !== 0)||[]),
            defaultSegment,
            ...segments.map((segment, index) => {
                return {
                    ...segment,
                    id: existingLength + index
                }
            })
        ]
    }

    async getSegments() {
        if (!this.#cache) {
            const data = await this._query('state');
            const segments = data.seg;

            this.#cache = segments;
        }

        return this.#cache;
    }

    async _query(endpoint, options) {
        const uri = settings.getValue('uri')?.replace(/\/$/, '');

        if (!uri) {
            console.warn('Configure WLED address');

            return;
        }

        const response = await fetch(
            `${uri}/json/${endpoint}`,
            {
                ...options||{},
                body: typeof options?.body === 'object' ? JSON.stringify(options.body) : options?.body,
                headers: new Headers({
                    ...options?.headers||{},
                    'content-type': 'application/json'
                }),
            }
        );

        const data = await response.json();

        if (options?.method && options.method !== 'GET') {
            this.#cache = null;
        }

        if (response.status !== 200 && game.user.isGM) {
            // TODO show a notification that WLED might be down
        }

        return data;
    }
}

export default new FWIWled();