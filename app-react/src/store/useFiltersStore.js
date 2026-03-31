import { useReducer, useCallback } from 'react';

const initialState = {
  filters: [],
};

function filtersReducer(state, action) {
  switch (action.type) {
    case 'ADD_FILTER': {
      const newFilter = {
        id: Date.now() + Math.random(),
        fieldId: action.payload.fieldId,
        label: action.payload.label,
        value: action.payload.value,
        zone: action.payload.zone, // 'include' | 'exclude'
        op: action.payload.op || 'ТА',
        fieldOp: action.payload.fieldOp || 'точне',
        parentId: action.payload.parentId || null,
        visibility: action.payload.visibility || 'universal',
      };
      return { ...state, filters: [...state.filters, newFilter] };
    }
    case 'REMOVE_FILTER': {
      const idToRemove = action.payload.id;
      // Remove the filter and its children
      const idsToRemove = new Set([idToRemove]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const f of state.filters) {
          if (f.parentId && idsToRemove.has(f.parentId) && !idsToRemove.has(f.id)) {
            idsToRemove.add(f.id);
            changed = true;
          }
        }
      }
      return { ...state, filters: state.filters.filter((f) => !idsToRemove.has(f.id)) };
    }
    case 'UPDATE_FILTER': {
      return {
        ...state,
        filters: state.filters.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        ),
      };
    }
    case 'CLEAR':
      return { ...state, filters: [] };
    case 'REORDER': {
      const { zone, orderedIds } = action.payload;
      const zoneFilters = state.filters.filter((f) => f.zone === zone);
      const otherFilters = state.filters.filter((f) => f.zone !== zone);
      const reordered = orderedIds
        .map((id) => zoneFilters.find((f) => f.id === id))
        .filter(Boolean);
      return { ...state, filters: [...otherFilters, ...reordered] };
    }
    default:
      return state;
  }
}

export function useFiltersStore() {
  const [state, dispatch] = useReducer(filtersReducer, initialState);

  const addFilter = useCallback((payload) => dispatch({ type: 'ADD_FILTER', payload }), []);
  const removeFilter = useCallback((id) => dispatch({ type: 'REMOVE_FILTER', payload: { id } }), []);
  const updateFilter = useCallback(
    (id, updates) => dispatch({ type: 'UPDATE_FILTER', payload: { id, updates } }),
    []
  );
  const clearFilters = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const reorderFilters = useCallback(
    (zone, orderedIds) => dispatch({ type: 'REORDER', payload: { zone, orderedIds } }),
    []
  );

  const includeFilters = state.filters.filter((f) => f.zone === 'include');
  const excludeFilters = state.filters.filter((f) => f.zone === 'exclude');

  return {
    filters: state.filters,
    includeFilters,
    excludeFilters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    reorderFilters,
  };
}
