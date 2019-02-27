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