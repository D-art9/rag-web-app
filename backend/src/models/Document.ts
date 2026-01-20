import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
    url: string;
    title: string;
    thumbnail: string;
    transcript: string;
    createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    transcript: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
