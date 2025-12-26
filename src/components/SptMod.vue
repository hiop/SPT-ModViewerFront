<script setup lang="ts">
import type {HideClientMod, SPTClientMod, SPTForgeMod, SPTServerMod} from "@/api/api-types.ts";
import {computed, ref} from "vue";
import {useGlobalStore, useSptFilterStore, useSptModStore} from "@/store";
import {SptModState} from "@/types/spt-types.ts";
import defaultBg from "@/assets/default_bg.svg";
import {hideProfileMod} from "@/api/api-client.ts";

interface Props {
  clientMod?: SPTClientMod
  serverMod?: SPTServerMod
  forgeMods?: SPTForgeMod[]
}

const globalStore = useGlobalStore();
const sptFilterStore = useSptFilterStore();
const sptModStore = useSptModStore();

const props = defineProps<Props>();
const clientMod = props.clientMod;
const serverMod = props.serverMod;
const forgeMods = computed(() =>{
  return props.forgeMods;
});

const loading = ref(false);

const modIs = computed((): 'SERVER' | 'CLIENT' => {
  return clientMod?.guid ? 'CLIENT' : 'SERVER'
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
  return clientMod?.modVersion ?? serverMod?.modVersion
})

const modGuid = computed(() => {
  return clientMod?.guid ?? serverMod?.guid
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

  sptModStore.updateForgeMod(clientMod ?? serverMod)
      .finally(() => {
        loading.value = false;
  });
}

const hideMod = () =>{
  loading.value = true;

  hideProfileMod({clientName: sptFilterStore?.getModFilter()?.activeProfile, guid: modGuid.value} as HideClientMod).finally(() =>{
    loading.value = false;
  })
}

const modStateColor = computed(() => {
  if (forgeModLastVersion.value?.version) {
    return forgeModLastVersion.value?.version === modVersion.value
        ? 'green'
        : 'red';
  }
  return 'grey';
});

// const passByFilter = computed(() => {
//   switch (sptFilterStore.modFilter.modState) {
//     case SptModState.OUTDATED:
//       return modStateColor.value === 'red';
//     case SptModState.UNDEFINED:
//       return modStateColor.value === 'grey';
//     case SptModState.UPDATED:
//       return modStateColor.value === 'green';
//     case SptModState.ANY:
//     default:
//       return true;
//   }
// });

</script>

<template>
  <div>
    <v-card
        :loading="loading"
        class="ma-1"
        variant="outlined"
        :style="{'border': 'solid','border-color': modStateColor}"
    >
      <div>
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
              <v-menu activator="parent" :close-on-click="false" :close-on-back="false" >
                <v-list>
                  <v-list-item value="sync">
                    <template #prepend>
                      <v-icon icon="mdi-update"/>
                    </template>
                    <v-list-item-title @click="updateMod()">Sync information from Forge API</v-list-item-title>
                  </v-list-item>

                  <v-list-item value="hide">
                    <v-list-item-title>
                      <template #prepend>
                        <v-icon icon="mdi-hide"/>
                      </template>
                      <v-list-item-title @click="hideMod()">Hide</v-list-item-title>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>

        </div>
      </v-card-title>

      <v-card-subtitle>
        {{ forgeMod?.teaser ?? modGuid }}
      </v-card-subtitle>

      <v-card-actions>
<!--        <v-chip v-if="forgeModLastVersion" class="font-weight-bold" color="grey" variant="flat">-->
<!--          SPT {{ forgeModLastVersion?.spt_version_constraint }}-->
<!--        </v-chip>-->
        <v-chip :color="modStateColor" variant="flat" density="compact">{{ modIs }}</v-chip>
      </v-card-actions>
    </v-card>
  </div>
</template>