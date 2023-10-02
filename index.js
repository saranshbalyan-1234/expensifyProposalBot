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

schedule.scheduleJob('*/10 * * * *', async function () {
  console.log("Refreshing Proposals")
  proposals = await Proposal.findAll()
})

schedule.scheduleJob('*/20 * * * * *', async function () {
  console.log("Fetching Records")
  const { data } = await axios.get(`https://api.github.com/repos/saranshbalyan-1234/assignment/issues?per_page=30&labels=Help%20Wanted`, {
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
      return data.find(async issue => {
        const found = issue.title.includes(proposal.search)
        console.log(issue.title, proposal.search)
        if (found) {
          console.log("Proposal Matched", proposal.search)
          console.log("Issue Macthed", issue.title)
          await axios.post(issue.comments_url, { body: proposal.proposal }, {
            headers: {
              'Authorization': `Bearer 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`,
              'User-Agent': 'request'
            }
          })

          await Proposal.destroy({ where: { search: proposal.search } })
          proposals = await Proposal.findAll()
          return true
        }
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
