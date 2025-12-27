export enum SptModState {
    ANY = 'ANY',
    UPDATED = 'UPDATED',
    OUTDATED = 'OUTDATED',
    UNDEFINED = 'UNDEFINED'
}

export enum SptModType {
    CLIENT = 'CLIENT',
    SERVER = 'SERVER',
}

export interface SptModFilter {
    availableMods: SptModType[],
    modState?: SptModState;
    needThumbnail?: boolean;
    activeProfile?: string;
    search?: string;
}