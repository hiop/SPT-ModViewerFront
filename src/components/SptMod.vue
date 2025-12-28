<script setup lang="ts">
import type {HideClientMod, SPTClientMod, SPTForgeMod, SptModType, SPTServerMod} from "@/api/api-types.ts";
import {ModType} from "@/api/api-types.ts";
import {computed, ref} from "vue";
import {useSptFilterStore, useSptModStore} from "@/store";
import defaultBg from "@/assets/default_bg.svg";
import {hideProfileMod, hideServerMod} from "@/api/api-client.ts";
import {SptModState} from "@/types/spt-types.ts";
import {getKeyByValue, getModState, getModStateColor} from "@/script/Utils.ts";

interface Props {
  clientMod?: SPTClientMod
  serverMod?: SPTServerMod
  forgeMods?: SPTForgeMod[]
}

const filterStore = useSptFilterStore();
const modStore = useSptModStore();
const emits = defineEmits(['modChanged']);

const loading = ref(false);
const props = defineProps<Props>();
const clientMod = props.clientMod;
const serverMod = props.serverMod;
const editGuidDialog = ref(false);
const forceGuidValue = ref('');

const filter = computed(() =>{
  return filterStore.getModFilter();
})

const forgeMods = computed(() =>{
  return props.forgeMods;
});

const modIs = computed((): 'SERVER' | 'CLIENT' => {
  return clientMod?.guid ? getKeyByValue(ModType, ModType.CLIENT) : getKeyByValue(ModType, ModType.SERVER)
})

const isModType = computed((): SptModType => {
  return clientMod?.guid ? ModType.CLIENT : ModType.SERVER
})

const modName = computed(() => {
  return clientMod?.name ?? serverMod?.name
})

const shortModName = computed(() => {
  if (modName.value?.length && modName.value?.length > 20) {
    return modName.value?.substring(0, 20) + '...'
  }

  return modName.value
})

const modVersion = computed(() => {
  const mod = clientMod?.modVersion ? clientMod : serverMod;

  if(mod?.modVersion === mod.forceModVersion?.modVersion){
    return mod.forceModVersion?.forceVersion;
  }

  return clientMod?.modVersion ?? serverMod?.modVersion
})

const modGuid = computed(() => {
  const mod =  clientMod ?? serverMod;

  return mod?.forceGuid ?? mod?.guid ?? null;
})

const forgeMod = computed(() => {
  return forgeMods.value?.find(f => f.guid === modGuid.value)
})

const forgeModLastVersion = computed(() => {
  if (!forgeMod.value?.sptVersions) return null;
  return forgeMod.value.sptVersions[forgeMod.value.sptVersions?.length - 1];
})

const updateMod = () => {
  loading.value = true;

  modStore.updateForgeMod(clientMod ?? serverMod)
      .finally(() => {
        loading.value = false;
  });
}

const setModGuid = () => {
  loading.value = true;

  modStore.setModGuid(
      isModType.value,
      isModType.value === ModType.CLIENT ? clientMod : serverMod,
      forceGuidValue.value
  )
      .then(() => {
        editGuidDialog.value = false;
        emits('modChanged');
      })
      .finally(() => {
        loading.value = false;
      })
}

const setUseLastModVersion = () => {
  loading.value = true;

  modStore.useLastModVersion(
      isModType.value,
      forgeModLastVersion.value,
      isModType.value === ModType.CLIENT ? clientMod : serverMod
  )
      .then(() => {
        emits('modChanged');
      })
      .finally(() => {
        loading.value = false;
      })
}

const hideMod = () =>{
  loading.value = true;

  if(clientMod?.guid){
    hideProfileMod({clientName: filter.value.activeProfile, guid: modGuid.value} as HideClientMod)
        .then((data) =>{
          if(!data.success) return;
          modStore.hideClientMod(filter.value?.activeProfile, clientMod);
        })
        .finally(() =>{
      loading.value = false;
    })
  }else{
    hideServerMod({guid: serverMod!.guid})
        .then((data) =>{
          if(!data.success) return;

          modStore.hideServerMod(serverMod)
        })
        .finally(() =>{
      loading.value = false;
    })
  }

}

const modState = computed(() => {
  return getModState(clientMod?.guid ? clientMod : serverMod, forgeModLastVersion.value);
});

