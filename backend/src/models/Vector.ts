import mongoose, { Schema, Document } from 'mongoose';

export interface IVector extends Document {
    videoId: string;
    chunkIndex: number;
    text: string;
    embedding: number[];
    metadata: {
        title: string;
        url: string;
        thumbnail: string;
    };
}

const VectorSchema: Schema = new Schema({
    videoId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: {
        title: { type: String, default: '' },
        url: { type: String, default: '' },
        thumbnail: { type: String, default: '' }
    }
});

export default mongoose.model<IVector>('Vector', VectorSchema);
