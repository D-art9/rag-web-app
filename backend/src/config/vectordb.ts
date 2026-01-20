import { VectorDBConfig } from '../types/index';

const vectorDBConfig: VectorDBConfig = {
    host: process.env.VECTOR_DB_HOST || 'localhost',
    port: parseInt(process.env.VECTOR_DB_PORT || '5432', 10),
    username: process.env.VECTOR_DB_USERNAME || 'user',
    password: process.env.VECTOR_DB_PASSWORD || 'password',
    database: process.env.VECTOR_DB_NAME || 'vectordb',
};

export default vectorDBConfig;