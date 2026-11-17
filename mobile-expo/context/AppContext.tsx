import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'idoso' | 'cuidador' | 'familia';
type Ctx = { role: Role; setRole: (r: Role) => void; elderly: string; setElderly: (n: string) => void };

const AppCtx = createContext<Ctx>({ role: 'idoso', setRole: () => {}, elderly: 'Dona Ana Souza', setElderly: () => {} });
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('idoso');
  const [elderly, setElderly] = useState('Dona Ana Souza');
  return <AppCtx.Provider value={{ role, setRole, elderly, setElderly }}>{children}</AppCtx.Provider>;
}
