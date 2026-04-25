export interface Cliente {
  id: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Información básica
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  fechaNacimiento?: Date;
  
  // Información fiscal
  rfc?: string;
  razonSocial?: string;
  direccionFiscal?: string;
  regimenFiscal?: string;
  usoCfdi?: string;
  
  // Estado del cliente y flujo
  estadoCliente: EstadoCliente;
  fechaCambioEstado?: Date;
  motivoCambioEstado?: string;
  
  // Validación KYC
  kycCompletado: boolean;
  fechaKyc?: Date;
  documentosValidados?: string;
  observacionesKyc?: string;
  
  // Configuración comercial
  modeloCuenta?: ModeloCuenta;
  limiteMensual?: number;
  descuentoAplicable?: number;
  fechaUltimaFactura?: Date;
  
  // Configuración de alertas y límites
  montoAlertaSaldo?: number;
  saldoMinimo?: number;
  topeCredito?: number;
  
  // Información de soporte
  numeroClienteSoporte?: string;
  creadoPor?: string;
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  
  // Observaciones y notas
  observaciones?: string;
  comentarios?: string;
  notas?: string;
  
  // Relaciones
  vehiculos?: ClienteVehiculo[];
  documentos?: ClienteDocumento[];
  recargas?: ClienteRecarga[];
  facturas?: ClienteFactura[];
  pagos?: ClientePago[];
  ticketsSoporte?: TicketSoporte[];
}

export interface ClienteVehiculo {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  placas: string;
  marca?: string;
  modelo?: string;
  año?: number;
  color?: string;
  numeroSerie?: string;
  tipoVehiculo?: string;
  
  // Información RFID
  codigoRfid?: string;
  fechaAsignacionRfid?: Date;
  estadoRfid?: EstadoRfid;
  
  observaciones?: string;
  creadoPor?: string;
}

export interface ClienteDocumento {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  tipoDocumento: TipoDocumento;
  numeroDocumento?: string;
  fechaVencimiento?: Date;
  rutaArchivo?: string;
  nombreArchivo?: string;
  tamaño?: number;
  
  // Validación
  validado: boolean;
  fechaValidacion?: Date;
  validadoPor?: string;
  observacionesValidacion?: string;
  
  descripcion?: string;
  creadoPor?: string;
}

export interface ClienteRecarga {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string;
  comprobantePago?: string;
  
  // Estado de la recarga
  estado: EstadoRecarga;
  fechaProcesamiento?: Date;
  procesadoPor?: string;
  
  observaciones?: string;
  creadoPor?: string;
}

export interface ClienteFactura {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Información de facturación
  numeroFactura: string;
  serie?: string;
  folio?: number;
  fechaFactura: Date;
  fechaVencimiento?: Date;
  
  // Montos
  subtotal: number;
  descuento?: number;
  iva: number;
  otrosImpuestos?: number;
  total: number;
  
  // CFDI México
  uuid?: string;
  selloDigital?: string;
  cadenaOriginal?: string;
  fechaTimbrado?: Date;
  rfcEmisor?: string;
  
  // Estado
  estado: EstadoFactura;
  metodoPago?: string;
  formaPago?: string;
  
  observaciones?: string;
  creadoPor?: string;
  
  // Relaciones
  detalles?: ClienteFacturaDetalle[];
}

export interface ClienteFacturaDetalle {
  id: number;
  clienteFacturaId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  descripcion: string;
  cantidad: number;
  unidadMedida?: string;
  precioUnitario: number;
  
  // Descuentos e impuestos
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  ivaPorcentaje?: number;
  ivaMonto?: number;
  
  subtotal: number;
  total: number;
  
  codigoProducto?: string;
  claveSat?: string;
}

export interface ClientePago {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string;
  comprobante?: string;
  
  // Aplicación del pago
  fechaPago: Date;
  aplicadoFactura?: number; // ID de factura
  
  estado: EstadoPago;
  procesadoPor?: string;
  
  observaciones?: string;
  creadoPor?: string;
}

export interface TicketSoporte {
  id: number;
  clienteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  numeroTicket: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaTicket;
  prioridad: PrioridadTicket;
  
  // Estado y asignación
  estado: EstadoTicket;
  asignadoA?: string;
  fechaAsignacion?: Date;
  fechaCierre?: Date;
  
  // Resolución
  solucion?: string;
  tiempoResolucion?: number; // en minutos
  satisfaccionCliente?: number; // 1-5
  
