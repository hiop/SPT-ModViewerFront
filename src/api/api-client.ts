// Auto-generated API client by SPT.BridgeUI.TypeGen
// Do not edit manually - regenerate using: spt-bridgeui-typegen

import type {
  ApiResponse,
  ForgeModUpdate, HideClientMod, SPTForgeMod, SptModResponse,
} from './api-types';

/**
 * Update mod with forge if possible
 * POST /smv/api/forge-mod
 */
export async function updateModByForge(request: ForgeModUpdate): Promise<ApiResponse<SPTForgeMod>> {
  const response = await fetch('/smv/api/forge-mod', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get all mods from SPT mod list.
 * GET /smv/api/mods
 */
export async function getSptMods(): Promise<ApiResponse<SptModResponse>> {
  const response = await fetch('/smv/api/mods');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Add all mods if any active profile
 * POST /smv/api/mod/active-profile
 */
export async function postActiveProfile(): Promise<ApiResponse<{success: boolean}>> {
  const response = await fetch('/smv/api/mod/active-profile', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Add all mods on server
 * POST /smv/api/mod/server
 */
export async function postServerMod(): Promise<ApiResponse<{success: boolean}>> {
  const response = await fetch('/smv/api/mod/server', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Hide profile mod
 * POST /smv/api/mod/profile/hide
 */
export async function hideProfileMod(request: HideClientMod): Promise<ApiResponse<{success: boolean}>> {
  const response = await fetch('/smv/api/mod/profile/hide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}