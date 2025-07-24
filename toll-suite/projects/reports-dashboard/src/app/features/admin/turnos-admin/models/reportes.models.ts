// Modelos para reportes y dashboard del módulo de turnos

export interface DashboardTurnos {
  fechaActualizacion: Date;
  turnosActivosHoy: number;
  empleadosEnTurno: number;
  turnosProgramadosHoy: number;
  alertasActivas: number;
  turnosEnCurso: TurnoActivo[];
  alertasRecientes: AlertaTurnos[];
  estadisticasDelDia: EstadisticasDia;
  estadoPorEstacion: EstacionEstado[];
}

export interface EstadisticasDia {
  recaudacionAcumulada: number;
  transaccionesProcesadas: number;
  horasTrabajadasTotal: string;
  eventosRegistrados: number;
  rendimientoPromedio: number;
}

export interface EstacionEstado {
  estacionId: number;
  estacionNombre: string;
  estado: EstadoEstacion;
  turnosActivos: number;
  turnosEnCurso: TurnoActivo[];
}

export interface TurnoActivo {
  turno: any; // Referencia al turno completo
  estadoDetallado: string;
  tiempoTranscurrido: string;
  ultimoRegistroTiempo?: Date;
  tieneEventosAbiertos: boolean;
  numeroEventosAbiertos: number;
}

export interface AlertaTurnos {
  id: number;
  tipoAlerta: TipoAlerta;
  titulo: string;
  descripcion: string;
  severidad: SeveridadAlerta;
  fechaCreacion: Date;
  esResuelta: boolean;
  empleadoAfectadoId?: number;
  empleadoAfectadoNombre?: string;
  estacionAfectadaId?: number;
  estacionAfectadaNombre?: string;
}

export interface EstadisticasTurnos {
  fechaDesde: Date;
  fechaHasta: Date;
  totalTurnos: number;
  turnosCompletados: number;
  porcentajeCompletados: number;
  promedioHorasTrabajadas: string;
  promedioRecaudacionPorTurno: number;
  totalEventos: number;
  eventosCriticos: number;
  eventosPorTipo: { [key: string]: number };
  estadisticasPorEmpleado: EstadisticaEmpleado[];
  estadisticasPorEstacion: EstadisticaEstacion[];
}

export interface EstadisticaEmpleado {
  empleadoId: number;
  empleadoNombre: string;
  totalTurnos: number;
  totalHorasTrabajadas: string;
  totalRecaudado: number;
  promedioRecaudacionPorTurno: number;
  totalEventos: number;
  porcentajePuntualidad: number;
}

export interface EstadisticaEstacion {
  estacionId: number;
  estacionNombre: string;
  totalTurnos: number;
  totalRecaudado: number;
  totalTransacciones: number;
  promedioRecaudacionPorTurno: number;
  totalEventos: number;
  porcentajeOperatividad: number;
}

export interface ResumenAsistencia {
  empleadoId: number;
  empleadoNombre: string;
  fechaDesde: Date;
  fechaHasta: Date;
  totalDiasTrabajados: number;
  totalDiasAusente: number;
  totalLlegadasTarde: number;
  promedioHorasTrabajadas: string;
  totalHorasExtras: string;
  porcentajeAsistencia: number;
  porcentajePuntualidad: number;
  registrosDetalle: any[];
}

export interface EstadoActualEmpleado {
  empleadoId: number;
  empleadoNombre: string;
  estadoActual: EstadoEmpleado;
  ultimoRegistro?: Date;
  tipoUltimoRegistro?: string;
  turnoActual?: any;
  tiempoEnEstadoActual?: string;
  registrosDelDia: any[];
}

export interface CalendarioTurnos {
  año: number;
  mes: number;
  dias: CalendarioDia[];
  asignaciones: any[];
}

export interface CalendarioDia {
  fecha: Date;
  numeroAsignaciones: number;
  tieneTurnosSinCubrir: boolean;
  asignacionesDelDia: any[];
}

export interface MetricasProductividad {
  fechaDesde: Date;
  fechaHasta: Date;
  productividadPorEmpleado: ProductividadEmpleado[];
  rendimientoPromedioGeneral: number;
  promedioHorasTrabajadas: string;
  rankingMejorEmpleado: number;
  nombreMejorEmpleado: string;
}

