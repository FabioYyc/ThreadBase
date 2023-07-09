
export interface ITeamFormValues {
    team_name: string;
    team_description: string;
    team_members: {
        selected_users: string[];
    };
}

