import express from "express";
import helmet from "helmet";
import cors from "cors";
import parser from "body-parser";
import axios from 'axios';
import db from './db.js'
import schedule from 'node-schedule'
const app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);

let proposals = []

const Proposal = db.proposals;
  proposals = await Proposal.findAll()
  
schedule.scheduleJob('*/10 * * * *', async function(){
  console.log("Refreshing Proposals")
  proposals = await Proposal.findAll()
})

schedule.scheduleJob('*/20 * * * * *', async function(){
  console.log("Fetching Records")
 const {data}= await axios.get(`https://api.github.com/repos/${process.env.REPO}/issues?per_page=${process.env.PER_PAGE}&labels=${process.env.LABELS}`)
 .catch(err=>{
  console.log(err)
})
// console.log(data)

const isFound = proposals.find(proposal=>{
    return data.find(issue=>{
     const found =  issue.title.includes(proposal.search)
     console.log(issue.title,proposal.search)
     if(found){
      console.log("Proposal Matched",proposal.search)
      console.log("Issue Macthed",issue.title)
      axios.post(issue.comments_url,{body:proposal.proposal},{headers:{
        'Authorization':`Bearer ${process.env.GHToken}`,
        'User-Agent': 'request'
      }})
      .then(()=>{
        console.log("Proposal Submitted")
        Proposal.destroy({where:{search:proposal.search}})
      })
      .catch(err=>{
        console.log("Error in posting Proposal",err)
      })
      return true
     }
    })
  })
  console.log(isFound?"": "No Proposal Found")
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
