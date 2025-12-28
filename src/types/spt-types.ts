import type {SptModType} from "@/api/api-types.ts";

export enum SptModState {
    ANY = 'ANY',
    UPDATED = 'UPDATED',
    OUTDATED = 'OUTDATED',
    UNDEFINED = 'UNDEFINED',
    UNINSTALLED = 'UNINSTALLED'
}

export interface SptModFilter {
    availableMods: SptModType[],
    modState?: SptModState;
    needThumbnail?: boolean;
    activeProfile?: string;
    search?: string;
}