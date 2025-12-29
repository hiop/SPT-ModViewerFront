import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {
    ApiResponse,
    ForceModGuidRequest,
    ForceModVersionRequest,
    ModType,
    SPTClientMod,
    SPTForgeModVersion,
    SptModResponse,
    SPTServerMod
} from "@/api/api-types.ts";
import {setModGuidWithForce, setModVersionWithForce, updateModByForge} from "@/api/api-client.ts";
import {useGlobalStore, useSptFilterStore} from "@/store/index.ts";
import {checkVersion} from "@/script/CheckVersion.ts";


/** Spt Mod Store */
export default defineStore('spt-mod', () => {
        const sptServerVersion = ref('');
        const mods = ref<SptModResponse>({} as SptModResponse);

        const globalStore = useGlobalStore();
        const filterStore = useSptFilterStore();

        const getMods = () => {
            return mods.value
        }

        const setMods = (response: ApiResponse<SptModResponse>) => {
            mods.value = response?.data;

            let serverMods = mods.value?.sptServerMods ?? [];
            serverMods.sort(sortMod);

            let clientMods = mods.value?.sptClientMods ?? {};
            Object.values(clientMods).forEach(mods => mods.sort(sortMod))
        }

        const sortMod = (a: SPTServerMod | SPTClientMod, b: SPTServerMod | SPTClientMod, ) =>{
            const nameA = a?.name?.toLowerCase() ?? 'a';
            const nameB = b?.name?.toLowerCase() ?? 'b';

            return nameA > nameB ? 1 : -1;
        }

        const findLastForgeVersion = (mod?: SPTServerMod | SPTClientMod) => {
            const modGuid = mod?.forceGuid ?? mod!.guid;

            const forgeMod = mods.value?.sptForgeMods?.find(fm => fm.guid === modGuid);

            let lastVersion = undefined;
            for (const version of forgeMod?.sptVersions?.reverse() ?? []) {
                if (checkVersion(version?.spt_version_constraint as '0.0.0', sptServerVersion.value)) {
                    lastVersion = version;
                    break;
                }
            }
            //
            return lastVersion;
        }

        const setModGuid = async (modType: ModType, mod?: SPTServerMod | SPTClientMod, forceGuid: string) => {
            return setModGuidWithForce({
                modType: modType,
                guid: mod?.guid,
                forceGuid: forceGuid,
                clientName: filterStore.modFilter.activeProfile,
            } as ForceModGuidRequest);
        }

        const useLastModVersion = async (modType: ModType, lastVersion: SPTForgeModVersion, mod?: SPTServerMod | SPTClientMod) => {
            return setModVersionWithForce({
                modType: modType,
                modVersion: mod?.modVersion,
                forceVersion: lastVersion.version,
                guid: mod?.guid,
                clientName: filterStore.modFilter.activeProfile,
            } as ForceModVersionRequest);
        }

        const hideClientMod = (clientName?: string, clientMod?: SPTClientMod) => {
            if (!clientName || !clientMod) return;

            const clientMods = mods.value!.sptClientMods![clientName] as SPTClientMod[];
            const mod = clientMods?.find(m => m?.guid === clientMod?.guid);

            if (mod?.guid) {
                mod!.visible = false;
            }
        }

        const hideServerMod = (serverMod?: SPTServerMod) => {
            const mod = mods.value?.sptServerMods?.find(m => m.guid === serverMod?.guid);

            if (mod?.guid) {
                mod!.visible = false;
            }
        }
        const updateForgeMod = async (mod?: SPTServerMod | SPTClientMod) => {
            if (!mod) return

            return updateModByForge({name: mod.name, guid: mod.forceGuid ?? mod.guid})
                .then((result) => {
                    if (result?.success === false && result?.message) {
                        globalStore.setMessage(result?.message + ` | mod=${mod?.name ?? mod.guid}`)
                    } else {
                        const forgeData = result!.data
                        const index = mods.value?.sptForgeMods?.findIndex(f => f.id === forgeData?.id)
                        if (!forgeData) return;

                        if (index && index !== -1) {
                            mods!.value!.sptForgeMods![index] = forgeData;
                        } else {
                            mods.value!.sptForgeMods!.push(forgeData);
                        }
                    }
                })
        }

        return {mods, getMods, setMods, updateForgeMod, hideServerMod, hideClientMod, useLastModVersion, setModGuid, sptServerVersion, findLastForgeVersion}
    }
);
