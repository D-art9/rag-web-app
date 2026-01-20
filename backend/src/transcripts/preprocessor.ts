// This file will preprocess the transcripts for chunking and embedding.

import { Transcript } from '../types'; // Assuming there's a Transcript type defined in the types directory

export function preprocessTranscript(transcript: Transcript): string[] {
    // Implement preprocessing logic here
    // For example, splitting the transcript into chunks based on certain criteria
    const chunks: string[] = (transcript.text || transcript.content).split('\n\n'); // Example: split by double newlines
    return chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
}