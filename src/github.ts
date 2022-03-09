import * as github from '@actions/github';
export interface IIssueData {
  issueNumber: number;
  title?: string;
  comments: number;
}

export interface IParameter {
  area: string;
  num_issues: number;
}

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
  public async addIssueLabel(label: string[], issueNumber: number) {
    if (!label) return;
    await this.octokit.rest.issues.addLabels({
      owner: this.repo.owner,
      repo: this.repo.repo,
      issue_number: issueNumber,
      labels: label,
    });
  }
  /**
   * This function is used to get the 15 most trending issues per label specified and checks
   * wheter the issue has obtained at least 10 thumbs up votes.
   * @param includedLabels The labels that will be used to get the trending issues
   * @returns A list of issues (IIsueData) that are trending per label
   */
  public async getTrendingIssues(includedLabels: string[]): Promise<IIssueData[]> {
    const issuesData = [];
    for (const label of includedLabels) {
      // Get the 15 most popular issues per label (product) 
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner: this.repo.owner,
        repo: this.repo.repo,
        state: 'open',
        sort: 'comments',
        direction: 'desc',
        per_page: 15,
        labels: label,
      });
      // Geting the reactions for each issue that is candidate for trending
      for (const item of data) {
        const { data } = await this.octokit.rest.reactions.listForIssue({
          owner: this.repo.owner,
          repo: this.repo.repo,
          issue_number: item.number,
          content: '+1',
          per_page: 100,
        });
        if (data) {
          // If the issue has at least 10 thumbs up, it qualifies for trending label
          if (data.length > 10) {
            const issueData: IIssueData = {
              issueNumber: item.number,
              title: item.title,
              comments: item.comments,
            };
            issuesData.push(issueData);
          }  
        }
      }
    }
    issuesData.sort((a, b) => b.comments - a.comments);
    return issuesData;
  }
}
