import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

questionsRouter.get('/', async (req,res) => {

    try{
        const category = req.query.category
        const keyword = req.query.keyword

        let query = `select * from questions`
        let values = [];
        
       if(keyword && category){
        query += ` where title ilike $1 and category ilike $2`;
        values = [`%${keyword}%`,`%${category}%`];

       }else if(keyword){
        query += ` where title ilike $1`;
        values = [`%${keyword}%`];

       }else if(category){
        query += ` where category ilike $1`;
        values = [`%${category}%`]
       }

       const results = await connectionPool.query(query,values)

        return res.status(200).json({data:results.rows})

    }catch(e){

        console.log(e);
        return res.status(500).json({"message": "Server could not read questions because database connection"})
    }
})

questionsRouter.get('/:questionId', async (req,res) => {
    const id = req.params.questionId

    try{
        const results = await connectionPool.query(
            `
                select * from questions where id=$1
            `,
            [id]
        )

        if(!results.rows[0]){
            return res.status(404).json({ "message": "Server could not find a requested question" })
        }

        return res.status(200).json({data:results.rows[0]})

    }catch(e){

        return res.status(500).json({"message": "Server could not read questions because database connection"})
    }
})

questionsRouter.post("/", async (req,res) => {
    const newQuestion = {
        ...req.body,
        created_at : new Date()
    }

    try{
        await connectionPool.query(
            `
                insert into questions(id, title, description, category)
                values($1, $2, $3, $4)
            `,
            [
                newQuestion.id,
                newQuestion.title,
                newQuestion.description,
                newQuestion.category
            ]
        )
        return res.status(200).json({"message":`Question id ${newQuestion.id} has been created sucessfully`})

    }catch(e){

        console.log(e);
        return res.status(500).json({"message": "Server could not create question because database connection"})
    }
})

questionsRouter.put('/:questionId', async (req, res) => {
    const id = req.params.questionId

    const updatedQuestion = {
        ...req.body,
        updated_at: new Date()
    }

    try {
        await connectionPool.query(
            `
                update questions
                set title = $2,
                    description = $3,
                    category = $4
                where id = $1
            `,
            [
                id,
                updatedQuestion.title,
                updatedQuestion.description,
                updatedQuestion.category,
            ]
        )

        return res.status(200).json({ "message": "Updated question successfully" })

    } catch (e) {

        console.log(e);
        return res.status(500).json({ "message": "An error occurred while updating the question in the database." })
    }
})

questionsRouter.delete('/:questionId', async (req,res) => {
    const id = req.params.questionId

    try{
        await connectionPool.query(
            `
                delete from questions where id = $1
            `,
            [id]
        )

        return res.status(200).json({"message":`delete question id ${id} successfully`})

    }catch(e){
        return res.status(500).json({"message": "Server could not delete question because database connection"})
    }
})

questionsRouter.post('/:questionId/answers', async (req,res) => {
    const questionId = req.params.questionId

    try{
        const newAnswer = {
            ...req.body,
            created_at : new Date()
        }

        const results = await connectionPool.query(
            `
                insert into answers(question_id, content)
                values($1, $2) 
            `,
            [
                questionId,
                newAnswer.content
            ]
        )

        if(newAnswer.content.length > 300){
            return res.status(404).json({"message":"Answer content cannot exceed 300 characters"})
        }

        return res.status(200).json({"message":`Answer at question id ${questionId} has been created sucessfully`})

    }catch(e){
        console.log(e);
        return res.status(500).json({"message": "Server could create answers because database connection"})
    }
})


questionsRouter.get('/:questionId/answers', async (req,res) => {
    const questionId = req.params.questionId

    try{
        const results = await connectionPool.query(
            `
                select content
                from answers
                where question_id = $1
            `,
            [questionId]
        )
        
        if(!results.rows[0]){
            return res.status(404).json({"message":`No answers found for the question with id ${questionId}`})
        }

        return res.status(200).json({data:results.rows[0]})

    }catch(e){
        console.log(e);
        return res.status(500).json({"message": "Server could not read questions because database connection"})
    }
})


questionsRouter.delete('/:questionId/answers', async (req,res) => {
    const questionId = req.params.questionId

    try{
        const results = await connectionPool.query(
            `
                delete from questions where id = $1 returning id
            `,
            [questionId]
        )

        if (results.rowCount === 0) {
            return res.status(404).json({
                message: `Question with id ${questionId} not found`
            });
        }

        return res.status(200).json({
            message: `Question with id ${questionId} and its related answers have been deleted successfully.`
        });

    }catch(e){
        console.log(e);
        return res.status(500).json({
            message: "Error occurred while deleting the question and its answers."
        });
    }
})

questionsRouter.post('/:questionId/vote', async (req,res) => {
    const questionId = req.params.questionId
    const {vote} = req.body
    
    if(![1, -1].includes(vote)){
        return res.status(400).json({"message": "Vote must be either +1 or -1"})
    }

    try{
        const results = await connectionPool.query(
            `
                select * from question_votes where question_id = $1
            `,
            [questionId]
        )

        if(results.rows.length > 0){
            await connectionPool.query(
                `
                    update question_votes
                    set vote = $1
                    where question_id = $2
                `,
                [
                    vote,
                    questionId
                ]
            )

            return res.status(200).json({"message": `Vote updated successfully for question id ${questionId}`})

        }else{
            await connectionPool.query(
                `
                    insert into question_votes(question_id, vote)
                    values($1, $2)
                `,
                [
                    questionId,
                    vote
                ]
            )

            return res.status(201).json({"message": `Vote added successfully for question id ${questionId}`});

        }
    }catch(e){
        console.log(e);
        return res.status(500).json({"message": "Error occurred while processing the vote"});
    }
})

export default questionsRouter