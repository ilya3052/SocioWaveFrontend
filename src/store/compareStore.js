import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const MAX_COMPARE_IDS = 12;

const useCompareStore = create(
    persist(
        (set) => ({
            compareIds: [],

            addCompareId: (id) => set((state) => ({
                compareIds: state.compareIds.includes(id)
                    ? state.compareIds
                    : state.compareIds.length >= MAX_COMPARE_IDS
                        ? state.compareIds
                        : [...state.compareIds, id]
            })),

            removeCompareId: (id) => set((state) => ({
                compareIds: state.compareIds.filter(item => item !== id)
            })),

            toggleCompareId: (id) => set((state) => ({
                compareIds: state.compareIds.includes(id)
                    ? state.compareIds.filter(item => item !== id)
                    : state.compareIds.length >= MAX_COMPARE_IDS
                        ? state.compareIds
                        : [...state.compareIds, id]
            })),

            clearCompareIds: () => set({compareIds: []}),
        }),
        {
            name: 'compare-storage',
        }
    )
);

export default useCompareStore;