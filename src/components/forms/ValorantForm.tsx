import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PlayerData {
  nombre: string;
  cedula: string;
  riotId: string;
}

export const ValorantForm = ({ onClose }: { onClose: () => void }) => {
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [teamData, setTeamData] = useState({
    nombreEquipo: '',
    regionServidor: '',
    logoEquipo: null as File | null,
    capitan: '',
    nombreJugador: '',
    numeroContacto: '',
    riotId: '',
  });

  const [players, setPlayers] = useState<PlayerData[]>(
    Array(4).fill(null).map(() => ({ nombre: '', cedula: '', riotId: '' }))
  );

  const [suplente, setSuplente] = useState<PlayerData>({ nombre: '', cedula: '', riotId: '' });
  const [coach, setCoach] = useState<PlayerData>({ nombre: '', cedula: '', riotId: '' });
  const [showSuplente, setShowSuplente] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);

  const resetForm = () => {
    setTeamData({
      nombreEquipo: '',
      regionServidor: '',
      logoEquipo: null,
      capitan: '',
      nombreJugador: '',
      numeroContacto: '',
      riotId: '',
    });
    setPlayers(Array(4).fill(null).map(() => ({ nombre: '', cedula: '', riotId: '' })));
    setSuplente({ nombre: '', cedula: '', riotId: '' });
    setCoach({ nombre: '', cedula: '', riotId: '' });
    setShowSuplente(false);
    setShowCoach(false);
    setParticipadoTorneo('');
    setAceptaReglas(false);
    setFormKey(prev => prev + 1);
  };

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo');
      return;
    }

    setLoading(true);

    try {
      // 1. Preparar datos JSON
      const dataPayload = {
        nombreEquipo: teamData.nombreEquipo,
        regionServidor: teamData.regionServidor,
        capitan: teamData.capitan,
        nombreJugador: teamData.nombreJugador,
        numeroContacto: teamData.numeroContacto,
        riotIdMain: teamData.riotId, // Mapeo correcto al modelo
        
        jugadores: players,
        suplente: showSuplente ? suplente : null,
        coach: showCoach ? coach : null,
        
        participadoTorneo: participadoTorneo,
        aceptaReglas: aceptaReglas
      };

      // 2. Crear FormData
      const formData = new FormData();
      
      // A) JSON como string en campo 'datos'
      formData.append('datos', JSON.stringify(dataPayload));

      // B) Archivo en campo 'logoEquipo'
      if (teamData.logoEquipo) {
        formData.append('logoEquipo', teamData.logoEquipo);
      }

      // 3. Enviar
      const res = await fetch('http://localhost:4000/api/valorant/inscripcion', {
        method: 'POST',
        body: formData, // El navegador se encarga del Content-Type
      });

      const result = await res.json(); // Intentamos parsear siempre para ver el mensaje

      if (!res.ok) {
        console.error('Error Valorant API:', result);
        toast.error(result.msg || 'Error al enviar la inscripción');
        setLoading(false);
        return;
      }

      toast.success('¡Inscripción de Valorant exitosa!');
      resetForm();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {/* Datos del equipo */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Datos del Equipo (Valorant)
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
              placeholder="LATAM, NA, etc."
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
            <Label htmlFor="riotIdTeam">Riot ID (Main)</Label>
            <Input
              id="riotIdTeam"
              value={teamData.riotId}
              onChange={(e) => setTeamData({ ...teamData, riotId: e.target.value })}
              placeholder="Nombre#TAG"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={player.nombre}
                  onChange={(e) => updatePlayer(index, 'nombre', e.target.value)}
                  required
                />
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
                <Label>Riot ID</Label>
                <Input
                  value={player.riotId}
                  onChange={(e) => updatePlayer(index, 'riotId', e.target.value)}
                  placeholder="Nombre#TAG"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={suplente.nombre}
                  onChange={(e) => setSuplente({ ...suplente, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cédula</Label>
                <Input
                  value={suplente.cedula}
                  onChange={(e) => setSuplente({ ...suplente, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Riot ID</Label>
                <Input
                  value={suplente.riotId}
                  onChange={(e) => setSuplente({ ...suplente, riotId: e.target.value })}
                  placeholder="Nombre#TAG"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={coach.nombre}
                  onChange={(e) => setCoach({ ...coach, nombre: e.target.value })}
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
                <Label>Riot ID</Label>
                <Input
                  value={coach.riotId}
                  onChange={(e) => setCoach({ ...coach, riotId: e.target.value })}
                  placeholder="Nombre#TAG"
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
          onCheckedChange={(checked) => setAceptaReglas(checked as boolean)}
          required
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