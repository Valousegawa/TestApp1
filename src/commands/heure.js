/**
 * Copyright (c) 2019
 *
 * Discord time.
 * Gives current time ("HH:mm")
 *
 * @summary Time code
 * @author Valentin/Valousegawa/Telest <valou.pannacotta@gmail.com>
 *
 * Created at     : 2019-02-04 09:35:30
 * Last modified  : 2019-02-04 09:45:56
 */

module.exports = {
    name: "heure",
    description: "Quelle heure est-il ?",
    execute(message) {
        const date = new Date();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        let response = "";

        response = "Il est " + hour + " : " + (minutes < 10 ? '0' : '') + minutes + ".";

        message.reply(response);
    },
};