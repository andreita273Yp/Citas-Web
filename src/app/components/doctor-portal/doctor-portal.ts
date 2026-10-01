import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData, DOCTOR_AVATAR } from '../../services/clinical-data';
import { Appointment } from '../../models/clinical.models';

@Component({
  selector: 'app-doctor-portal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in duration-200">
      
      <!-- Doctor Profile Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs">
        <div class="flex items-center gap-4">
          <img
            [src]="doctorAvatar"
            alt="Dr. Andrés Gómez"
            class="w-16 h-16 rounded-full object-cover ring-2 ring-[#0056c3]/30"
            referrerpolicy="no-referrer"
          />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-extrabold text-[#001549]">
                Dr. Andrés Gómez
              </h1>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0056c3] border border-[#dce9ff]">
                <span class="w-1.5 h-1.5 rounded-full bg-[#0056c3]"></span>
                Activo
              </span>
            </div>
            <p class="text-xs text-[#0056c3] font-semibold mt-0.5">
              Cardiología Clínica · Consultorio 412 Torre A · RM-84920-FCV
            </p>
            <p class="text-[11px] text-[#757682] mt-0.5">
              Instituto Cardiovascular de Colombia · Fundación Cardiovascular (FCV)
            </p>
          </div>
        </div>

        <!-- Action buttons on top right -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            (click)="clinical.showToast('Cargando calendario semanal de consultas cardiológicas...', 'info')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">calendar_month</span>
            <span>Ver agenda semanal</span>
          </button>
          <button
            type="button"
            (click)="clinical.showToast('Módulo de disponibilidad y bloqueos para especialistas activado.', 'info')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">tune</span>
            <span>Gestionar disponibilidad</span>
          </button>
        </div>
      </div>

      <!-- Operational Status Banner -->
      <div class="p-4 rounded-xl bg-[#002777] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-[20px]">timer</span>
          </div>
          <div>
            <div class="text-xs font-bold tracking-wide">
              Hoy, Jueves 24 de Octubre de 2024 · Turno Activo: 10:00 AM
            </div>
            <div class="text-[11px] text-white/80">
              Estado en sistema: Listo para ingreso · Conexión directa a sala de espera
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] bg-white/20 text-white font-mono px-2.5 py-1 rounded-full font-bold">
            Sede Floridablanca
          </span>
        </div>
      </div>

      <!-- Doctor KPIs Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block mb-1">Total Citas Hoy</span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-[#001549]">8</span>
            <span class="text-[11px] text-[#444651]">pacientes</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block mb-1">Atenciones Completadas</span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-[#0056c3]">3</span>
            <span class="text-[11px] text-[#0056c3] font-semibold">37% avance</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block mb-1">Próxima Consulta</span>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-black text-[#001549]">10:00 AM</span>
            <span class="text-[11px] text-[#757682] truncate">Laura Martínez</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block mb-1">Franjas Disponibles</span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-[#006ef4]">2</span>
            <span class="text-[11px] text-[#444651]">cupos tarde</span>
          </div>
        </div>
      </div>

      <!-- Main Layout: Patient Queue on Left, Availability & Support on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Patients List (2 columns wide) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-[#001549]">Próximas citas aprobadas del día</h2>
              <p class="text-[11px] text-[#444651]">Orden cronológico de llamado a consultorio</p>
            </div>

            <!-- Filter tabs -->
            <div class="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl">
              <button
                type="button"
                (click)="activeFilter.set('todas')"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                [ngClass]="{
                  'bg-white text-[#002777] shadow-xs': activeFilter() === 'todas',
                  'text-[#444651] hover:text-[#0b1c30]': activeFilter() !== 'todas'
                }"
              >
                Todas ({{ doctorAppointments().length }})
              </button>
              <button
                type="button"
                (click)="activeFilter.set('sala')"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                [ngClass]="{
                  'bg-white text-[#002777] shadow-xs': activeFilter() === 'sala',
                  'text-[#444651] hover:text-[#0b1c30]': activeFilter() !== 'sala'
                }"
              >
                En Sala (1)
              </button>
              <button
                type="button"
                (click)="activeFilter.set('ingresar')"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                [ngClass]="{
                  'bg-white text-[#002777] shadow-xs': activeFilter() === 'ingresar',
                  'text-[#444651] hover:text-[#0b1c30]': activeFilter() !== 'ingresar'
                }"
              >
                Por Ingresar ({{ doctorAppointments().length - 1 }})
              </button>
            </div>
          </div>

          <!-- Patients List Cards -->
          <div class="space-y-3">
            @for (apt of filteredDoctorAppointments(); track apt.id) {
              <div
                class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs hover:border-[#0056c3]/40 transition-all space-y-4"
                [class.ring-2]="apt.patientName === 'Laura Martínez' && isCallingThisPatient(apt)"
                [class.ring-[#0056c3]]="apt.patientName === 'Laura Martínez' && isCallingThisPatient(apt)"
              >
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div class="flex items-start gap-3.5">
                    <!-- Time Badge -->
                    <div class="w-16 py-2 rounded-xl bg-[#eff4ff] text-center shrink-0 border border-[#dce9ff]">
                      <span class="text-xs font-extrabold text-[#002777] block">{{ apt.time }}</span>
                      <span class="text-[10px] text-[#757682] uppercase tracking-tight block">Cons. 412</span>
                    </div>

                    <!-- Patient Info -->
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-[#001549]">{{ apt.patientName }}</h3>
                        @if (apt.isFirstTime) {
                          <span class="text-[10px] bg-[#eff4ff] text-[#0056c3] px-2 py-0.5 rounded-full font-bold">
                            Primera Vez
                          </span>
                        }
                      </div>
                      <p class="text-xs text-[#444651] font-mono mt-0.5">{{ apt.patientDocument }} · {{ apt.insurance }}</p>
                      <p class="text-xs text-[#0b1c30] mt-1 font-medium">{{ apt.reason }}</p>
                    </div>
                  </div>

                  <!-- Status Pill -->
                  <div>
                    @if (apt.patientName === 'Laura Martínez') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#002777] border border-[#dce9ff]">
                        <span class="w-2 h-2 rounded-full bg-[#0056c3] animate-pulse"></span>
                        Paciente en sala de espera
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#f8f9ff] text-[#444651] border border-[#e5eeff]">
                        Confirmada por paciente
                      </span>
                    }
                  </div>
                </div>

                <!-- Action Toolbar for Doctor -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#eff4ff]">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="viewPatientFile(apt)"
                      class="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002777] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ver detalle
                    </button>

                    @if (apt.orderNumber) {
                      <button
                        type="button"
                        (click)="viewMedicalOrder(apt)"
                        class="px-3 py-1.5 rounded-lg bg-white hover:bg-[#eff4ff] text-[#444651] border border-[#dce9ff] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[15px]">description</span>
                        <span>Ver orden médica</span>
                      </button>
                    }

                    @if (apt.pacsReady) {
                      <button
                        type="button"
                        (click)="openPacs(apt)"
                        class="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#002777] hover:text-white text-[#0056c3] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[15px]">vital_signs</span>
                        <span>Imágenes PACS</span>
                      </button>
                    }
                  </div>

                  <!-- Primary Call Action -->
                  @if (apt.patientName === 'Laura Martínez') {
                    <button
                      type="button"
                      (click)="callToOffice(apt)"
                      class="px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-bold shadow-sm transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span class="material-symbols-outlined text-[18px]">volume_up</span>
                      <span>Llamar a consultorio</span>
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="clinical.showToast('El paciente ' + apt.patientName + ' aún no ha confirmado su llegada a sala.', 'info')"
                      class="px-3 py-1.5 rounded-lg text-xs text-[#757682] hover:text-[#0b1c30] transition-colors"
                    >
                      En espera de ingreso
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: Availability Notes & Support (1 column wide) -->
        <div class="space-y-6">
          
          <!-- Novedades de Disponibilidad y Bloqueos -->
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#0056c3] text-[20px]">event_busy</span>
                <h3 class="text-sm font-bold text-[#001549]">Novedades de Disponibilidad</h3>
              </div>
              <span class="text-[10px] bg-[#eff4ff] text-[#002777] px-2 py-0.5 rounded-full font-bold">1 Activo</span>
            </div>

            <div class="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#002777]">Comité de Falla Cardíaca</span>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-[#0056c3] font-bold">Bloqueo</span>
              </div>
              <p class="text-xs font-semibold text-[#0b1c30]">Viernes 27 Octubre · 14:00 - 17:00</p>
              <p class="text-[11px] text-[#444651] leading-relaxed">
                Sesión institucional y discusión de casos clínicos quirúrgicos. Cupos bloqueados en agenda asistencial.
              </p>
            </div>

            <button
              type="button"
              (click)="clinical.showToast('Solicitud de bloqueo asistencial enviada a Jefatura de Agendamiento.', 'success')"
              class="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Solicitar nuevo bloqueo de agenda</span>
            </button>
          </div>

          <!-- Mesa de Apoyo Clínico -->
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs space-y-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#0056c3] text-[20px]">contact_phone</span>
              <h3 class="text-sm font-bold text-[#001549]">Mesa de Apoyo Clínico</h3>
            </div>
            <p class="text-xs text-[#444651]">Canales prioritarios directos para profesionales en turno:</p>

            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                <span class="text-[#0b1c30] font-medium">Soporte Sistemas FCV</span>
                <span class="font-mono font-bold text-[#0056c3]">Ext 4102</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                <span class="text-[#0b1c30] font-medium">Enfermería de Piso 4</span>
                <span class="font-mono font-bold text-[#0056c3]">Ext 4412</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                <span class="text-[#0b1c30] font-medium">Farmacia Central HIC</span>
                <span class="font-mono font-bold text-[#0056c3]">Ext 2380</span>
              </div>
            </div>

            <button
              type="button"
              (click)="clinical.showToast('Mesa de Apoyo Clínico enlazada vía mensajería interna.', 'info')"
              class="w-full py-2.5 px-3 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-bold transition-colors shadow-xs"
            >
              Contactar Mesa Médica FCV
            </button>
          </div>

        </div>

      </div>

      <!-- Legal & Confidentiality Note -->
      <footer class="pt-6 border-t border-[#e5eeff] text-center text-[11px] text-[#757682]">
        Visualización restringida a la agenda del profesional autenticado. Cumplimiento estricto de confidencialidad médica y Ley 1581 FCV.
      </footer>

    </div>
  `
})
export class DoctorPortal {
  clinical = inject(ClinicalData);
  doctorAvatar = DOCTOR_AVATAR;

  activeFilter = signal<'todas' | 'sala' | 'ingresar'>('todas');

  doctorAppointments = computed(() =>
    this.clinical.appointments().filter(a => a.doctorName.includes('Andrés Gómez'))
  );

  filteredDoctorAppointments = computed(() => {
    const list = this.doctorAppointments();
    if (this.activeFilter() === 'sala') {
      return list.filter(a => a.patientName === 'Laura Martínez');
    }
    if (this.activeFilter() === 'ingresar') {
      return list.filter(a => a.patientName !== 'Laura Martínez');
    }
    return list;
  });

  isCallingThisPatient(apt: Appointment): boolean {
    const call = this.clinical.activeConsultationCall();
    return call !== null && call.patientName === apt.patientName;
  }

  callToOffice(apt: Appointment) {
    this.clinical.callPatient(apt);
  }

  viewPatientFile(apt: Appointment) {
    this.clinical.selectedAppointment.set(apt);
  }

  viewMedicalOrder(apt: Appointment) {
    this.clinical.showToast(`Cargando orden médica electrónica: ${apt.orderNumber}...`, 'info');
  }

  openPacs(apt: Appointment) {
    this.clinical.selectedPacsPatient.set(apt.patientName);
    this.clinical.isPacsModalOpen.set(true);
  }
}
