import * as core from '@actions/core';
import { GithubApi } from './github';
import { IIssueData } from './issue';

async function run() {

  const token = core.getInput('github-token');
  const github: GithubApi = new GithubApi(token);
  let amountTrending: number = Number(core.getInput('quantity'));
  const includedLabels = core.getInput('included-labels').replace(/[\[\]\s]/g, '').split(',');
  const trendingIssues: IIssueData[] = await github.getTrendingIssues(includedLabels);
  core.info(`${trendingIssues.length} issues found`);
  core.info(JSON.stringify(trendingIssues));
  if (trendingIssues.length < amountTrending) {
    amountTrending = trendingIssues.length;
  }
  for (let i = 0; i < amountTrending; i++) {
    const issue: IIssueData = trendingIssues[i];
    core.info(`${issue.issueNumber}: ${issue.title}`);
    const issueNumber: number = issue.issueNumber;
    github.addIssueLabel('trending', issueNumber);
    core.info(`Issue #${issueNumber} is labeled as trending`);
  }
  core.setOutput('trending-issues', JSON.stringify(trendingIssues));
}

run().catch(error => {
  core.setFailed(error.message);
});
