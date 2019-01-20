import { createSync, Difficulty } from 'difficulty';
import { assignIn, chunk, zipObject } from 'lodash';

var GoogleTranslate = require("google-translate-promise")
const options = {
	API_KEY: '',
	URL: 'https://www.googleapis.com/language/translate/v2',
	throttle: 500,
	timeout: 5000
};

const googleTranslate = new GoogleTranslate(options);
const difficulty = createSync();

export class Translator {
    public static filterDifficultWords(words: string[], level = 1): string[] {
        return words.filter(word => {
            return word && this.isDifficult(word, level);
        });
    }

    public static getLevels() {
        return difficulty.wordList.length - 1;
    }

    public static isDifficult(word: string, level: number) {
        return difficulty.getLevel(word) >= level;
    }

    public static async translate(word: string, lang = 'zh-tw') {
        const { text } = await googleTranslate.translate(word, 'zh-tw', 'en');
        return text;
    }

    public static getChunkedTasks(chunks: string[][], lang = 'zh-tw'): any[] {
        const tasks: any[] = [];
        chunks.forEach(chunkedWords => {
            let str = '';
            chunkedWords.forEach(word => {
                str += `${word}<br>`;
            });
            tasks.push(googleTranslate.translate(str, 'zh-tw', 'en'));
        });
        return tasks;
    }

    public static async bulkTranslate(words: string[], lang = 'zh-tw') {
        const chunks = chunk(words, 50);
        const tasks = this.getChunkedTasks(chunks, lang);
        const results = await Promise.all(tasks);
        const translation = {};
        results.forEach((result, idx) => {
            // console.log('idx'+idx)
            // console.log('result'+result)
            const splittedWords = String(result).split('<br>');
            assignIn(translation, zipObject(chunks[idx], splittedWords));
        });
        return translation;
    }
}
