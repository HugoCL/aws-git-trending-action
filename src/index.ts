import * as core from '@actions/core';
import { GithubApi } from './github';
import { IIssueData } from './issue';

async function run() {

  const token = core.getInput('github-token');
  const github: GithubApi = new GithubApi(token);
  const amountTrending: number = Number(core.getInput('quantity'));

  const includedLabels: string[] | undefined = core
    .getInput('included-labels', { required: false })
    .replace(/\[|\]/gi, '')
    .split('|');

  const trendingIssues: IIssueData[] = await github.getTrendingIssues(includedLabels);

  for (let i = 0; i < amountTrending; i++) {
    const issue: IIssueData = trendingIssues[i];
    const issueNumber: number = issue.issueNumber;
    github.addIssueLabel('trending', issueNumber);
    core.info(`Issue #${issueNumber} is labeled as trending`);
  }
  // set labeled output with the trending issues as a json string
  core.setOutput('trending-issues', JSON.stringify(trendingIssues));
}

run().catch(error => {
  core.setFailed(error.message);
});
