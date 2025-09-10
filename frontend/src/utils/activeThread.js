// src/utils/activeThread.js
const state = { type: null, id: null }; // type: 'direct' | 'group' | null

export function setActiveThread(type, id) {
  state.type = type || null;
  state.id = id || null;
}
export function clearActiveThread() {
  state.type = null; state.id = null;
}
export function getActiveThread() {
  return { ...state };
}
