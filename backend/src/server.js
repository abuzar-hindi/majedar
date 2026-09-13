import app from './app.js';
import { connectDatabase } from './config/database.js';
import { config } from './config/env.js';

const PORT = config.port;

// Connect to MongoDB and start HTTP listener
connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on PORT: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start server due to database connection error:', error.message);
        process.exit(1);
    });