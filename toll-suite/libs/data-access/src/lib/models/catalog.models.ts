export interface BaseEntity {
  id: number;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  activo: boolean;
}

export interface Estacion extends BaseEntity {
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
}

export interface Carril extends BaseEntity {
  estacionId: number;
  estacion?: Estacion;
  numero: string;
  tipo: string;
  estado: string;
}

export interface TipoVehiculo extends BaseEntity {
  nombre: string;
  descripcion: string;
  numeroEjes: number;
  tarifaBase: number;
  categoria: string;
  esActivo: boolean;
}

export interface TipoPago extends BaseEntity {
  nombre: string;
  descripcion: string;
  requiereEfectivo: boolean;
  requiereTarjeta: boolean;
  requiereTag: boolean;
  requiereAutorizacion: boolean;
  limiteCredito?: number;
  esActivo: boolean;
}

export interface TipoCliente extends BaseEntity {
  nombre: string;
  descripcion: string;
  descuentoPorcentaje: number;
  tieneDescuento: boolean;
}

export interface Tarifa extends BaseEntity {
  tipoVehiculoId: number;
  tipoVehiculo?: TipoVehiculo;
  estacionId?: number;
  estacion?: Estacion;
  monto: number;
  fechaVigenciaInicio: Date;
  fechaVigenciaFin?: Date;
  esVigente: boolean;
}

export interface Cliente extends BaseEntity {
  nombres: string;
  apellidos: string;
  numeroDocumento?: string;
  tipoDocumento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  tipoClienteId?: number;
  tipoCliente?: TipoCliente;
}

export interface Empleado extends BaseEntity {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  fechaIngreso: Date;
  puesto: string;
  salario: number;
  estacionId?: number;
  estacion?: Estacion;
  estado: string;
  numeroEmergencia?: string;
  observaciones?: string;
}

export interface TarjetaRfid extends BaseEntity {
  numeroTag: string;
  clienteId: number;
  cliente?: Cliente;
  saldo: number;
  fechaEmision: Date;
  fechaVencimiento?: Date;
  estado: string;
  clienteNombre?: string;
  tipoCliente?: string;
  esResidente?: boolean;
  ultimaRecarga?: Date;
  transaccionesRealizadas?: number;
}

export interface Usuario extends BaseEntity {
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  esActivo: boolean;
  roles: string[];
  empleadoId?: number;
  empleado?: Empleado;
}