const modStateColor = computed(() => {
  return getModStateColor(modState.value);
});

</script>

<template>
  <div>
    <v-card
        :loading="loading"
        class="mr-2 mb-2"
        variant="outlined"
        :style="{
          'border': modState === SptModState.UNINSTALLED ? 'dashed' : 'solid',
          'border-color': modStateColor
        }"
    >
      <div v-if="filter.needThumbnail">
        <v-img
            height="300px"
            :src="forgeMod?.thumbnail ? forgeMod.thumbnail : defaultBg"
        ></v-img>
      </div>

      <v-card-title>
        <div class="d-flex justify-space-between">
          <div class="d-flex align-center" v-tooltip="`${modName} ${modVersion}`">
            <template v-if="forgeMod && forgeMod.detail_url">
              <a target="_blank" :href="forgeMod.detail_url">{{ shortModName }} {{ modVersion }}</a>
            </template>
            <template v-else>
              {{ shortModName }} {{ modVersion }}
            </template>
          </div>

          <div>
            <v-btn
                v-tooltip="`Menu`"
                variant="text"
                icon
                size="small"
                :loading="loading"
            >
              <v-icon icon="mdi-dots-vertical"/>
              <v-menu activator="parent">
                <v-list>
                  <v-list-item class="mt-2" value="sync" @click="updateMod()" >
                    <template #prepend>
                      <v-icon color="success" icon="mdi-update"/>
                    </template>
                    <v-list-item-title >Sync data from Forge API</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                      v-tooltip:bottom="`When sync data, a mod may not be found on the Forge website. This happens because the mod file contains an incorrect GUID. You can change this!`"
                      value="set-guid"
                      @click="editGuidDialog = !editGuidDialog"
                  >
                    <template #prepend>
                      <v-icon color="success" icon="mdi-identifier"/>
                    </template>
                    <v-list-item-title>
                      <v-list-item-title>Change GUID</v-list-item-title>
                    </v-list-item-title>
                  </v-list-item>

                  <v-divider class="mt-2 mb-2"/>

                  <v-list-item class="mt-2"  value="hide" @click="hideMod()">
                    <template #prepend>
                      <v-icon color="warning"  icon="mdi-eye-remove"/>
                    </template>
                    <v-list-item-title>
                      <v-list-item-title >Hide</v-list-item-title>
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                      v-if="modState === SptModState.OUTDATED"
                      v-tooltip:bottom="`Click the button if you are update/use latest version of mod. The mod version and the version on the Forge website may differ. Sometimes the developer makes changes to the mod but doesn't change the version number.`"
                      value="use-last"
                      @click="setUseLastModVersion()">
                    <template #prepend>
                      <v-icon color="warning"  icon="mdi-equal"/>
                    </template>
                    <v-list-item-title>
                      <v-list-item-title>I have {{forgeModLastVersion?.version}} version!</v-list-item-title>
                    </v-list-item-title>
                  </v-list-item>

                </v-list>
              </v-menu>
            </v-btn>
          </div>

        </div>

        <v-dialog v-model="editGuidDialog" width="500px">

          <template v-slot:default="{ isActive }">
            <v-card :title="`Change GUID for ${modName}`">
              <v-card-text>
                <ol class="ml-5 mb-2">
                  <li>Go to <a href="https://forge.sp-tarkov.com/mods" target="_blank">https://forge.sp-tarkov.com/mods</a>
                    and find right mod.
                  </li>
                  <li>Copy "GUID" value from side panel "Details" and paste it to text field below</li>
                </ol>
                <v-text-field v-model="forceGuidValue"
                              variant="outlined"
                              density="compact"
                              placeholder="example: mod.some.guid"/>
                <v-btn :loading="loading" color="success" :disabled="forceGuidValue.length <= 0" @click="setModGuid">Change</v-btn>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    text="Close"
                    @click="isActive.value = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-card-title>

      <v-card-subtitle>
        {{ forgeMod?.teaser ?? modGuid }}
      </v-card-subtitle>

      <v-card-actions>
        <v-chip :color="modStateColor" variant="flat" density="compact">{{ modIs }}</v-chip>
        <v-chip v-if="modState === SptModState.OUTDATED" color="green" variant="flat" density="compact">
          {{forgeModLastVersion?.version}}
        </v-chip>
      </v-card-actions>
    </v-card>
  </div>
</template>