import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

answersRouter.post('/:answerId/vote', async (req,res) => {
    const answerId = req.params.answerId
    const {vote} = req.body

    if(![1,-1].includes(vote)){
        return res.status(400).json({"message": "Vote must be either +1 or -1"})
    }

    try{
        const results = await connectionPool.query(
            `
                select * from answer_votes where answer_id = $1
            `,
            [answerId]
        )

        if(results.rows.length > 0){
            await connectionPool.query(
                `
                    update answer_votes
                    set vote = $1
                    where answer_id = $2
                `,
                [
                    vote,
                    answerId
                ]
            )

            return res.status(200).json({"message": `Vote updated successfully for answer id ${answerId}`});

        }else{
            await connectionPool.query(
                `
                    insert into answer_votes(answer_id, vote)
                    values($1, $2)
                `,
                [
                    answerId,
                    vote
                ]
            )

            return res.status(201).json({"message": `Vote added successfully for answer id ${answerId}`});
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({"message": "Error occurred while processing the vote"});
    }
})


export default answersRouter