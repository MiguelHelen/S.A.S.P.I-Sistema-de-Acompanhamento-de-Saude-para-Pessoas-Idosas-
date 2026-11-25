import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../api/client";
import { useAuth } from "./AuthContext";

interface SocketContextData {
  conectado: boolean;
  emitirAtualizacao: (evento: string, payload?: any) => void;
}

const SocketContext = createContext<SocketContextData>({
  conectado: false,
  emitirAtualizacao: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, usuario } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!token || !usuario) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConectado(false);
      return;
    }

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    const entrarSalaIdoso = async () => {
      try {
        const stored = await AsyncStorage.getItem("saspi_active_elderly");
        if (stored) {
          const idoso = JSON.parse(stored);
          if (idoso?.id) {
            socket.emit("join-idoso", { idoso_id: idoso.id });
            socket.emit("entrar-sala", idoso.id);
          }
        }
      } catch {}
    };

    socket.on("connect", () => {
      setConectado(true);
      entrarSalaIdoso();
    });

    socket.on("disconnect", () => {
      setConectado(false);
    });

    // Ouve qualquer evento emitido pelo servidor/site (ex: saspi_elderly_updated, novo-registro-saude, alerta-saude)
    socket.onAny((evento: string, dados: any) => {
      DeviceEventEmitter.emit("saspi_realtime_update", { evento, dados });
    });

    const eventosClinicos = [
      "novo-registro-saude",
      "registro-saude-criado",
      "alerta-saude",
      "nova-prescricao",
      "prescricao-atualizada",
      "nova-consulta",
      "consulta-atualizada",
      "dose-registrada",
      "idoso-atualizado",
    ];

    eventosClinicos.forEach((ev) => {
      socket.on(ev, (dados: any) => {
        DeviceEventEmitter.emit("saspi_realtime_update", { evento: ev, dados });
      });
    });

    const subTrocaIdoso = DeviceEventEmitter.addListener("saspi_elderly_changed", () => {
      entrarSalaIdoso();
    });

    return () => {
      subTrocaIdoso.remove();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, usuario]);

  const emitirAtualizacao = (evento: string, payload?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(evento, payload);
    }
    DeviceEventEmitter.emit("saspi_realtime_update", { evento, dados: payload });
  };

  return (
    <SocketContext.Provider value={{ conectado, emitirAtualizacao }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  return useContext(SocketContext);
}