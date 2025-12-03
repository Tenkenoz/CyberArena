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

export const GenericGameForm = ({ gameName, onClose }: GenericGameFormProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    nombreUsuario: '',
  });

  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo');
      return;
    }
    toast.success(`¡Inscripción a ${gameName} enviada exitosamente!`);
    onClose();
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              required
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
            />
          </div>
        </div>
      </div>

      {/* Participación previa */}
      <div className="space-y-3">
        <Label>¿Has participado en otro torneo?</Label>
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
