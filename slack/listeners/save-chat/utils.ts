import { ViewOutput } from "@slack/bolt";
import { threadRepo } from "../../../modules/thread";
import { stringInputParser, viewInputReader } from "../../utils";


export const keywordsParser = (keywords: string|null|undefined) => {
    if(!keywords) {
        return []
    }
    return keywords.split(',')
}


export const saveFromSaveChatView = async (view: ViewOutput) => {
    const values = viewInputReader(view);
    const teams = values.teams.selected_options?.map((option:any) => option.value) || []
    const threadDetails = {
        title: stringInputParser(values.title),
        description: stringInputParser(values.description),
        teams
    }

    if(!view.external_id) {
        throw new Error('Missing external id')
    }
    const thread = await threadRepo.addDetailFields(threadDetails, view.external_id)
    if(!thread) {
        throw new Error('Thread not found')
    }
    return thread;
}