  // Ajustes monetarios
  montoAjuste?: number;
  tipoAjuste?: TipoAjuste;
  
  creadoPor?: string;
  resolvidoPor?: string;
  
  // Relaciones
  historial?: TicketSoporteHistorial[];
}

export interface TicketSoporteHistorial {
  id: number;
  ticketSoporteId: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  accion: AccionTicket;
  descripcion: string;
  estadoAnterior?: EstadoTicket;
  estadoNuevo?: EstadoTicket;
  
  asignadoA?: string;
  observaciones?: string;
  
  creadoPor?: string;
}

// Enums y tipos
export enum TipoPersona {
  Fisica = 'Fisica',
  Moral = 'Moral'
}

export enum EstadoCliente {
  Prospecto = 'Prospecto',
  EnValidacion = 'EnValidacion',
  Aprobado = 'Aprobado',
  Suspendido = 'Suspendido',
  Cerrado = 'Cerrado',
  Archivado = 'Archivado'
}

export enum ModeloCuenta {
  Prepago = 'Prepago',
  Postpago = 'Postpago',
  Credito = 'Credito'
}

export enum EstadoRfid {
  Activo = 'Activo',
  Inactivo = 'Inactivo',
  Bloqueado = 'Bloqueado',
  Perdido = 'Perdido'
}

export enum TipoDocumento {
  INE = 'INE',
  RFC = 'RFC',
  ComprobanteIngresos = 'ComprobanteIngresos',
  ComprobanteDomicilio = 'ComprobanteDomicilio',
  ActaConstitutiva = 'ActaConstitutiva',
  PoderNotarial = 'PoderNotarial',
  Otro = 'Otro'
}

export enum MetodoPago {
  Efectivo = 'Efectivo',
  TarjetaCredito = 'TarjetaCredito',
  TarjetaDebito = 'TarjetaDebito',
  Transferencia = 'Transferencia',
  Cheque = 'Cheque'
}

export enum EstadoRecarga {
  Pendiente = 'Pendiente',
  Procesada = 'Procesada',
  Fallida = 'Fallida',
  Cancelada = 'Cancelada'
}

export enum EstadoFactura {
  Borrador = 'Borrador',
  Emitida = 'Emitida',
  Pagada = 'Pagada',
  Vencida = 'Vencida',
  Cancelada = 'Cancelada'
}

export enum EstadoPago {
  Pendiente = 'Pendiente',
  Aplicado = 'Aplicado',
  Rechazado = 'Rechazado'
}

export enum CategoriaTicket {
  Tecnico = 'Tecnico',
  Facturacion = 'Facturacion',
  Comercial = 'Comercial',
  Soporte = 'Soporte'
}

export enum PrioridadTicket {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Critica = 'Critica'
}

export enum EstadoTicket {
  Abierto = 'Abierto',
  EnProceso = 'EnProceso',
  Resuelto = 'Resuelto',
  Cerrado = 'Cerrado'
}

export enum TipoAjuste {
  Credito = 'Credito',
  Debito = 'Debito'
}

export enum AccionTicket {
  Creacion = 'Creacion',
  Asignacion = 'Asignacion',
  Comentario = 'Comentario',
  CambioEstado = 'CambioEstado',
  Resolucion = 'Resolucion',
  Cierre = 'Cierre'
}

// DTOs para crear/actualizar
export interface CrearClienteDto {
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rfc?: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  fechaNacimiento?: Date;
  observaciones?: string;
  creadoPor?: string;
}

export interface AprobarKycDto {
  aprobadoPor: string;
  observaciones?: string;
}

export interface RechazarKycDto {
  rechazadoPor: string;
  motivo: string;
  observaciones?: string;
}

export interface ConfigurarComercialDto {
  modeloCuenta: ModeloCuenta;
  limiteMensual?: number;
  descuentoAplicable?: number;
  montoAlertaSaldo?: number;
  saldoMinimo?: number;
  topeCredito?: number;
  configuradoPor?: string;
}

export interface AsociarVehiculoDto {
  placas: string;
  marca?: string;
  modelo?: string;
  año?: number;
  color?: string;
  tipoVehiculo?: string;
  codigoRfid?: string;
  observaciones?: string;
  creadoPor?: string;
}

export interface SuspenderClienteDto {
  motivo: string;
  observaciones?: string;
  suspendidoPor?: string;
}

export interface CerrarClienteDto {
  motivo: string;
  observaciones?: string;
  cerradoPor?: string;
}
