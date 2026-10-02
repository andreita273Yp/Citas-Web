import { Injectable, signal, computed, inject } from '@angular/core';
import { Appointment, MedicalRecord, PriorityRequest, UserProfile, UserRole, MainView } from '../models/clinical.models';
import { AuthApi } from './auth-api';
import { AuthSession } from './auth-session';

export const PATIENT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_NXbWED3I0KfcCX4mtNk_MW63P-6gKEF7NArcMumHIc66VhbTCe02huRUns4ayLp7taZ4JKr_7O9lJX-3vNK4dqYwWtmgynfnLCP5uD4ZarmOvBHSCwz9yDO6a08IzxSb4cZdjB2hirFHtDii98dhyidLqOO5bOGBynaMvE47JhOzmHZxGh7Kf-r9syPNwhl6X9QPI1L8QxORmrOj85h1VMe05iCoGyrl02L7aZHycdKyRLKNqRhP';
export const DOCTOR_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpSKD2Y1TWEStnbVIBxuG9rB8akaKv3SI90ZpJPTssdmt61kb-7E5piFDjdqQFIiTRifXPF4HJxQpELcb3VdzbKW-GmP_YZxOzlDjYgmR8UdZ03dgmYrlkyzcePoOnmJX4DdJHsnlgEgW1psmWDkCyp-YPFtNwN4NuA1DBKDkKwYp8bbI5-ZbHLCQf6xUvB-d8l8qkBUlQpTsonhvPqT6LLccoomCJVe8VtRGnejDyLSfC9ShiuBSp';
export const FCV_LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1X6nmKKSNMOW_UKsmlTIRLpb6XaPG6gPo1o6i6Ri0kWYfmnR2YwIqwXzXSMAiONxLHfttcEPMlQ_pyo3wteD0taVtYcU6vsvdd-lNXOjfdpgrOFDLGwk1CVbYF51riZc1TZJtnqyoMMflNrz6RAbIJYwr-1xSySLrGawy3XSssQ5UX38qgsKCaZaeIBHgXaiOtRhjK5XbSM9cYaExk1vy6QhnjFLnTad4Rh07U9dE0mPQHlwisFjsQ23Ss';
export const FCV_BACKGROUND = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDQE1vtfGwf5AH3t6JdqU5Q5WziL3N2cxeX8940XQnw0LrNzdfNZQ7TMB_wRZR-BMyMoiC8aqm0s8VhMZw0IWE6Gh5ME_BMYhz1RbZyv3SLv90sJT-5y_mvPD1K0wrGOEuRWbiVcneJouPm99enAdPqWCqENVk9urfoUHJDxvqrJ6nRFoKhKOfJT_7Pm90fWQei8ngT91GCnR5YdGpyuKspPS0xESNPGePYSOJ7eHIIdar7v0YiiRz';

@Injectable({
  providedIn: 'root'
})
export class ClinicalData {
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  // Session & navigation state
  /** Única fuente de verdad: hay sesión mientras exista un access token en memoria. */
  readonly isAuthenticated = computed(() => this.authSession.accessToken() !== null);
  currentRole = signal<UserRole>('patient');
  currentView = signal<MainView>('inicio');
  currentSede = signal<string>('Sede Principal - Bucaramanga');

  // Interactive Call Notification
  activeConsultationCall = signal<{ patientName: string; room: string; doctorName: string } | null>(null);

  // Selected appointment for detail / reschedule modal
  selectedAppointment = signal<Appointment | null>(null);
  isBookingModalOpen = signal<boolean>(false);
  isPacsModalOpen = signal<boolean>(false);
  selectedPacsPatient = signal<string>('Mariana Silva Rincón');
  isAssignModalOpen = signal<boolean>(false);
  selectedPriorityRequest = signal<PriorityRequest | null>(null);
  toastMessage = signal<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Users profiles
  readonly users: Record<UserRole, UserProfile> = {
    patient: {
      id: 'usr-pat-01',
      name: 'Laura Martínez',
      email: 'laura.martinez@correo.com',
      role: 'patient',
      avatarUrl: PATIENT_AVATAR,
      badge: 'EPS Afiliada',
      documentType: 'C.C.',
      documentNumber: '1.098.341.221',
      affiliation: 'Sanitas EPS - Plan Contributivo',
      title: 'Paciente Afiliado'
    },
    doctor: {
      id: 'usr-doc-01',
      name: 'Dr. Andrés Gómez',
      email: 'andres.gomez@fcv.org',
      role: 'doctor',
      avatarUrl: DOCTOR_AVATAR,
      badge: 'Médico Especialista',
      documentType: 'C.C.',
      documentNumber: '91.248.910',
      title: 'Cardiología Clínica',
      office: 'Consultorio 412 · Torre A Especialistas',
      medicalRecordNumber: 'RM-84920-FCV',
      affiliation: 'Fundación Cardiovascular de Colombia'
    },
    admin: {
      id: 'usr-adm-01',
      name: 'Dra. Marcela Cadena',
      email: 'marcela.cadena@fcv.org',
      role: 'admin',
      avatarUrl: PATIENT_AVATAR,
      badge: 'Supervisión Asistencial',
      documentType: 'C.C.',
      documentNumber: '63.489.102',
      title: 'Jefatura de Agendamiento y Red Asistencial',
      affiliation: 'Hospital Internacional de Colombia & FCV'
    }
  };

