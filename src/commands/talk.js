module.exports = {
    name: "talk",
    description: "Wanna chat ?",
    execute(message) {
        const Discord = require("discord.js");
        const memory = require('../memory.json');
        const words = require('../words.json');

        const fs = require("fs");
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);

        let state = ["greets", "discussion", "goodbye", "learning_greetings"];
        let actualState = "";
        let totalWeight = 0;
        let numberOfSpeech = 0;
        let averageWeight = 0;
        let flash_memory = [];

        let to_add = {
            "text" : "",
            "weight" : 10,
            "mood" : "neutral",
            "parents" : [],
            "children " : []
        };

        message.reply("Bonjour ! Je suis un petit bot qui apprend ! Et si on parlait ? (stop pour arrêter)");
        actualState = state[0];

        collector.on('collect', message => {
            if (message.content === "stop") {
                message.reply("A plus tard !");
                collector.stop("User stoppped.");
            } else {
                numberOfSpeech++;
                if(totalWeight > 500){
                    actualState = state[2];
                }
                switch(actualState){
                    case state[0] :
                        if(search(message.content, memory.greetings)) {
                            totalWeight += getWeight(message.content, memory.greetings);
                            message.reply("Comment ça va ?");
                            actualState = state[1];
                        } else {
                            to_add.text = message.content;
                            message.reply("C'est une nouvelle façon de dire bonjour ?");
                            actualState = state[3];
                        }
                        break;
                    case state[1] :
                        message.reply(chooseBestAnswer(message.content));
                        break;
                    case state[2] :
                        message.reply("Je pense qu'il est temps de s'arrêter là, au revoir !");
                        collector.stop("End of conversation.");
                        break;
                    case state[3] :
                        if(message.content === "Oui" || message.content === "oui"){
                            message.reply("Ok, j'enregistre !");
                            memory.greetings.push(to_add);
                            writeInMemory();
                            totalWeight += 10;
                            message.reply("Comment ça va ?");
                        } else {
                            message.reply("C'est malpoli de ne pas dire bonjour ! Je m'en vais :angry:");
                            collector.stop("Tsundere Mode.")
                        }
                        actualState = state[1];
                        break;
                }
            }
        });

        function chooseBestAnswer(text){
            let sentenceWeight = getSentenceWeight(text);
            let solutions;

            if(sentenceWeight !== -1 || searchElementReturnPosition(text, memory.answers) !== -1){
                if(flash_memory.length > 0){
                    let arr;
                    if(sentenceWeight !== -1){
                        arr = words.words;
                    }
                    if(searchElementReturnPosition(text, memory.answers) !== -1){
                        arr = memory.answers;
                    }
                    flash_memory.push(text);
                    getFlashMemoryMood(arr);
                }
                totalWeight += sentenceWeight;
                totalWeight += getWeightByPosition(searchElementReturnPosition(text, memory.answers), memory.answers);
                getAverageWeight();
                switch(whatIsTheMood()){
                    case "very happy":
                        solutions = getMoodReaction("happy", memory.answers);
                        return solutions[Math.floor(Math.random()*solutions.length)];
                    case "happy" :
                        solutions = getMoodReaction("happy", memory.answers);
                        return solutions[Math.floor(Math.random()*solutions.length)];
                    case "neutral" :
                        solutions = getMoodReaction("neutral", memory.answers);
                        return solutions[Math.floor(Math.random()*solutions.length)];
                    case "sad" :
                        solutions = getMoodReaction("sad", memory.answers);
                        return solutions[Math.floor(Math.random()*solutions.length)];
                }
            } else {
                flash_memory.push(text);
                solutions = getMoodReaction("neutral", memory.questions);
                return solutions[Math.floor(Math.random()*solutions.length)];
            }
        }

        function whatIsTheMood(){
            let sadMood = getAverageMoodWeight("sad");
            let happyMood = getAverageMoodWeight("happy");
            let neutralMood = getAverageMoodWeight("neutral");

            if(averageWeight > neutralMood){
                if(averageWeight > happyMood){
                    return "very happy";
                } else {
                    return "happy"
                }
            } else {
                if(averageWeight > sadMood){
                    return "neutral";
                } else {
                    return "sad";
                }
            }
        }

        function getSentenceWeight(text){
            let position = searchElementReturnPosition(text, words.words);
            if(position !== -1) {
                return words.words[position].weight;
            } else {
                return -1;
            }
        }

        function getFlashMemoryMood(arr) {
            let last_element = flash_memory[flash_memory.length-1];
            let last_element_mood = getMood(last_element, arr);
            let last_element_weight = getWeight(last_element, arr);

            for (let i = 0; i < flash_memory.length - 1; i++) {
                to_add.text = flash_memory[i];
                to_add.weight = last_element_weight;
                to_add.mood = last_element_mood;

                writeInMemory();
            }
        }

        function getWeight(text, arr){
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].text === text) {
                    return arr[i].weight;
                }
            }
            return -1;
        }

        function getMood(text, arr){
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].text === text) {
                    return arr[i].weight;
                }
            }
            return -1;
        }

        function getWeightByPosition(i, arr){
            return arr[i].weight;
        }

        function writeInMemory(){
            fs.writeFile("memory.json", JSON.stringify(memory), (err) => {
                if(err){
                    throw err;
                }
            });
        }

        function search(text, arr){
            for (let i = 0; i < arr.length; i++){
                if (arr[i].text === text) {
                    return true;
                }
            }
            return false;
        }

        function searchElement(text, arr){
            for (let i = 0; i < arr.length; i++){
                if (arr[i].text === text) {
                    return arr[i];
                }
            }
            return false;
        }

        function searchElementReturnPosition(text, arr){
            for (let i = 0; i < arr.length; i++){
                if (arr[i].text === text) {
                    return i;
                }
            }
            return -1;
        }

        function getAverageWeight(){
            return averageWeight = totalWeight / numberOfSpeech;
        }

        function getMoodReaction(mood, arr){
            let solutions = [];

            for (let i = 0; i < arr.length; i++){
                if(arr[i].mood === mood) {
                    solutions.push(arr[i].text);
                }
            }
            return solutions;
        }

        function getAverageMoodWeight(mood){
            let averageMoodWeight = 0;
            let cpt = 0;

            for (let i = 0; i < memory.greetings.length; i++){
                if(memory.greetings[i].mood === mood) {
                    averageMoodWeight += memory.greetings[i].weight;
                    cpt++;
                }
            }
            for (let i = 0; i < memory.discussion.length; i++){
                if(memory.discussion[i].mood === mood) {
                    averageMoodWeight += memory.discussion[i].weight;
                    cpt++;
                }
            }
            for (let i = 0; i < memory.questions.length; i++){
                if(memory.questions[i].mood === mood) {
                    averageMoodWeight += memory.questions[i].weight;
                    cpt++;
                }
            }
            for (let i = 0; i < memory.answers.length; i++){
                if(memory.answers[i].mood === mood) {
                    averageMoodWeight += memory.answers[i].weight;
                    cpt++;
                }
            }
            for (let i = 0; i < words.words.length; i++){
                if(words.words[i].mood === mood) {
                    averageMoodWeight += words.words[i].weight;
                    cpt++;
                }
            }

            return averageMoodWeight / cpt;
        }

        //TODO
        function updateBloodTie(family, expression, text, arr){
            let search;
            if(search = searchElement(text, arr)) {
                if (family === "parent") {
                    search.parents.push(expression)
                } else {
                    search.children.push(expression)
                }
            }
        }
    }

};