export interface ProductividadEmpleado {
  empleadoId: number;
  empleadoNombre: string;
  rendimientoPorHora: number;
  totalTransacciones: number;
  totalRecaudado: number;
  totalHorasTrabajadas: string;
  ranking: number;
  porcentajeEficiencia: number;
}

export interface TurnoConProblemas {
  turno: any;
  problemas: string[];
  tipoProblema: TipoProblema;
  descripcion: string;
  severidad: SeveridadProblema;
  requiereAtencion: boolean;
  fechaDeteccion?: Date;
}

export interface ConfiguracionTurnos {
  horasMaximasTurnoContinuo: number;
  minutosDescansoObligatorio: number;
  factorHoraExtraDefecto: number;
  permitirTurnosSuperpuestos: boolean;
  validarPuntualidadAutomatica: boolean;
  minutosToleranciaRetraso: number;
  notificacionesAutomaticas: boolean;
  tiposEventoPrioritarios: string[];
}

export interface FiltrosTurnos {
  fechaDesde?: Date;
  fechaHasta?: Date;
  empleadoId?: number;
  estacionId?: number;
  estado?: string;
  tipoEvento?: string;
  prioridad?: string;
}

export interface ReporteExportacion {
  tipoReporte: TipoReporte;
  formato: FormatoExportacion;
  fechaDesde: Date;
  fechaHasta: Date;
  filtros?: any;
}

// Enums adicionales para reportes
export enum EstadoEstacion {
  Operativa = 'Operativa',
  Pausada = 'Pausada',
  MantenimientoProgramado = 'MantenimientoProgramado',
  ProblemasTecnicos = 'ProblemasTecnicos'
}

export enum TipoAlerta {
  TurnoSinCubrir = 'TurnoSinCubrir',
  LlegadaTarde = 'LlegadaTarde',
  Sobretiempo = 'Sobretiempo',
  EventoCritico = 'EventoCritico',
  DiferenciaCaja = 'DiferenciaCaja',
  AusenciaNoJustificada = 'AusenciaNoJustificada'
}

export enum SeveridadAlerta {
  Informativa = 'Informativa',
  Advertencia = 'Advertencia',
  Error = 'Error',
  Critica = 'Critica'
}

export enum EstadoEmpleado {
  EnTurno = 'EnTurno',
  EnDescanso = 'EnDescanso',
  FueraTurno = 'FueraTurno',
  NoAsignado = 'NoAsignado'
}

export enum TipoProblema {
  Retraso = 'Retraso',
  Ausencia = 'Ausencia',
  EventoCritico = 'EventoCritico',
  DiferenciaCaja = 'DiferenciaCaja'
}

export enum SeveridadProblema {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Critica = 'Critica'
}

export enum TipoReporte {
  ProductividadEmpleados = 'productividad-empleados',
  RendimientoTurnos = 'rendimiento-turnos',
  AsistenciaPuntualidad = 'asistencia-puntualidad',
  HorasExtras = 'horas-extras',
  CostosLaborales = 'costos-laborales',
  IncidenciasEventos = 'incidencias-eventos',
  CoberturaTurnos = 'cobertura-turnos'
}

export enum FormatoExportacion {
  Excel = 'excel',
  PDF = 'pdf',
  CSV = 'csv'
}

// Interfaces para requests
export interface AsignarSustitutoRequest {
  empleadoSustitutoId: number;
  motivoSustitucion: string;
}

export interface ConfirmarAsignacionRequest {
  empleadoId: number;
  confirmado: boolean;
  motivoRechazo?: string;
}

export interface PausarTurnoRequest {
  motivoPausa: string;
  esDescanso: boolean;
}

export interface TransferirTurnoRequest {
  nuevoEmpleadoId: number;
  motivoTransferencia: string;
  autorizadoPorId: number;
}

export interface ResolverAlertaRequest {
  resueltoPorId: number;
  observaciones?: string;
}

export interface OptimizarTurnosRequest {
  fechaDesde: Date;
  fechaHasta: Date;
  estacionId?: number;
  tipoOptimizacion: TipoOptimizacion;
}

export enum TipoOptimizacion {
  Cobertura = 'Cobertura',
  Costos = 'Costos',
  Productividad = 'Productividad'
}
