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
.catch(()=>{
  console.log("error in fetching proposal")
})


schedule.scheduleJob('* * * * *', async function () {
  console.log("Refreshing Proposals")
  proposals = await Proposal.findAll()
  .catch(()=>{
    console.log("error in fetching proposal")
  })
})

schedule.scheduleJob('*/5 * * * * *', async function () {
  console.log("Fetching Issues")
  const { data } = await axios.get(`https://api.github.com/repos/Expensify/App/issues?per_page=30&labels=Help%20Wanted`, {
    headers: {
      'Authorization': `Bearer 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`,
      'User-Agent': 'request'
    }
  })
    .catch(err => {
      console.log(err)
    })
  // console.log(data)

  const isFound = proposals.find(proposal => {
    try {
      return data.find(issue => {
        const found = issue.title.includes(proposal.search)
        if (found) {
          console.log("Proposal Matched", proposal.search)
          console.log("Issue Macthed", issue.title)
           axios.post(issue.comments_url, { body: proposal.proposal }, {
            headers: {
              'Authorization': `Bearer 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`,
              'User-Agent': 'request'
            }
          })
          .then(()=>{
            Proposal.destroy({ where: { search: proposal.search } })
            .then(()=>{
              Proposal.findAll()
              .then(res=>{
                proposals =res
                return true
              })
            })
          })
        }
        return false
      })
    } catch (err) {
      console.log(err)
    }
  })
  console.log(isFound ? "" : "No Proposal Found")

});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