  currentUser = computed(() => this.users[this.currentRole()]);

  // Appointments database
  appointments = signal<Appointment[]>([
    {
      id: 'apt-01',
      code: 'FCV-892401',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Especialista en Falla Cardíaca e Hipertensión',
      patientName: 'Laura Martínez',
      patientDocument: 'CC 1.098.341.221',
      patientAvatar: PATIENT_AVATAR,
      date: 'Martes, 24 de Octubre de 2024',
      time: '09:30 AM',
      duration: '30 minutos',
      location: 'Sede Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Consulta de control y valoración funcional cardiovascular',
      insurance: 'EPS Sanitas - Plan Contributivo',
      preparationNote: 'Por favor presentarse 15 minutos antes con documento de identidad original y orden médica si aplica.'
    },
    {
      id: 'apt-02',
      code: 'FCV-892402',
      specialty: 'Ecocardiografía Doppler Color',
      doctorName: 'Dra. Patricia Valenzuela',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Especialista en Imagenología Cardíaca',
      patientName: 'Laura Martínez',
      patientDocument: 'CC 1.098.341.221',
      patientAvatar: PATIENT_AVATAR,
      date: 'Viernes, 10 de Noviembre de 2024',
      time: '11:15 AM',
      duration: '45 minutos',
      location: 'Hospital Internacional de Colombia (HIC)',
      room: 'Unidad de Diagnóstico No Invasivo · Sala 2B',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Ecocardiograma transtorácico de control hemodinámico',
      insurance: 'EPS Sanitas - Plan Contributivo',
      preparationNote: 'Traer ropa cómoda de dos piezas. No suspender medicación habitual para la tensión arterial.'
    },
    {
      id: 'apt-03',
      code: 'FCV-892403',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Cardiología Clínica',
      patientName: 'Carlos Eduardo Pardo',
      patientDocument: 'CC 91.240.109',
      date: 'Jueves, 24 de Octubre de 2024',
      time: '10:45 AM',
      duration: '30 minutos',
      location: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Primera vez · Valoración integral por cardiología',
      insurance: 'SURA EPS - Remisión Externa',
      isFirstTime: true,
      orderNumber: 'Orden 7829-BC'
    },
    {
      id: 'apt-04',
      code: 'FCV-892404',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Cardiología Clínica',
      patientName: 'Mariana Silva Rincón',
      patientDocument: 'CC 63.518.990',
      date: 'Jueves, 24 de Octubre de 2024',
      time: '11:30 AM',
      duration: '30 minutos',
      location: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Lectura e interpretación de ecocardiograma transtorácico',
      insurance: 'Particular FCV',
      pacsReady: true
    },
    {
      id: 'apt-05',
      code: 'FCV-892405',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Cardiología Clínica',
      patientName: 'Roberto Cala Meneses',
      patientDocument: 'CC 13.842.119',
      date: 'Jueves, 24 de Octubre de 2024',
      time: '14:30 PM',
      duration: '30 minutos',
      location: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Control post-cateterismo cardíaco e implante de stent',
      insurance: 'Sanitas EPS'
    },
    {
      id: 'apt-06',
      code: 'FCV-892406',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Cardiología Clínica',
      patientName: 'Elena Mantilla de Suarez',
      patientDocument: 'CC 28.190.412',
      date: 'Jueves, 24 de Octubre de 2024',
      time: '15:15 PM',
      duration: '30 minutos',
      location: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: 'Presencial',
      status: 'Confirmada',
      reason: 'Chequeo telemétrico de marcapasos bicameral',
      insurance: 'Nueva EPS'
    }
  ]);

