import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PlayerData {
  nombre: string;
  rol: string;
  cedula: string;
  nombreInvocador: string;
}

interface TeamData {
  nombreEquipo: string;
  regionServidor: string;
  logoEquipo: File | null;
  capitan: string;
  nombreJugador: string;
  numeroContacto: string;
  nombreInvocador: string;
}

const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export const LeagueOfLegendsForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Key para forzar el reinicio visual del formulario (especialmente el input file)
  const [formKey, setFormKey] = useState(0);

  const [teamData, setTeamData] = useState<TeamData>({
    nombreEquipo: '',
    regionServidor: '',
    logoEquipo: null,
    capitan: '',
    nombreJugador: '',
    numeroContacto: '',
    nombreInvocador: '',
  });

  const [players, setPlayers] = useState<PlayerData[]>(
    Array.from({ length: 4 }).map(() => ({ nombre: '', rol: '', cedula: '', nombreInvocador: '' }))
  );

  const [suplente, setSuplente] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [coach, setCoach] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [showSuplente, setShowSuplente] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);
  const [loading, setLoading] = useState(false);

  // Función para resetear el formulario
  const resetForm = () => {
    setTeamData({
      nombreEquipo: '',
      regionServidor: '',
      logoEquipo: null,
      capitan: '',
      nombreJugador: '',
      numeroContacto: '',
      nombreInvocador: '',
    });
    setPlayers(Array.from({ length: 4 }).map(() => ({ nombre: '', rol: '', cedula: '', nombreInvocador: '' })));
    setSuplente({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
    setCoach({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
    setShowSuplente(false);
    setShowCoach(false);
    setParticipadoTorneo('');
    setAceptaReglas(false);
    // Cambiar la key fuerza a React a recrear el componente form, limpiando inputs de archivo
    setFormKey(prev => prev + 1);
  };

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTeamData(prev => ({ ...prev, logoEquipo: file }));
  };

  const validateForm = () => {
    // ejemplo simple de validación: verificar campos obligatorios
    if (!teamData.nombreEquipo.trim()) {
      toast.error('Ingresa el nombre del equipo');
      return false;
    }
    if (!teamData.capitan.trim()) {
      toast.error('Ingresa el nombre del capitán');
      return false;
    }
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.nombre.trim() || !p.rol.trim() || !p.cedula.trim() || !p.nombreInvocador.trim()) {
        toast.error(`Completa los datos del Jugador ${i + 1}`);
        return false;
      }
    }
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // PREPARAMOS EL PAYLOAD JSON (Tu backend espera JSON, no FormData)
      const payload = {
        nombreEquipo: teamData.nombreEquipo,
        regionServidor: teamData.regionServidor,
        // Enviamos el nombre del archivo como string
        logoURL: teamData.logoEquipo ? teamData.logoEquipo.name : "",
        capitan: teamData.capitan,
        nombreJugador: teamData.nombreJugador,
        numeroContacto: teamData.numeroContacto,
        nombreInvocadorTeam: teamData.nombreInvocador,
        jugadores: players,
        suplente: showSuplente ? suplente : null,
        coach: showCoach ? coach : null,
        participadoTorneo: participadoTorneo,
        aceptaReglas: aceptaReglas
      };

      const res = await fetch('http://localhost:4000/api/lol/inscripcion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Header obligatorio
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Respuesta no OK:', res.status, text);
        toast.error('Error al enviar los datos');
        setLoading(false);
        return;
      }

      // --- ÉXITO ---
      // El backend no devuelve JSON en todos los casos según tu código original, 
      // pero si status es ok, procedemos.
      const data = await res.json().catch(() => null);

      toast.success('Registro Exitoso'); // <--- MENSAJE AGREGADO
      resetForm(); // <--- LIMPIAR FORMULARIO
      
      onClose(); // Cerrar modal si aplica
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {/* Datos del equipo */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Datos del Equipo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombreEquipo">Nombre del Equipo</Label>
            <Input
              id="nombreEquipo"
              value={teamData.nombreEquipo}
              onChange={(e) => setTeamData({ ...teamData, nombreEquipo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regionServidor">Región/Servidor</Label>
            <Input
              id="regionServidor"
              value={teamData.regionServidor}
              onChange={(e) => setTeamData({ ...teamData, regionServidor: e.target.value })}
              placeholder="LAN, LAS, NA, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoEquipo">Logo del Equipo</Label>
            <Input
              id="logoEquipo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-2 file:mr-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capitan">Capitán del Equipo</Label>
            <Input
              id="capitan"
              value={teamData.capitan}
              onChange={(e) => setTeamData({ ...teamData, capitan: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreJugador">Nombre del Jugador</Label>
            <Input
              id="nombreJugador"
              value={teamData.nombreJugador}
              onChange={(e) => setTeamData({ ...teamData, nombreJugador: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroContacto">Número de Contacto</Label>
            <Input
              id="numeroContacto"
              type="tel"
              value={teamData.numeroContacto}
              onChange={(e) => setTeamData({ ...teamData, numeroContacto: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombreInvocadorTeam">Nombre de Invocador</Label>
            <Input
              id="nombreInvocadorTeam"
              value={teamData.nombreInvocador}
              onChange={(e) => setTeamData({ ...teamData, nombreInvocador: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Jugadores */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Jugadores (4)
        </h3>

        {players.map((player, index) => (
          <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Jugador {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`player-nombre-${index}`}>Nombre</Label>
                <Input
                  id={`player-nombre-${index}`}
                  value={player.nombre}
                  onChange={(e) => updatePlayer(index, 'nombre', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-rol-${index}`}>Rol</Label>
                <select
                  id={`player-rol-${index}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={player.rol}
                  onChange={(e) => updatePlayer(index, 'rol', e.target.value)}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-cedula-${index}`}>Cédula</Label>
                <Input
                  id={`player-cedula-${index}`}
                  value={player.cedula}
                  onChange={(e) => updatePlayer(index, 'cedula', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-invocador-${index}`}>Nombre de Invocador</Label>
                <Input
                  id={`player-invocador-${index}`}
                  value={player.nombreInvocador}
                  onChange={(e) => updatePlayer(index, 'nombreInvocador', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suplente (Opcional) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showSuplente"
            checked={showSuplente}
            onCheckedChange={(checked) => setShowSuplente(Boolean(checked))}
          />
          <Label htmlFor="showSuplente" className="cursor-pointer">Agregar Suplente (Opcional)</Label>
        </div>

        {showSuplente && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Suplente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="suplente-nombre">Nombre</Label>
                <Input
                  id="suplente-nombre"
                  value={suplente.nombre}
                  onChange={(e) => setSuplente({ ...suplente, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-rol">Rol</Label>
                <select
                  id="suplente-rol"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={suplente.rol}
                  onChange={(e) => setSuplente({ ...suplente, rol: e.target.value })}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-cedula">Cédula</Label>
                <Input
                  id="suplente-cedula"
                  value={suplente.cedula}
                  onChange={(e) => setSuplente({ ...suplente, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-invocador">Nombre de Invocador</Label>
                <Input
                  id="suplente-invocador"
                  value={suplente.nombreInvocador}
                  onChange={(e) => setSuplente({ ...suplente, nombreInvocador: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coach (Opcional) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showCoach"
            checked={showCoach}
            onCheckedChange={(checked) => setShowCoach(Boolean(checked))}
          />
          <Label htmlFor="showCoach" className="cursor-pointer">Agregar Coach (Opcional)</Label>
        </div>

        {showCoach && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Coach</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coach-nombre">Nombre</Label>
                <Input
                  id="coach-nombre"
                  value={coach.nombre}
                  onChange={(e) => setCoach({ ...coach, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-rol">Rol</Label>
                <Input
                  id="coach-rol"
                  value={coach.rol}
                  onChange={(e) => setCoach({ ...coach, rol: e.target.value })}
                  placeholder="Coach"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-cedula">Cédula</Label>
                <Input
                  id="coach-cedula"
                  value={coach.cedula}
                  onChange={(e) => setCoach({ ...coach, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-invocador">Nombre de Invocador</Label>
                <Input
                  id="coach-invocador"
                  value={coach.nombreInvocador}
                  onChange={(e) => setCoach({ ...coach, nombreInvocador: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Información Adicional
        </h3>

        <div className="space-y-3">
          <Label>¿Han participado en otro torneo?</Label>
          <RadioGroup value={participadoTorneo} onValueChange={setParticipadoTorneo} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="torneo-si" />
              <Label htmlFor="torneo-si" className="cursor-pointer">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="torneo-no" />
              <Label htmlFor="torneo-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Aceptar reglas */}
      <div className="flex items-start space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Checkbox
          id="aceptaReglas"
          checked={aceptaReglas}
          onCheckedChange={(checked) => setAceptaReglas(Boolean(checked))}
        />
        <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm">
          Acepto las <a href="#" className="text-primary hover:underline">reglas del torneo</a> y confirmo que toda la información proporcionada es correcta.
        </Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Inscripción'}
        </Button>
      </div>
    </form>
  );
};