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

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
    songs: songReducer,
    baskets: basketReducer,
    assets: assetReducer,
    transactions: transactionReducer,
    portfolio: portfolioReducer,
    networkWallets: networkWalletReducer,
  },
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
