import * as github from '@actions/github';
import { IIssueData } from './issue';

export interface IRepo {
  owner: string;
  repo: string;
}

export class GithubApi {
  private octokit;
  private repo: IRepo;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
    this.repo = github.context.repo;
  }

  /**
   * This function is used to add a label to an specific issue 
   * @param label Adds a label to an issue, in this case the label is 'trending'
   * @param issueNumber The issue number that references the Github issue
   * @returns Nothing
   */
  public async addIssueLabel(label: string, issueNumber: number) {
    if (!label) return;
    await this.octokit.rest.issues.addLabels({
      ...this.repo,
      issue_number: issueNumber,
      label,
    });
  }
  /**
   * This function is used to get the 10 most trending issues per label specified
   * @param includedLabels The labels that will be used to get the trending issues
   * @returns A list of issues (IIsueData) that are trending per label
   */
  public async getTrendingIssues(includedLabels: string[]): Promise<IIssueData[]> {
    const issuesData = [];
    for (const label of includedLabels) {
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `is:issue is:open label:"${label}"`,
        ...this.repo,
        state: 'open',
        sort: 'comments',
        direction: 'desc',
        per_page: 10,
        labels: label,
      });
      for (const item of data.items) {
        const issueData: IIssueData = {
          issueNumber: item.number,
          title: item.title,
          labels: item.labels.map(label => label.name as string),
          comments: item.comments,
        };
        issuesData.push(issueData);
      }
    }
    issuesData.sort((a, b) => b.comments - a.comments);
    return issuesData;
  }
}
