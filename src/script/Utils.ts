import type {SPTClientMod, SPTForgeModVersion, SPTServerMod} from "@/api/api-types.ts";
import {SptModState} from "@/types/spt-types.ts";

export const getModState = (mod: SPTServerMod | SPTClientMod, lastVersion?: SPTForgeModVersion) => {
    if (lastVersion?.version) {
        return mod.modVersion != null && lastVersion!.version === mod.modVersion
            ? SptModState.UPDATED
            : SptModState.OUTDATED;
    }
    return SptModState.UNDEFINED;
};

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};