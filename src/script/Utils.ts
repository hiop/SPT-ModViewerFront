import type {SPTClientMod, SPTForgeModVersion, SPTServerMod} from "@/api/api-types.ts";
import {SptModState} from "@/types/spt-types.ts";

/**
 * Get current state by mod data
 * @param mod client/server mod data
 * @param lastVersionFromForge last verion of mod from Forge-API
 */
export const getModState = (mod: SPTServerMod | SPTClientMod, lastVersionFromForge?: SPTForgeModVersion): SptModState => {
    if (lastVersionFromForge?.version) {
        const forceVersion = mod?.forceModVersion?.forceVersion;
        const forceForVersion = mod?.forceModVersion?.modVersion;

        if(forceVersion === lastVersionFromForge?.version && forceForVersion === mod.modVersion){
            return SptModState.UPDATED;
        }

        return mod.modVersion != null && lastVersionFromForge!.version === mod.modVersion
            ? SptModState.UPDATED
            : SptModState.OUTDATED;
    }

    return SptModState.UNDEFINED;
};

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get enum key by value
 * @param enumType
 * @param value
 */
export function getKeyByValue(enumType: any, value: string): string | undefined {
    for (const key of Object.keys(enumType)) {
        if (enumType[key] === value) {
            return key;
        }
    }
    return undefined;
}

/**
 * Get forge id of mod by url
 * @param url
 */
export function getModIdByUrl(url: string): number | undefined {
    const number = url.split('/mod/')[1]?.split('/')[0];
    if (number) {
        return parseInt(number, 10);
    }
    return
}