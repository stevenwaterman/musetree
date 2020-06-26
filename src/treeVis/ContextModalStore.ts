import { writable, Writable } from "svelte/store";
import { BranchStore, NodeStore, root, TreeStore } from "../state/trackTree";

type StoreConfig_Root = {
  type: "root";
  nodeStore: TreeStore;
}

type StoreConfig_Branch = {
  type: "branch",
  parentStore: NodeStore;
  nodeStore: BranchStore;
}

export type ContextModalState = {
  coordinates: [number, number];
  stores: StoreConfig_Root | StoreConfig_Branch
} | null;

export const contextModalStore: Writable<ContextModalState> = writable(null);