  // Priority Requests (Admin Queue)
  priorityRequests = signal<PriorityRequest[]>([
    {
      id: 'req-01',
      patientName: 'Jorge E. Morales',
      patientInitials: 'JM',
      documentNumber: 'CC 1.098.442.***',
      status: 'Pendiente de cupo',
      specialty: 'Cirugía Cardiovascular Pediátrica',
      referralOrigin: 'Hospital Internacional de Colombia (HIC)',
      timeAgo: 'Ingresado hace 45m',
      insurance: 'SURA EPS',
      orderId: 'ORD-PED-9921'
    },
    {
      id: 'req-02',
      patientName: 'Sonia Patricia Rueda',
      patientInitials: 'SR',
      documentNumber: 'CC 63.518.***',
      status: 'Pendiente de validación',
      specialty: 'Electrocardiografía Avanzada & Holter 48h',
      referralOrigin: 'SURA EPS - Plan Especial',
      timeAgo: 'Ingresado hace 1h 20m',
      insurance: 'SURA EPS',
      orderId: 'ORD-HLT-5510'
    },
    {
      id: 'req-03',
      patientName: 'Miguel Ángel Duarte',
      patientInitials: 'MD',
      documentNumber: 'CC 91.280.***',
      status: 'Prioridad alta',
      specialty: 'Falla Cardíaca y Trasplante Ventricular',
      referralOrigin: 'Sanitas EPS - Contributivo',
      timeAgo: 'Ingresado hace 2h 10m',
      insurance: 'Sanitas EPS',
      orderId: 'ORD-FLC-7734'
    }
  ]);

  // Medical Records for Laura Martínez
  medicalHistory = signal<MedicalRecord[]>([
    {
      id: 'rec-01',
      date: '10 Sep 2024',
      specialty: 'Cardiología Clínica',
      doctorName: 'Dr. Andrés Gómez',
      diagnosis: 'Hipertensión arterial primaria grado I controlada. Función sistólica biventricular conservada.',
      status: 'Completado',
      documents: [
        { title: 'Epicrisis y Plan Terapéutico FCV.pdf', type: 'PDF', size: '2.4 MB' },
        { title: 'Fórmula Médica Farmacia Ambulatoria.pdf', type: 'PDF', size: '890 KB' }
      ]
    },
    {
      id: 'rec-02',
      date: '15 Jul 2024',
      specialty: 'Imagenología Cardíaca',
      doctorName: 'Dra. Patricia Valenzuela',
      diagnosis: 'Ecocardiograma Transtorácico: Fracción de eyección 62%. Sin alteraciones en motilidad segmentaria.',
      status: 'Completado',
      documents: [
        { title: 'Informe Ecocardiográfico Digital.pdf', type: 'PDF', size: '3.8 MB' },
        { title: 'Curvas Doppler y Mediciones Anatómicas.pdf', type: 'PDF', size: '5.1 MB' }
      ]
    },
    {
      id: 'rec-03',
      date: '02 Mar 2024',
      specialty: 'Laboratorio Clínico Especializado',
      doctorName: 'Dr. Juan Carlos Plata',
      diagnosis: 'Perfil Lipídico, Troponina T ultrasensible, Función Renal y Electrolitos dentro de parámetros clínicos.',
      status: 'Completado',
      documents: [
        { title: 'Resultados Laboratorio Clínico Central.pdf', type: 'PDF', size: '1.2 MB' }
      ]
    }
  ]);

  // Available Doctors for Booking
  readonly availableDoctors = [
    {
      id: 'doc-gomez',
      name: 'Dr. Andrés Gómez',
      specialty: 'Cardiología Clínica',
      sede: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 412, Torre A',
      avatar: DOCTOR_AVATAR,
      rating: '4.9 (184 valoraciones)',
      nextSlot: '24 Oct - 09:30 AM'
    },
    {
      id: 'doc-valenzuela',
      name: 'Dra. Patricia Valenzuela',
      specialty: 'Ecocardiografía & Imágenes',
      sede: 'Hospital Internacional de Colombia (HIC)',
      room: 'Sala Doppler 2B',
      avatar: PATIENT_AVATAR,
      rating: '4.95 (210 valoraciones)',
      nextSlot: '25 Oct - 11:00 AM'
    },
    {
      id: 'doc-mendoza',
      name: 'Dr. Mauricio Mendoza',
      specialty: 'Electrofisiología y Arritmias',
      sede: 'Sede Floridablanca - Instituto Cardiovascular',
      room: 'Cons. 508, Torre B',
      avatar: DOCTOR_AVATAR,
      rating: '4.88 (96 valoraciones)',
      nextSlot: '28 Oct - 14:00 PM'
    },
    {
      id: 'doc-torres',
      name: 'Dra. Claudia Torres',
      specialty: 'Cirugía Cardiovascular Pediátrica',
      sede: 'Hospital Internacional de Colombia (HIC)',
      room: 'Unidad Quirúrgica Piso 3',
      avatar: PATIENT_AVATAR,
      rating: '5.0 (140 valoraciones)',
      nextSlot: '30 Oct - 08:30 AM'
    }
  ];

