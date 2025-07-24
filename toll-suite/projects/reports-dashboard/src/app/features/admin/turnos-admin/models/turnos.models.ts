// Modelos base para el módulo de administración de turnos

export interface TurnoTemplate {
  id: number;
  nombre: string;
  descripcion: string;
  horaInicio: string; // TimeSpan como string "HH:mm"
  horaFin: string;
  duracionMinutos: number;
  tipo: string;
  esActivo: boolean;
  permiteHorasExtras: boolean;
  maximoHorasExtras: number;
  factorHoraExtra: number;
  minutosDescanso: number;
  horaDescansoInicio?: string;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  diasAplicables: string;
  horarioFormateado: string;
}

export interface TurnoAsignacion {
  id: number;
  empleadoId: number;
  empleadoNombre?: string;
  estacionId: number;
  estacionNombre?: string;
  turnoTemplateId?: number;
  turnoTemplateName?: string;
  fechaTurno: Date;
  horaInicioPrograma: string;
  horaFinPrograma: string;
  estado: EstadoAsignacion;
  fechaConfirmacion?: Date;
  confirmadoPorEmpleado: boolean;
  motivoRechazo?: string;
  empleadoSustitutoId?: number;
  empleadoSustitutoNombre?: string;
  motivoSustitucion?: string;
  fechaSustitucion?: Date;
  notas?: string;
  observaciones?: string;
  requiereSupervisor: boolean;
  montoInicialCajaAsignado?: number;
  instruccionesEspeciales?: string;
  fechaCreacion: Date;
  horarioFormateado: string;
  duracionProgramada: string;
}

export interface RegistroTiempo {
  id: number;
  empleadoId: number;
  empleadoNombre?: string;
  turnoAsignacionId?: number;
  turnoId?: number;
  fechaHora: Date;
  tipoRegistro: TipoRegistro;
  metodoRegistro: MetodoRegistro;
  estacionId?: number;
  estacionNombre?: string;
  ubicacionGPS?: string;
  direccionIP?: string;
  esValido: boolean;
  motivoInvalidacion?: string;
  autorizadoPorId?: number;
  autorizadoPorNombre?: string;
  fechaAutorizacion?: Date;
  observaciones?: string;
  esHoraExtra: boolean;
  esAtraso: boolean;
  minutosAtraso: number;
  archivoAdjunto?: string;
  fechaCreacion: Date;
}

export interface TurnoEvento {
  id: number;
  turnoId?: number;
  turnoAsignacionId?: number;
  empleadoId: number;
  empleadoNombre?: string;
  estacionId?: number;
  estacionNombre?: string;
  fechaHoraEvento: Date;
  tipoEvento: TipoEvento;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoEvento;
  fechaResolucion?: Date;
  duracionMinutos?: number;
  afectaOperacion: boolean;
  impactoOperacional?: string;
  montoAfectado?: number;
  reportadoPorId?: number;
  reportadoPorNombre?: string;
  asignadoAId?: number;
  asignadoANombre?: string;
  resueltoPorId?: number;
  resueltoPorNombre?: string;
  accionesTomadas?: string;
  solucionAplicada?: string;
  medidasPreventivas?: string;
  archivosAdjuntos?: string;
  requiereNotificacion: boolean;
  personasNotificadas?: string;
  fechaCreacion: Date;
  tiempoResolucion?: string;
}

export interface Turno {
  id: number;
  empleadoId: number;
  empleadoNombre?: string;
  estacionId: number;
  estacionNombre?: string;
  turnoAsignacionId?: number;
  fechaInicio: Date;
  fechaFin?: Date;
  montoInicialCaja: number;
  montoFinalCaja?: number;
  estado: EstadoTurno;
  horaInicioReal?: Date;
  horaFinReal?: Date;
  tieneHorasExtras: boolean;
  minutosHorasExtras: number;
  montoHorasExtras?: number;
  inicioDescanso?: Date;
  finDescanso?: Date;
  minutosDescanso: number;
  totalTransacciones: number;
  totalRecaudado: number;
  totalVehiculos: number;
  observaciones?: string;
  motivoCierre?: string;
  notasAdministrativas?: string;
  fechaCreacion: Date;
  duracionTurno?: string;
  diferenciaCaja?: number;
}

// Enums
export enum EstadoAsignacion {
  Programado = 'Programado',
  Confirmado = 'Confirmado',
  EnCurso = 'EnCurso',
  Completado = 'Completado',
  Cancelado = 'Cancelado',
  NoPresento = 'NoPresento'
}

export enum TipoRegistro {
  Entrada = 'Entrada',
  Salida = 'Salida',
  InicioDescanso = 'InicioDescanso',
  FinDescanso = 'FinDescanso',
  InicioHoraExtra = 'InicioHoraExtra',
  FinHoraExtra = 'FinHoraExtra'
}

export enum MetodoRegistro {
  Manual = 'Manual',
  Automatico = 'Automatico',
  Biometrico = 'Biometrico',
  TarjetaRFID = 'TarjetaRFID'
}

export enum TipoEvento {
  Incidente = 'Incidente',
  Mantenimiento = 'Mantenimiento',
  CambioTurno = 'CambioTurno',
  Emergencia = 'Emergencia',
  Capacitacion = 'Capacitacion',
  AusenciaTemporary = 'AusenciaTemporary',
  ProblemaEquipo = 'ProblemaEquipo',
  ClienteEspecial = 'ClienteEspecial',
  Auditoria = 'Auditoria'
}

export enum Prioridad {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Critica = 'Critica'
}

export enum EstadoEvento {
  Abierto = 'Abierto',
  EnProceso = 'EnProceso',
  Resuelto = 'Resuelto',
  Cerrado = 'Cerrado'
}

export enum EstadoTurno {
  Abierto = 'Abierto',
  Cerrado = 'Cerrado',
  Pausado = 'Pausado',
  Suspendido = 'Suspendido'
}

// Interfaces para crear/actualizar
export interface CreateTurnoTemplate {
  nombre: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  tipo: string;
  permiteHorasExtras: boolean;
  maximoHorasExtras: number;
  factorHoraExtra: number;
  minutosDescanso: number;
  horaDescansoInicio?: string;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
}

export interface CreateTurnoAsignacion {
  empleadoId: number;
  estacionId: number;
  turnoTemplateId?: number;
  fechaTurno: Date;
  horaInicioPrograma: string;
  horaFinPrograma: string;
  requiereSupervisor: boolean;
  montoInicialCajaAsignado?: number;
  instruccionesEspeciales?: string;
  notas?: string;
}

export interface CreateRegistroTiempo {
  empleadoId: number;
  turnoAsignacionId?: number;
  turnoId?: number;
  tipoRegistro: TipoRegistro;
  metodoRegistro: MetodoRegistro;
  estacionId?: number;
  observaciones?: string;
}

export interface CreateTurnoEvento {
  turnoId?: number;
  turnoAsignacionId?: number;
  empleadoId: number;
  estacionId?: number;
  tipoEvento: TipoEvento;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  afectaOperacion: boolean;
  impactoOperacional?: string;
  montoAfectado?: number;
  requiereNotificacion: boolean;
}
