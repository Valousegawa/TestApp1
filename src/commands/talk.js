/**
 * Copyright (c) 2019
 *
 * Discord intelligent chatbot.
 * Learns froms experience (use "words.json" and "memory.json".
 * This bot sure needs improvments.
 *
 * @summary Chatbot code
 * @author Valentin/Valousegawa/Telest <valou.pannacotta@gmail.com>
 *
 * Created at     : 2019-02-27 09:02:38
 * Last modified  : 2019-02-28 10:38:12
 */


module.exports = {
    name: "talk",
    description: "Wanna chat ?",
    // Bot start
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

        // Initialization
        message.reply("Bonjour ! Je suis un petit bot qui apprend ! Et si on parlait ? (stop pour arrêter)");
        actualState = state[0];

        // Collector start
        collector.on('collect', message => {
            if (message.content === "stop") {
                // Bot stopped by user
                message.reply("A plus tard !");
                collector.stop("User stoppped.");
            } else {
                // Increment nomber of speech
                numberOfSpeech++;
                // Stop when weight is high enough
                if(totalWeight > 500){
                    actualState = state[2];
                }
                switch(actualState){
                    // Case greetings
                    case state[0] :
                        // If greetingd is known
                        if(search(message.content, memory.greetings)) {
                            totalWeight += getWeight(message.content, memory.greetings);
                            message.reply("Comment ça va ?");
                            actualState = state[1];
                        // Else add a new line
                        } else {
                            to_add.text = message.content;
                            message.reply("C'est une nouvelle façon de dire bonjour ?");
                            actualState = state[3];
                        }
                        break;
                    // Case discussion
                    case state[1] :
                        message.reply(chooseBestAnswer(message.content));
                        break;
                    // Case goodbye
                    case state[2] :
                        message.reply("Je pense qu'il est temps de s'arrêter là, au revoir !");
                        collector.stop("End of conversation.");
                        break;
                    // Case learning greetings
                    case state[3] :
                        // Is it a new greetings formula ?
                        if(message.content === "Oui" || message.content === "oui"){
                            message.reply("Ok, j'enregistre !");
                            memory.greetings.push(to_add);
                            // Add in memory
                            writeInMemory();
                            totalWeight += 10;
                            message.reply("Comment ça va ?");
                        // Not polite
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

            // If the words is known
            if(sentenceWeight !== -1 || searchElementReturnPosition(text, memory.answers) !== -1){
                // If there is something in the flash memory
                if(flash_memory.length > 0){
                    let arr;
                    if(sentenceWeight !== -1){
                        arr = words.words;
                    }
                    if(searchElementReturnPosition(text, memory.answers) !== -1){
                        arr = memory.answers;
                    }
                    // Push in memory
                    flash_memory.push(text);
                    getFlashMemoryMood(arr);
                }
                totalWeight += sentenceWeight;
                totalWeight += getWeightByPosition(searchElementReturnPosition(text, memory.answers), memory.answers);
                getAverageWeight();
                // Answer by mood
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
                // Push in flash memory
                flash_memory.push(text);
                solutions = getMoodReaction("neutral", memory.questions);
                return solutions[Math.floor(Math.random()*solutions.length)];
            }
        }

        // Determine the general mood of conversation
        function whatIsTheMood(){
            let sadMood = getAverageMoodWeight("sad");
            let happyMood = getAverageMoodWeight("happy");
            let neutralMood = getAverageMoodWeight("neutral");

            // Return mood
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

        // Get the weight of the sentence
        function getSentenceWeight(text){
            let position = searchElementReturnPosition(text, words.words);
            if(position !== -1) {
                return words.words[position].weight;
            } else {
                return -1;
            }
        }

        // Learning process
        function getFlashMemoryMood(arr) {
            let last_element = flash_memory[flash_memory.length-1];
            let last_element_mood = getMood(last_element, arr);
            let last_element_weight = getWeight(last_element, arr);

            // Add all new expressions in memory
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