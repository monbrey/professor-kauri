export interface SplitOptions {
	maxLength: number;
	splitChar: string;
}

export class Util extends null {
	public static splitMessage(text: string, { maxLength = 2_000, splitChar = '\n' } = {}) {
		if (text.length <= maxLength) return [text];
		let splitText = [text];
		splitText = text.split(splitChar);
		if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
		const messages = [];
		let msg = '';
		for (const chunk of splitText) {
			if (msg && (msg + splitChar + chunk).length > maxLength) {
				messages.push(msg);
			}
			msg += (msg ? splitChar : '') + chunk;
		}
		return messages.concat(msg).filter(m => m);
	}
}
