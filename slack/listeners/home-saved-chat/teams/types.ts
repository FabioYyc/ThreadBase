
export interface ITeamFormValues {
    team_name: string;
    team_description: string;
    team_members: {
        selected_users: string[];
    };
}


export type Team = {
    ownerId: string;
    teamName: string;
    teamDescriptions: string;
    teamUsers: string[];
    orgId: string;
}
