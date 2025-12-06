import { Equipo } from "../admin_c/Equipo";

const validateRequired = (value: string) => !!value?.length;

export function validateEquipo(equipo: Partial<Equipo>) {
  return {
    nombre_equipo: !validateRequired(equipo.nombre_equipo || '')
      ? 'El nombre del equipo es obligatorio'
      : '',
    capitan_invocador: !validateRequired(equipo.capitan_invocador || '')
      ? 'El nombre de invocador del capitán es obligatorio'
      : '',
  };
}
