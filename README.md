# Q&A System - API Documentation
This is a Q&A system with voting functionality for both questions and answers. Users can create, update, delete, and vote on questions and answers. Votes are tracked as either upvotes (+1) or downvotes (-1), and each user can only vote once per question or answer.

## Features
- **CRUD Operations for Questions and Answers**: Users can create, read, update, and delete questions and answers.
- **Vote on Questions and Answers**: Users can upvote (+1) or downvote (-1) questions and answers.
- **Data Validation**: Ensures answers do not exceed 300 characters and votes are either +1 or -1.
- **Cascade Deletion**: Deleting a question also deletes its related answers.

## Requirements
- Node.js
- PostgreSQL
- Express.js

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/TheYami/backend-skill-checkpoint-express-server
cd backend-skill-checkpoint-express-server
npm i express cors pg nodemon dotenv

-- create questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255)
);

-- create answers table
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT
);

-- create question_votes table
CREATE TABLE IF NOT EXISTS question_votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);

-- create answer_votes table
CREATE TABLE IF NOT EXISTS answer_votes (
    id SERIAL PRIMARY KEY,
    answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);

-- create example questions
DO $$
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO questions (title, description)
        VALUES (
            'Question Title ' || i || ' about ' || CASE
                WHEN i % 10 = 0 THEN 'technology'
                WHEN i % 10 = 1 THEN 'cuisine'
                WHEN i % 10 = 2 THEN 'travelling'
                WHEN i % 10 = 3 THEN 'science'
                WHEN i % 10 = 4 THEN 'literature'
                WHEN i % 10 = 5 THEN 'music'
                WHEN i % 10 = 6 THEN 'sports'
                WHEN i % 10 = 7 THEN 'movies'
                WHEN i % 10 = 8 THEN 'history'
                ELSE 'miscellaneous'
            END,
            'This is a detailed description for question ' || i || '. It covers various aspects of ' || CASE
                WHEN i % 10 = 0 THEN 'technology and its impact on society.'
                WHEN i % 10 = 1 THEN 'different cuisines and their origins.'
                WHEN i % 10 = 2 THEN 'traveling tips and destination reviews.'
                WHEN i % 10 = 3 THEN 'scientific discoveries and research.'
                WHEN i % 10 = 4 THEN 'literature and famous books.'
                WHEN i % 10 = 5 THEN 'different genres of music and artists.'
                WHEN i % 10 = 6 THEN 'various sports and famous athletes.'
                WHEN i % 10 = 7 THEN 'popular movies and reviews.'
                WHEN i % 10 = 8 THEN 'historical events and figures.'
                ELSE 'miscellaneous topics that are worth discussing.'
            END
        );
    END LOOP;
END
$$;
DO $$
DECLARE
    categories TEXT[] := ARRAY['technology', 'cuisine', 'travelling', 'science', 'literature', 'music', 'sports', 'movies', 'history', 'miscellaneous'];
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO questions (title, description, category)
        VALUES (
            'Question Title ' || i || ' about ' || categories[(i % array_length(categories, 1)) + 1],
            'This is a detailed description for question ' || i || '. It covers various aspects of ' || categories[(i % array_length(categories, 1)) + 1],
            categories[(i % array_length(categories, 1)) + 1]
        );
    END LOOP;
END
$$;

-- create example answers
DO $$
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO answers (question_id, content)
        VALUES (
            (SELECT id FROM questions ORDER BY RANDOM() LIMIT 1),
            'Answer ' || i || ' content goes here. It provides an in-depth explanation about ' || CASE
                WHEN i % 10 = 0 THEN 'the latest advancements in technology.'
                WHEN i % 10 = 1 THEN 'the unique flavors of different cuisines.'
                WHEN i % 10 = 2 THEN 'the best travel destinations and tips.'
                WHEN i % 10 = 3 THEN 'recent scientific studies and their implications.'
                WHEN i % 10 = 4 THEN 'famous literary works and authors.'
                WHEN i % 10 = 5 THEN 'different genres of music and popular artists.'
                WHEN i % 10 = 6 THEN 'various sports and famous athletes.'
                WHEN i % 10 = 7 THEN 'popular movies and their reviews.'
                WHEN i % 10 = 8 THEN 'significant historical events and figures.'
                ELSE 'various interesting topics.'
            END
        );
    END LOOP;
END
$$;

-- create example question_votes
DO $$
BEGIN
    FOR i IN 1..200 LOOP
        INSERT INTO question_votes (question_id, vote)
        VALUES (
            (SELECT id FROM questions ORDER BY RANDOM() LIMIT 1),
            CASE
                WHEN RANDOM() > 0.5 THEN 1
                ELSE -1
            END
        );
    END LOOP;
END
$$;

-- create example answer_votes
DO $$
BEGIN
    FOR i IN 1..200 LOOP
        INSERT INTO answer_votes (answer_id, vote)
        VALUES (
            (SELECT id FROM answers ORDER BY RANDOM() LIMIT 1),
            CASE
                WHEN RANDOM() > 0.5 THEN 1
                ELSE -1
            END
        );
    END LOOP;
END
$$;
