/**
 * Copyright (c) 2019
 *
 * Discord answer
 *
 * @summary Ping code
 * @author Valentin/Valousegawa/Telest <valou.pannacotta@gmail.com>
 *
 * Created at     : 2019-02-27 09:22:38
 * Last modified  : 2019-02-28 09:33:12
 */

module.exports = {
    name: "ping",
    description: "ping",
    execute(message) {
        message.reply("Pong !");
    },
};