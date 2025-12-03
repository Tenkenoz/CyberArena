import { useState } from 'react';
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

const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export const LeagueOfLegendsForm = ({ onClose }: { onClose: () => void }) => {
  const [teamData, setTeamData] = useState({
    nombreEquipo: '',
    regionServidor: '',
    logoEquipo: null as File | null,
    capitan: '',
    nombreJugador: '',
    numeroContacto: '',
    nombreInvocador: '',
  });

  const [players, setPlayers] = useState<PlayerData[]>(
    Array(4).fill(null).map(() => ({ nombre: '', rol: '', cedula: '', nombreInvocador: '' }))
  );

  const [suplente, setSuplente] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [coach, setCoach] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [showSuplente, setShowSuplente] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo');
      return;
    }
    toast.success('¡Inscripción enviada exitosamente!');
    onClose();
  };

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
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
              onChange={(e) => setTeamData({ ...teamData, logoEquipo: e.target.files?.[0] || null })}
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
                <Label>Nombre</Label>
                <Input
                  value={player.nombre}
                  onChange={(e) => updatePlayer(index, 'nombre', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <select
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
                <Label>Cédula</Label>
                <Input
                  value={player.cedula}
                  onChange={(e) => updatePlayer(index, 'cedula', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de Invocador</Label>
                <Input
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
            onCheckedChange={(checked) => setShowSuplente(checked as boolean)}
          />
          <Label htmlFor="showSuplente" className="cursor-pointer">Agregar Suplente (Opcional)</Label>
        </div>
        
        {showSuplente && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Suplente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={suplente.nombre}
                  onChange={(e) => setSuplente({ ...suplente, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={suplente.rol}
                  onChange={(e) => setSuplente({ ...suplente, rol: e.target.value })}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cédula</Label>
                <Input
                  value={suplente.cedula}
                  onChange={(e) => setSuplente({ ...suplente, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de Invocador</Label>
                <Input
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
            onCheckedChange={(checked) => setShowCoach(checked as boolean)}
          />
          <Label htmlFor="showCoach" className="cursor-pointer">Agregar Coach (Opcional)</Label>
        </div>
        
        {showCoach && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Coach</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={coach.nombre}
                  onChange={(e) => setCoach({ ...coach, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Input
                  value={coach.rol}
                  onChange={(e) => setCoach({ ...coach, rol: e.target.value })}
                  placeholder="Coach"
                />
              </div>
              <div className="space-y-2">
                <Label>Cédula</Label>
                <Input
                  value={coach.cedula}
                  onChange={(e) => setCoach({ ...coach, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de Invocador</Label>
                <Input
                  value={coach.nombreInvocador}
                  onChange={(e) => setCoach({ ...coach, nombreInvocador: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Participación previa */}
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
          onCheckedChange={(checked) => setAceptaReglas(checked as boolean)}
          required
        />
        <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm">
          Acepto las <a href="#" className="text-primary hover:underline">reglas del torneo</a> y confirmo que toda la información proporcionada es correcta.
        </Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" variant="hero" className="flex-1">
          Enviar Inscripción
        </Button>
      </div>
    </form>
  );
};
