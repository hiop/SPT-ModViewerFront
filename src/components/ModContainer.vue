<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {getServerData, getSptMods, postActiveProfile, postServerMod} from "@/api/api-client.ts";
import type {SPTClientMod, SPTServerMod} from "@/api/api-types.ts";
import SptMod from "@/components/SptMod.vue";
import {useGlobalStore, useSptFilterStore, useSptModStore} from "@/store";
import {SptModState} from "@/types/spt-types.ts";
import {getKeyByValue, getModState, getModStateColor, sleep} from "@/script/Utils.ts";
import {ModType} from "@/api/api-types.ts";

const loading = ref(false);
const globalStore = useGlobalStore();
const filterStore = useSptFilterStore();
const modStore = useSptModStore();
const modFilter = computed({
  get() {
    return filterStore.getModFilter();
  },
  set(filter) {
    return filterStore.setModFilter(filter);
  }
});

const mods = computed(() => {
  return modStore.getMods()
})

const clientMods = computed((): SPTClientMod[] => {
  if (!mods.value?.sptClientMods) return [];

  const _mods = mods.value?.sptClientMods[modFilter.value.activeProfile ?? '?NAME?'] ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
      .filter((m: SPTClientMod) => modFilter.value.availableMods.includes(getKeyByValue(ModType, ModType.CLIENT)))
      .filter((m: SPTClientMod) => m.visible !== false)
      .filter((m: SPTClientMod) => JSON.stringify(m).toLowerCase().includes(_search.toLowerCase()))
      .filter((m: SPTClientMod) => {
        const forgeMode = mods.value!.sptForgeMods!.find(f => {
          const guid = m?.forceGuid ?? m?.guid
          return f.guid === guid
        });

        if (modFilter.value?.modState === SptModState.ANY) return true;

        const lastVersion = forgeMode?.sptVersions[forgeMode.sptVersions?.length - 1];
        return modFilter?.value.modState === getModState(m, lastVersion);
      })
})

const getAllMods = async() => {
  return getSptMods().then((response) => {
    modStore.setMods(response);
  })
}

onMounted(async () => {
  filterStore.fixModType020();

  try {
    await postActiveProfile();
    await postServerMod();
  }catch(e){
    globalStore.setMessage(e?.message)
  }

  getServerData().then((data) =>{
    modStore.sptServerVersion = data!.data!.sptServerVersion as string;
  })

  await getAllMods();
})

const serverMods = computed(() => {
  const _mods = mods.value?.sptServerMods ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
      .filter((m: SPTServerMod) => modFilter.value.availableMods.includes(getKeyByValue(ModType, ModType.SERVER)))
      .filter((m: SPTServerMod) => m.visible !== false)
      .filter((m: SPTServerMod) => JSON.stringify(m).toLowerCase().includes(_search.toLowerCase()))
      .filter((m: SPTServerMod) => {
        const forgeMode = mods.value!.sptForgeMods!.find(f => {
          const guid = m?.forceGuid ?? m?.guid
          return f.guid === guid
        });

        if (modFilter.value?.modState === SptModState.ANY) return true;

        const lastVersion = forgeMode?.sptVersions[forgeMode.sptVersions?.length - 1];
        return modFilter?.value.modState === getModState(m, lastVersion);
      })
})

const modsInFilter = computed(() => {
  return serverMods.value.length + clientMods.value.length;
});

const SyncAllModsByFilter = async () => {
  loading.value = true;
  let counter = modsInFilter.value;

  for (let s = 0; s < serverMods.value.length; s++) {
    const mod = serverMods.value[s];
    globalStore.setMessage(`Try sync mod ${mod.name} (${counter})`)

    await modStore.updateForgeMod(mod).finally(() => {
      counter--;
    })
    await sleep(2000);
  }

  for (let c = 0; c < clientMods.value.length; c++) {
    const mod = clientMods.value[c];
    globalStore.setMessage(`Try sync mod ${mod.name} (${counter})`)

    await modStore.updateForgeMod(mod).finally(() => {
      counter--;
    })
    await sleep(2000);
  }

  loading.value = false;
  globalStore.setMessage(`Sync done!`);
}


</script>

<template>
  <div class="h-100">
    <div class="d-flex align-center">
      <div>
        <v-select
            v-model="modFilter.availableMods"
            :loading="loading"
            :disabled="loading"
            :items="Object.keys(ModType)"
            width="300"
            label="Mod types"
            variant="outlined"
            density="compact"
            hide-details="auto"
            multiple
        />
      </div>
      <div>
        <v-select
            v-if="modFilter.availableMods.includes(getKeyByValue(ModType, ModType.CLIENT))"
            v-model="modFilter.activeProfile"
            :items="Object.keys(mods?.sptClientMods ?? {})"
            :loading="loading"
            :disabled="loading"
            class="ml-2"
            width="300"
            label="Player profile"
            variant="outlined"
            density="compact"
            hide-details="auto"
            clearable
        />
      </div>
      <div>
        <v-select
            v-model="modFilter.modState"
            :items="Object.values(SptModState)"
            :loading="loading"
            :disabled="loading"
            class="ml-2"
            width="300"
            variant="outlined"
            density="compact"
            hide-details="auto"
            label="Mod state"
        >
          <template #item="{item, props}">
            <v-list-item v-bind="props">
              <template #title>
                <div class="d-flex justify-space-between align-center">
                  <div>{{item.value}}</div>
                  <div v-if="item.value != 'ANY'" style="border-bottom: 5px" :style="{
                    'border': item.value === SptModState.UNINSTALLED ? 'dashed' : 'solid', 'border-color': getModStateColor(item.value)}">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                </div>
              </template>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <div>
        <v-text-field
            v-model="modFilter.search"
            :loading="loading"
            :disabled="loading"
            class="ml-2"
            width="300"
            variant="outlined"
            density="compact"
            label="Search"
            hide-details="auto"
            clearable
        />
      </div>
      <div>
        <v-checkbox
            v-model="modFilter.needThumbnail"
            height="40"
            color="success"
            label="Thumbnail"
            hide-details="auto"
        />
      </div>
      <div>
        <v-btn
            v-tooltip:bottom="`Updates data for mods (via forge api) selected using the filter settings. The number of mods that will be processed is indicated in brackets.`"
            :loading="loading"
            class="ml-4"
            height="40"
            color="success"
            variant="flat"
            @click="SyncAllModsByFilter">SYNC FROM FORGE ({{ modsInFilter }})
        </v-btn>
      </div>

    </div>

    <div class="h-100 d-flex flex-wrap">
      <SptMod
          v-for="mod in serverMods"
          :server-mod="mod"
          :forge-mods="mods?.sptForgeMods"
          :key="JSON.stringify(mod)"
          style="width: 20%"
          @mod-changed="getAllMods"
      />

      <template v-if="modFilter.activeProfile">
        <SptMod
            v-for="cmod in clientMods"
            :key="JSON.stringify(cmod)"
            :client-mod="cmod"
            :forge-mods="mods!.sptForgeMods"
            @mod-changed="getAllMods"
            style="width: 20%"
        />
      </template>

    </div>
  </div>
</template>