  // Actions
  setRole(role: UserRole) {
    this.currentRole.set(role);
    this.currentView.set('inicio');
    this.showToast(`Perfil cambiado a: ${this.users[role].title || this.users[role].name}`, 'info');
  }

  setView(view: MainView) {
    this.currentView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setSede(sede: string) {
    this.currentSede.set(sede);
    this.showToast(`Sede seleccionada: ${sede}`, 'info');
  }

  callPatient(appointment: Appointment) {
    this.activeConsultationCall.set({
      patientName: appointment.patientName,
      room: appointment.room || 'Consultorio 412',
      doctorName: appointment.doctorName
    });

    // Update appointment status to 'En atención'
    this.appointments.update(list =>
      list.map(a => a.id === appointment.id ? { ...a, status: 'En atención' as const } : a)
    );

    this.showToast(`¡Llamando a ${appointment.patientName} a ${appointment.room}!`, 'success');

    // Auto dismiss active chime after 10s
    setTimeout(() => {
      this.activeConsultationCall.set(null);
    }, 9000);
  }

  dismissCall() {
    this.activeConsultationCall.set(null);
  }

  bookAppointment(data: {
    specialty: string;
    doctorName: string;
    date: string;
    time: string;
    type: 'Presencial' | 'Telemedicina';
    reason: string;
  }) {
    const codeNumber = Math.floor(100000 + Math.random() * 900000);
    const newApt: Appointment = {
      id: `apt-new-${Date.now()}`,
      code: `FCV-${codeNumber}`,
      specialty: data.specialty,
      doctorName: data.doctorName,
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Especialista FCV',
      patientName: this.currentUser().name,
      patientDocument: this.currentUser().documentNumber,
      patientAvatar: this.currentUser().avatarUrl,
      date: data.date,
      time: data.time,
      duration: '30 minutos',
      location: 'Sede Instituto Cardiovascular',
      room: 'Cons. 412, Piso 4',
      type: data.type,
      status: 'Confirmada',
      reason: data.reason || 'Consulta médica especializada institucional',
      insurance: this.currentUser().affiliation || 'Sanitas EPS - Plan Contributivo',
      preparationNote: 'Por favor presentarse 15 minutos antes con documento original y orden médica si aplica.'
    };

    this.appointments.update(list => [newApt, ...list]);
    this.isBookingModalOpen.set(false);
    this.selectedAppointment.set(newApt);
    this.showToast('¡Cita médica confirmada exitosamente! Se ha generado tu volante digital.', 'success');
  }

  cancelAppointment(id: string) {
    this.appointments.update(list =>
      list.map(a => a.id === id ? { ...a, status: 'Cancelada' as const } : a)
    );
    this.selectedAppointment.set(null);
    this.showToast('La cita ha sido cancelada satisfactoriamente.', 'info');
  }

  assignPriorityRequest(reqId: string, doctorName: string, date: string, time: string) {
    const req = this.priorityRequests().find(r => r.id === reqId);
    if (!req) return;

    // Add to appointments
    const newApt: Appointment = {
      id: `apt-pri-${Date.now()}`,
      code: `FCV-${Math.floor(100000 + Math.random() * 900000)}`,
      specialty: req.specialty,
      doctorName: doctorName,
      doctorAvatar: DOCTOR_AVATAR,
      doctorTitle: 'Especialista Adscrito FCV',
      patientName: req.patientName,
      patientDocument: req.documentNumber,
      date: date,
      time: time,
      duration: '45 minutos',
      location: req.referralOrigin,
      room: 'Pabellón Especializado HIC',
      type: 'Presencial',
      status: 'Confirmada',
      reason: `Asignación prioritaria autorizada - ${req.orderId}`,
      insurance: req.insurance,
      isFirstTime: true
    };

    this.appointments.update(list => [newApt, ...list]);
    this.priorityRequests.update(list => list.filter(r => r.id !== reqId));
    this.isAssignModalOpen.set(false);
    this.selectedPriorityRequest.set(null);
    this.showToast(`Solicitud prioritaria para ${req.patientName} asignada a ${doctorName}.`, 'success');
  }

  showToast(text: string, type: 'success' | 'info' | 'error' = 'success') {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }

  logout() {
    this.authApi.logout().subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  login(role: UserRole = 'patient') {
    this.currentRole.set(role);
    this.currentView.set('inicio');
    this.showToast(`Bienvenido al Portal Clínico FCV`, 'success');
  }

  private clearSession() {
    this.authSession.clear();
    this.currentView.set('inicio');
    this.showToast('Has cerrado sesión correctamente del portal FCV.', 'info');
  }
}
