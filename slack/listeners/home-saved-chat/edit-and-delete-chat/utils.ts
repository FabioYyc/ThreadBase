export enum ChatActions {
    EDIT = 'edit',
    DELETE = 'delete'
}
export const editChatOverflowValue = (threadId: string) => `${ChatActions.EDIT}-${threadId}`;
export const deleteChatOverflowValue = (threadId: string) => `${ChatActions.DELETE}-${threadId}`;
export const parseOverflowActionValue = (value: string) => {
    const [action, threadId] = value.split('-');
    return { action, threadId };
}