import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '../../store/useAuthStore';

// Reset store between tests
beforeEach(() => {
  act(() => {
    useAuthStore.getState().logout();
  });
});

describe('useAuthStore', () => {
  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setUser marks as authenticated', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: '1', name: 'Test', phone: '70000000' });
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.name).toBe('Test');
  });

  it('setToken stores token', () => {
    act(() => {
      useAuthStore.getState().setToken('jwt-token-123');
    });
    expect(useAuthStore.getState().token).toBe('jwt-token-123');
  });

  it('logout clears everything', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: '1', name: 'Test' });
      useAuthStore.getState().setToken('token');
      useAuthStore.getState().setRefreshToken('refresh');
    });
    act(() => {
      useAuthStore.getState().logout();
    });
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('addToQueue and clearQueue work', () => {
    act(() => {
      useAuthStore.getState().addToQueue({ type: 'MESSAGE', data: 'hello' });
    });
    expect(useAuthStore.getState().offlineQueue).toHaveLength(1);
    act(() => {
      useAuthStore.getState().clearQueue();
    });
    expect(useAuthStore.getState().offlineQueue).toHaveLength(0);
  });

  it('togglePharmacy flips isPharmacyOpen', () => {
    expect(useAuthStore.getState().isPharmacyOpen).toBe(false);
    act(() => { useAuthStore.getState().togglePharmacy(); });
    expect(useAuthStore.getState().isPharmacyOpen).toBe(true);
  });
});
