export interface TurnoTemplate {
  id: number;
  nombre: string;
  descripcion?: string;
  horaInicio: string;
  horaFin: string;
  duracionPlanificada: number;
  factorHoraExtra: number;
  diasSemana: string;
  esTurnoNocturno: boolean;
  esRotativo: boolean;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface Turno {
  id: number;
  turnoTemplateId: number;
  turnoTemplate?: TurnoTemplate;
  empleadoId: number;
  empleado?: any; // Se puede definir mejor si existe el modelo de Empleado
  estacionId: number;
  estacion?: any; // Se puede definir mejor si existe el modelo de Estacion
  fechaTurno: Date;
  horaInicio: Date;
  horaFin?: Date;
  duracionReal?: number;
  montoHorasExtras?: number;
  totalRecaudado?: number;
  estado: TurnoEstado;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface TurnoAsignacion {
  id: number;
  turnoId: number;
  turno?: Turno;
  empleadoId: number;
  empleado?: any;
  fechaAsignacion: Date;
  montoInicialCajaAsignado: number;
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface TurnoEvento {
  id: number;
  turnoId: number;
  turno?: Turno;
  tipoEvento: TipoEventoTurno;
  descripcion: string;
  montoAfectado?: number;
  fechaEvento: Date;
  empleadoId?: number;
  empleado?: any;
  fechaCreacion: Date;
}

export interface TurnoLiquidacion {
  id: number;
  turnoId: number;
  turno?: Turno;
  totalEfectivo: number;
  totalTarjetas: number;
  totalTags: number;
  totalGeneral: number;
  diferenciaCaja: number;
  observaciones?: string;
  fechaLiquidacion: Date;
  liquidadoPor: number;
  empleadoLiquidador?: any;
  fechaCreacion: Date;
}

export enum TurnoEstado {
  Programado = 'Programado',
  EnCurso = 'EnCurso',
  Finalizado = 'Finalizado',
  Cancelado = 'Cancelado',
  NoIniciado = 'NoIniciado'
}

export enum TipoEventoTurno {
  InicioTurno = 'InicioTurno',
  FinTurno = 'FinTurno',
  IncidenciaOperativa = 'IncidenciaOperativa',
  CambioOperador = 'CambioOperador',
  MantenimientoEquipo = 'MantenimientoEquipo',
  SupervisionTurno = 'SupervisionTurno',
  AjusteCaja = 'AjusteCaja',
  EmergenciaOperativa = 'EmergenciaOperativa'
}

// DTOs para operaciones
export interface CreateTurnoTemplateDto {
  nombre: string;
  descripcion?: string;
  horaInicio: string;
  horaFin: string;
  factorHoraExtra: number;
  diasSemana: string;
  esTurnoNocturno: boolean;
  esRotativo: boolean;
}

export interface UpdateTurnoTemplateDto extends Partial<CreateTurnoTemplateDto> {
  activo?: boolean;
}

export interface CreateTurnoDto {
  turnoTemplateId: number;
  empleadoId: number;
  estacionId: number;
  fechaTurno: Date;
  observaciones?: string;
}

export interface TurnoTemplateDto {
  id: number;
  nombre: string;
  descripcion?: string;
  horaInicio: string;
  horaFin: string;
  duracionPlanificada: number;
  factorHoraExtra: number;
  diasSemana: string;
  esTurnoNocturno: boolean;
  esRotativo: boolean;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface AsignarTurnoDto {
  turnoId: number;
  empleadoId: number;
  montoInicialCajaAsignado: number;
  observaciones?: string;
}

export interface FinalizarTurnoDto {
  observaciones?: string;
  montoFinalCaja: number;
}

export interface RegistrarEventoTurnoDto {
  tipoEvento: TipoEventoTurno;
  descripcion: string;
  montoAfectado?: number;
  empleadoId?: number;
}

// Backend Turnos (operativo) - modelos alineados con API /api/Turnos
export interface TurnoBackend {
  id: number;
  empleadoId: number;
  empleadoNombre?: string;
  estacionId: number;
  estacionNombre?: string;
  carrilId?: number;
  fechaInicio: string;
  fechaFin?: string;
  montoInicialCaja: number;
  montoFinalCaja?: number;
  estado: string;
  ventasEfectivo?: number;
  efectivoContado?: number;
  ventasPrepago?: number;
  cantidadExentos?: number;
  fechaCreacion: string;
}

export interface AbrirTurnoBackendDto {
  empleadoId: number;
  estacionId: number;
  carrilId?: number;
  montoInicialCaja: number;
}

export interface CerrarTurnoBackendDto {
  montoFinalCaja: number;
  ventasEfectivo?: number;
  efectivoContado?: number;
  ventasPrepago?: number;
  cantidadExentos?: number;
}
