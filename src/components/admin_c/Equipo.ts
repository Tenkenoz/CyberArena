export interface Jugador {
  nombre: string;
  cedula: string;
  rol: string;
  invocador: string;
}

export interface Equipo {
  id: string;
  nombre_equipo: string;
  region_servidor: string;
  capitan_invocador: string;
  capitan_contacto: string;
  jugador1: Jugador;
}
