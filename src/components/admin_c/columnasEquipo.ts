import { Equipo } from "../admin_c/Equipo";
import { regiones } from "../admin_c/Fake_teams";
import { MRT_ColumnDef } from "material-react-table";

export const getColumns = (
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: (state: any) => void
): MRT_ColumnDef<Equipo>[] => [
  {
    accessorKey: "nombre_equipo",
    header: "Equipo",
    muiEditTextFieldProps: {
      required: true,
      error: !!validationErrors?.nombre_equipo,
      helperText: validationErrors?.nombre_equipo,
      onFocus: () =>
        setValidationErrors((prev: any) => ({
          ...prev,
          nombre_equipo: undefined,
        })),
    },
  },
  {
    accessorKey: "region_servidor",
    header: "Región",
    editVariant: "select",
    editSelectOptions: regiones,
  },
  {
    accessorKey: "capitan_invocador",
    header: "Capitán (Invocador)",
    muiEditTextFieldProps: {
      required: true,
      error: !!validationErrors?.capitan_invocador,
      helperText: validationErrors?.capitan_invocador,
      onFocus: () =>
        setValidationErrors((prev: any) => ({
          ...prev,
          capitan_invocador: undefined,
        })),
    },
  },
  {
    accessorKey: "capitan_contacto",
    header: "Contacto",
    muiEditTextFieldProps: {
      required: true,
    },
  },
  {
    header: "Jugador Top",
    accessorFn: (row) => row.jugador1.invocador,
    enableEditing: false,
  },
];
