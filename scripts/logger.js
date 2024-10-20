class FWILogger {
    #logId = 'FWI';

    log(...info) {
        const [message, ...data] = info;

        if (typeof message === 'string') {
            console.log(`${this.#logId} | ${message}`, ...data);

            return;
        }

        console.log(this.#logId, ...data);
    }
}