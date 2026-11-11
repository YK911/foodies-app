import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CredentialsPayload {
  user: AuthUser | null;
  token: string;
}

interface RehydrateAuthAction {
  type: typeof REHYDRATE;
  key?: string;
  payload?: Partial<AuthState>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuth: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuth = true;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logOut: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      const rehydrateAction = action as RehydrateAuthAction;

      if (rehydrateAction.key !== 'auth') {
        return;
      }

      const token = rehydrateAction.payload?.token ?? null;
      state.token = token;
      state.isAuth = Boolean(token);
    });
  },
});

export const { setCredentials, setUser, setAuthLoading, setAuthError, logOut } = authSlice.actions;

export default authSlice.reducer;
