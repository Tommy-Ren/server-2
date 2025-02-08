const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Allow cross-origin requests from Server 1

// Load dictionary from file
const dictionaryFile = 'dictionary.json';
let dictionary = {};
let requestCount = 0;

// Load dictionary data from file if exists
if (fs.existsSync(dictionaryFile)) {
    dictionary = JSON.parse(fs.readFileSync(dictionaryFile, 'utf8'));
}

// Helper function to validate input
function isValidWord(word) {
    return typeof word === 'string' && /^[a-zA-Z]+$/.test(word.trim());
}

// GET request - Retrieve definition of a word
app.get('/api/definitions/', (req, res) => {
    requestCount++;
    const word = req.query.word;

    if (!isValidWord(word)) {
        return res.status(400).json({
            requestNumber: requestCount,
            message: "Invalid word format. Please enter a valid English word."
        });
    }

    const definition = dictionary[word.toLowerCase()];
    if (definition) {
        res.json({
            requestNumber: requestCount,
            word: word,
            definition: definition
        });
    } else {
        res.json({
            requestNumber: requestCount,
            message: `Word '${word}' not found in the dictionary.`
        });
    }
});

// POST request - Add a new definition
app.post('/api/definitions', (req, res) => {
    requestCount++;
    const { word, definition } = req.body;

    if (!isValidWord(word) || typeof definition !== 'string' || definition.trim() === '') {
        return res.status(400).json({
            requestNumber: requestCount,
            message: "Invalid input. Please provide a valid word and definition."
        });
    }

    const lowerCaseWord = word.toLowerCase();
    if (dictionary[lowerCaseWord]) {
        return res.status(409).json({
            requestNumber: requestCount,
            message: `Warning! The word '${word}' already exists in the dictionary.`
        });
    }

    dictionary[lowerCaseWord] = definition;
    fs.writeFileSync(dictionaryFile, JSON.stringify(dictionary, null, 2));
    const totalEntries = Object.keys(dictionary).length;

    res.json({
        requestNumber: requestCount,
        totalEntries: totalEntries,
        message: "New entry recorded:",
        word: word,
        definition: definition
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Dictionary API running on port ${port}`);
});