import { ViewOutput } from "@slack/bolt";
import { threadRepo } from "../../module/thread";
import { viewInputReader } from "../../utils";


export const keywordsParser = (keywords: string|null|undefined) => {
    if(!keywords) {
        return []
    }
    return keywords.split(',')
}

export const stringParser = (string: string|null|undefined) => {
    if(!string) {
        return ''
    }
    // replace all "+" with space
    return string.replace(/\+/g, ' ')

}

export const saveFromSaveChatView = async (view: ViewOutput) => {
    const values = viewInputReader(view);
    const threadDetails = {
        title: stringParser(values.title),
        keywords: keywordsParser(values.keywords),
        description: stringParser(values.description)
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