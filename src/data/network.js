import React, { createContext, useContext, useState, useMemo } from 'react';

// Mock connectivity. Everything in this prototype is local, so nothing truly
// needs the network — but a finished app must handle offline gracefully. This
// provides an app-wide online flag plus a demo toggle (exposed in Settings) so
// the "No connection" states for create actions are real and demonstrable,
// not faked with random failures.
const NetworkContext = createContext({ online: true, setOnline: () => {} });

export function NetworkProvider({ children }) {
  const [online, setOnline] = useState(true);
  const value = useMemo(() => ({ online, setOnline }), [online]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}
