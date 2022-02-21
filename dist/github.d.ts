import { IIssueData } from './issue';
export interface IRepo {
    owner: string;
    repo: string;
}
export declare class GithubApi {
    private octokit;
    private repo;
    constructor(token: string);
    /**
     * This function is used to add a label to an specific issue
     * @param label Adds a label to an issue, in this case the label is 'trending'
     * @param issueNumber The issue number that references the Github issue
     * @returns Nothing
     */
    addIssueLabel(label: string, issueNumber: number): Promise<void>;
    /**
     * This function is used to get the 10 most trending issues per label specified
     * @param includedLabels The labels that will be used to get the trending issues
     * @returns A list of issues (IIsueData) that are trending per label
     */
    getTrendingIssues(includedLabels: string[]): Promise<IIssueData[]>;
}
