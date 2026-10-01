export type UserRole = 'patient' | 'doctor' | 'admin';

export type MainView = 'inicio' | 'agendar-cita' | 'mis-citas' | 'historial-de-atenciones' | 'mi-perfil' | 'soporte';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  badge: string;
  documentType: string;
  documentNumber: string;
  affiliation?: string;
  title?: string;
  office?: string;
  medicalRecordNumber?: string;
}

export interface Appointment {
  id: string;
  code: string;
  specialty: string;
  doctorName: string;
  doctorAvatar: string;
  doctorTitle: string;
  patientName: string;
  patientDocument: string;
  patientAvatar?: string;
  date: string; // e.g. "Martes, 24 de Octubre de 2024"
  time: string; // e.g. "09:30 AM"
  duration: string; // e.g. "30 minutos"
  location: string;
  room: string;
  type: 'Presencial' | 'Telemedicina';
  status: 'Confirmada' | 'En sala' | 'En atención' | 'Finalizada' | 'Cancelada';
  reason: string;
  insurance: string;
  preparationNote?: string;
  isFirstTime?: boolean;
  orderNumber?: string;
  pacsReady?: boolean;
}

export interface MedicalRecord {
  id: string;
  date: string;
  specialty: string;
  doctorName: string;
  diagnosis: string;
  status: 'Completado' | 'En revisión' | 'Programado';
  documents: { title: string; type: string; size: string }[];
}

export interface PriorityRequest {
  id: string;
  patientName: string;
  patientInitials: string;
  documentNumber: string;
  status: 'Pendiente de cupo' | 'Pendiente de validación' | 'Prioridad alta';
  specialty: string;
  referralOrigin: string;
  timeAgo: string;
  insurance: string;
  orderId: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  office: string;
  medicalRegistration: string;
  avatarUrl: string;
  totalAppointmentsToday: number;
  completedAppointments: number;
  availableSlots: number;
  nextAppointmentTime: string;
  nextPatientName: string;
}
