import type { History } from 'history';

import { persistOnPageHide, getSessionState } from './persist';
import { ActionTypes, type AppRouterState, type Options } from './types';

import {
  parseLocation,
  isSameRoute,
  isPreviousRoute,
  isNextRoute
} from './helpers'

const getInitialState = (history: History, { storageKey }: Options): AppRouterState => {
  const location = parseLocation(history.location);
  const defaultState: AppRouterState = {
    action: ActionTypes.Push,
    locationHistory: [ location ],
    currentIndex: 0,
    isSkipping: false,
  };

  const sessionRouterState = getSessionState(storageKey);
  const initialState = sessionRouterState || defaultState;

  if (sessionRouterState) {
    const isRefresh = isSameRoute(location, initialState.locationHistory, initialState.currentIndex);

    if (!isRefresh) {
      const isPreviousLocation = isPreviousRoute(location, initialState.locationHistory, initialState.currentIndex);
      const isNextLocation = isNextRoute(location, initialState.locationHistory, initialState.currentIndex);
      const isNewLocation = !isPreviousLocation && !isNextLocation;

      if (isPreviousLocation) {
        initialState.currentIndex -= 1;
        initialState.action = ActionTypes.Back;
      }

      if (isNextLocation) {
        initialState.currentIndex += 1;
        initialState.action = ActionTypes.Forward;
      }

      if (isNewLocation) {
        initialState.currentIndex += 1;
        initialState.action = ActionTypes.Push;
        initialState.locationHistory.splice(initialState.currentIndex, initialState.locationHistory.length, location);
      }
    }

    initialState.isSkipping = false;
  }

  persistOnPageHide(initialState, { storageKey });

  return initialState;
};

export default getInitialState;
