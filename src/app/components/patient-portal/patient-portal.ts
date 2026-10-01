import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';
import { Appointment } from '../../models/clinical.models';

@Component({
  selector: 'app-patient-portal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in duration-200">
      
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#001549] tracking-tight">
              ¡Buenos días, Laura!
            </h1>
            <span class="bg-[#eff4ff] text-[#002777] text-xs font-bold px-3 py-1 rounded-full border border-[#dce9ff]">
              EPS Afiliada
            </span>
          </div>
          <p class="text-xs text-[#444651] mt-1 font-medium">
            Hoy: 24 Oct, 2024 · Historial clínico al día · Sanitas EPS Plan Contributivo
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openBooking()"
            class="inline-flex items-center gap-2 bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      <!-- Quick Action Cards (Top CTA Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Card 1: Agendar nueva cita médica -->
        <button
          type="button"
          (click)="openBooking()"
          class="group p-6 rounded-2xl bg-white border border-[#e5eeff] hover:border-[#0056c3]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left w-full"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0056c3] flex items-center justify-center group-hover:bg-[#002777] group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[26px]">calendar_add_on</span>
            </div>
            <span class="material-symbols-outlined text-[#757682] group-hover:text-[#0056c3] group-hover:translate-x-1 transition-all text-[20px]">
              arrow_forward
            </span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-[#001549] mb-1 group-hover:text-[#0056c3] transition-colors">
              Agendar nueva cita médica
            </h2>
            <p class="text-xs text-[#444651] leading-relaxed">
              Selecciona especialidad, profesional y horario de preferencia institucional con confirmación inmediata.
            </p>
          </div>
        </button>

        <!-- Card 2: Mis citas y autorizaciones -->
        <button
          type="button"
          (click)="clinical.setView('mis-citas')"
          class="group p-6 rounded-2xl bg-white border border-[#e5eeff] hover:border-[#0056c3]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left w-full"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#002777] flex items-center justify-center group-hover:bg-[#002777] group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[26px]">event_available</span>
            </div>
            <span class="material-symbols-outlined text-[#757682] group-hover:text-[#002777] group-hover:translate-x-1 transition-all text-[20px]">
              arrow_forward
            </span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-[#001549] mb-1 group-hover:text-[#002777] transition-colors">
              Mis citas y autorizaciones
            </h2>
            <p class="text-xs text-[#444651] leading-relaxed">
              Consulta tus citas programadas, descarga comprobantes digitales o gestiona cancelaciones.
            </p>
          </div>
        </button>

      </div>

      <!-- Próxima Cita Programada Section -->
      @if (nextAppointment(); as apt) {
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#0056c3] text-[20px]">event_upcoming</span>
              <h2 class="text-base font-bold text-[#001549]">Próxima cita programada</h2>
            </div>
            <span class="text-xs text-[#757682] font-medium">Turno institucional activo</span>
          </div>

          <!-- Main Detailed Appointment Card -->
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-6 shadow-xs space-y-6">
            
            <!-- Doctor Info Row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eff4ff]">
              <div class="flex items-center gap-4">
                <img
                  [src]="apt.doctorAvatar"
                  [alt]="apt.doctorName"
                  class="w-14 h-14 rounded-full object-cover ring-2 ring-[#e5eeff]"
                  referrerpolicy="no-referrer"
                />
                <div>
                  <h3 class="text-base font-bold text-[#001549]">{{ apt.doctorName }}</h3>
                  <p class="text-xs font-medium text-[#0056c3]">{{ apt.specialty }}</p>
                  <p class="text-[11px] text-[#757682] mt-0.5">{{ apt.doctorTitle }}</p>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#002777] border border-[#dce9ff]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#0056c3]"></span>
                  {{ apt.status }}
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#f8f9ff] text-[#444651] border border-[#e5eeff]">
                  <span class="material-symbols-outlined text-[14px]">apartment</span>
                  {{ apt.type }}
                </span>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-[#eff4ff]/60 border border-[#eff4ff]">
                <span class="material-symbols-outlined text-[#0056c3] text-[20px] mt-0.5">schedule</span>
                <div>
                  <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block">Fecha y Horario</span>
                  <span class="text-xs font-bold text-[#0b1c30]">{{ apt.date }} · {{ apt.time }}</span>
                  <span class="text-[11px] text-[#444651] block mt-0.5">(Duración estimada: {{ apt.duration }})</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-[#eff4ff]/60 border border-[#eff4ff]">
                <span class="material-symbols-outlined text-[#0056c3] text-[20px] mt-0.5">location_on</span>
                <div>
                  <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block">Ubicación y Consultorio</span>
                  <span class="text-xs font-bold text-[#0b1c30]">{{ apt.location }}</span>
                  <span class="text-[11px] text-[#002777] font-semibold block mt-0.5">{{ apt.room }}</span>
                </div>
              </div>
            </div>

            <!-- Metadata Info Line -->
            <div class="flex flex-wrap items-center justify-between text-xs text-[#444651] pt-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#001549]">Cód. Cita:</span>
                <span class="font-mono bg-[#eff4ff] px-2 py-0.5 rounded text-[#002777] font-semibold">{{ apt.code }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-[#001549]">Motivo:</span>
                <span>{{ apt.reason }}</span>
              </div>
            </div>

            <!-- Preparation & Guidance Alert Banner -->
            <div class="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-3">
              <span class="material-symbols-outlined text-[#0056c3] text-[20px] shrink-0 mt-0.5">info</span>
              <p class="text-xs text-[#002777] leading-relaxed font-medium">
                {{ apt.preparationNote || 'Por favor presentarse 15 minutos antes con documento de identidad original y orden médica si aplica.' }}
              </p>
            </div>

            <!-- Card Actions -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="viewDetails(apt)"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Detalles de la cita</span>
                </button>
                <button
                  type="button"
                  (click)="downloadConfirmation(apt)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span>Descargar confirmación</span>
                </button>
              </div>

              <button
                type="button"
                (click)="reschedule(apt)"
                class="inline-flex items-center gap-1.5 text-xs text-[#0056c3] hover:text-[#001549] font-bold transition-colors cursor-pointer py-1"
              >
                <span class="material-symbols-outlined text-[16px]">event_repeat</span>
                <span>Solicitar reagendamiento</span>
              </button>
            </div>

          </div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-[#e5eeff] p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-[#eff4ff] text-[#0056c3] mx-auto flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">event_available</span>
          </div>
          <h3 class="text-sm font-bold text-[#001549]">No tienes citas pendientes para hoy</h3>
          <p class="text-xs text-[#444651]">Puedes solicitar un nuevo espacio asistencial en pocos pasos.</p>
          <button
            type="button"
            (click)="openBooking()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002777] text-white text-xs font-semibold hover:bg-[#0056c3] transition-colors"
          >
            Agendar cita ahora
          </button>
        </div>
      }

      <!-- Quick Service Guidance Cards -->
      <div class="space-y-3">
        <h2 class="text-base font-bold text-[#001549]">Servicios frecuentes & Guía rápida</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            type="button"
            (click)="openPrepGuide()"
            class="p-4 rounded-xl bg-white border border-[#e5eeff] hover:border-[#0056c3]/40 shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left w-full"
          >
            <div class="flex items-center gap-2.5 text-[#0056c3] mb-2">
              <span class="material-symbols-outlined text-[20px]">menu_book</span>
              <h3 class="text-xs font-bold text-[#001549]">Preparación de estudios</h3>
            </div>
            <p class="text-[11px] text-[#444651] leading-relaxed mb-3">
              Recomendaciones previas para ecocardiogramas, pruebas de esfuerzo y exámenes diagnósticos.
            </p>
            <span class="text-[11px] text-[#0056c3] font-bold inline-flex items-center gap-1">
              Ver guías <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </span>
          </button>

          <button
            type="button"
            (click)="clinical.setView('mi-perfil')"
            class="p-4 rounded-xl bg-white border border-[#e5eeff] hover:border-[#0056c3]/40 shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left w-full"
          >
            <div class="flex items-center gap-2.5 text-[#0056c3] mb-2">
              <span class="material-symbols-outlined text-[20px]">manage_accounts</span>
              <h3 class="text-xs font-bold text-[#001549]">Actualizar datos personales</h3>
            </div>
            <p class="text-[11px] text-[#444651] leading-relaxed mb-3">
              Mantén tu información de contacto y aseguradora de salud al día para recordatorios SMS y llamadas.
            </p>
            <span class="text-[11px] text-[#0056c3] font-bold inline-flex items-center gap-1">
              Ir a mi perfil <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </span>
          </button>

          <button
            type="button"
            (click)="callHelpline()"
            class="p-4 rounded-xl bg-white border border-[#e5eeff] hover:border-[#0056c3]/40 shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left w-full"
          >
            <div class="flex items-center gap-2.5 text-[#0056c3] mb-2">
              <span class="material-symbols-outlined text-[20px]">call</span>
              <h3 class="text-xs font-bold text-[#001549]">Línea de orientación FCV</h3>
            </div>
            <p class="text-[11px] text-[#444651] leading-relaxed mb-3">
              PBX (607) 639 6767 · Atención 24 horas para trámites asistenciales, quejas y dudas clínicas.
            </p>
            <span class="text-[11px] text-[#0056c3] font-bold inline-flex items-center gap-1">
              Llamar al PBX <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </span>
          </button>

        </div>
      </div>

      <!-- Institutional Footer Note -->
      <footer class="pt-6 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#757682]">
        <span>Fundación Cardiovascular de Colombia · Hospital Internacional de Colombia (HIC) & Instituto Cardiovascular</span>
        <span>Acreditación en Salud con Excelencia JCI</span>
      </footer>

    </div>
  `
})
export class PatientPortal {
  clinical = inject(ClinicalData);

  activeAppointments = computed(() =>
    this.clinical.appointments().filter(a => a.status !== 'Cancelada')
  );

  nextAppointment = computed(() => {
    const list = this.activeAppointments();
    return list.find(a => a.doctorName.includes('Andrés Gómez')) || list[0] || null;
  });

  openBooking() {
    this.clinical.isBookingModalOpen.set(true);
  }

  viewDetails(apt: Appointment) {
    this.clinical.selectedAppointment.set(apt);
  }

  reschedule(apt: Appointment) {
    this.clinical.selectedAppointment.set(apt);
    this.clinical.showToast('Abriendo ventana para reprogramar tu cita...', 'info');
  }

  downloadConfirmation(apt: Appointment) {
    this.clinical.showToast(`Descargando volante de confirmación para ${apt.code}...`, 'success');
  }

  openPrepGuide() {
    this.clinical.showToast('Abriendo guía de preparación de estudios cardiovasculares...', 'info');
  }

  callHelpline() {
    this.clinical.showToast('Comunícate marcando desde tu teléfono a la central: (607) 639 6767', 'info');
  }
}
