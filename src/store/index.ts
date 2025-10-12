// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "../slices/userSlice";
import songReducer from "../slices/songSlice";
import basketReducer from "../slices/basketSlice";
import assetReducer from "../slices/assetSlice";
import transactionReducer from "../slices/transactionSlice";
import portfolioReducer from "../slices/portfolioSlice";
import networkWalletReducer from "../slices/networkWalletSlice";
import orderReducer from "../slices/orderSlice"

const persistConfig = {
  key: "root",
  storage,
};

// Persist only the user slice
const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    songs: songReducer,
    baskets: basketReducer,
    assets: assetReducer,
    transactions: transactionReducer,
    portfolio: portfolioReducer,
    networkWallets: networkWalletReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/REGISTER",
          "persist/PURGE",
          "persist/FLUSH",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
