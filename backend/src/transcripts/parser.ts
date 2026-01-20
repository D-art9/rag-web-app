// This file will parse the extracted transcripts into a usable format.

import { Transcript } from '../types/index';

export function parseTranscript(rawTranscript: string): Transcript {
    const lines = rawTranscript.split('\n');
    const parsedLines = lines.map(line => line.trim()).filter(line => line.length > 0);

    return {
        content: parsedLines.join(' '),
        text: parsedLines.join(' '),
        wordCount: parsedLines.join(' ').split(' ').length,
    };
}