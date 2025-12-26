export enum SptModState {
    ANY = 'ANY',
    UPDATED = 'UPDATED',
    OUTDATED = 'OUTDATED',
    UNDEFINED = 'UNDEFINED'
}

export interface SptModFilter {
    modState?: SptModState;
    activeProfile?: string;
    search?: string;
}