import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface GenericGameFormProps {
  gameName: string;
  onClose: () => void;
}

// Función auxiliar para mapear el nombre visual al ID de la API
const getGameId = (gameName: string): string => {
  const lower = gameName.toLowerCase();
  if (lower.includes('tft') || lower.includes('teamfight')) return 'tft';
  if (lower.includes('chess') || lower.includes('ajedrez')) return 'chess';
  if (lower.includes('clash') || lower.includes('royale')) return 'clash-royale';
  return '';
};

export const GenericGameForm = ({ gameName, onClose }: GenericGameFormProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    nombreUsuario: '',
  });

  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- NUEVA FUNCIÓN DE VALIDACIÓN ---
  const validateForm = () => {
    // 1. Validar campos de texto
    if (!formData.nombre.trim()) {
      toast.error('Por favor, ingresa tu nombre completo.');
      return false;
    }
    if (!formData.cedula.trim()) {
      toast.error('Por favor, ingresa tu número de cédula.');
      return false;
    }
    if (!formData.telefono.trim()) {
      toast.error('Por favor, ingresa tu número de teléfono.');
      return false;
    }
    if (!formData.nombreUsuario.trim()) {
      toast.error(`Por favor, ingresa tu nombre de usuario en ${gameName}.`);
      return false;
    }

    // 2. Validar selección de radio button
    if (!participadoTorneo) {
      toast.error('Por favor indica si has participado en torneos anteriormente.');
      return false;
    }

    // 3. Validar reglas
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo para continuar.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ejecutamos las validaciones antes de enviar
    if (!validateForm()) return;

    const gameId = getGameId(gameName);
    if (!gameId) {
      toast.error('Error interno: No se pudo identificar el ID del juego.');
      return;
    }

    setLoading(true);

    try {
      // Conexión real a tu API de Cyber Arena
      const response = await fetch(`http://localhost:4000/api/${gameId}/inscripcion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          participadoTorneo: participadoTorneo, // Enviamos el valor seleccionado
          aceptaReglas
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la inscripción');
      }

      toast.success(data.message || `¡Inscripción a ${gameName} enviada exitosamente!`);
      
      // Limpiamos el formulario (opcional, pero recomendado)
      setFormData({ nombre: '', cedula: '', telefono: '', nombreUsuario: '' });
      setParticipadoTorneo('');
      setAceptaReglas(false);
      
      onClose();

    } catch (error: any) {
      console.error('Error de inscripción:', error);
      toast.error(error.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Datos del Participante
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombreUsuario">Nombre de Usuario en {gameName}</Label>
            <Input
              id="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
              placeholder={`Tu ID o nombre en ${gameName}`}
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Participación previa */}
      <div className="space-y-3">
        <Label>¿Has participado en otro torneo?</Label>
        <RadioGroup 
          value={participadoTorneo} 
          onValueChange={setParticipadoTorneo} 
          className="flex gap-6"
          disabled={loading}
        >
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

      {/* Aceptar reglas */}
      <div className="flex items-start space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Checkbox
          id="aceptaReglas"
          checked={aceptaReglas}
          onCheckedChange={(checked) => setAceptaReglas(checked as boolean)}
          required
          disabled={loading}
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