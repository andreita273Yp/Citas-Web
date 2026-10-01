import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';
import { PriorityRequest } from '../../models/clinical.models';

@Component({
  selector: 'app-admin-portal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in duration-200">
      
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#001549] tracking-tight">
            Supervisión Operativa Asistencial
          </h1>
          <p class="text-xs text-[#444651] mt-1 font-medium">
            Centro de Gestión y Agendamiento Asistencial · FCV & Hospital Internacional de Colombia
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            (click)="clinical.showToast('Filtrando datos para: Sede Principal Bucaramanga & Floridablanca', 'info')"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">tune</span>
            <span>Filtrar por sede</span>
          </button>
          <button
            type="button"
            (click)="exportReport()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">file_download</span>
            <span>Exportar reporte diario</span>
          </button>
          <button
            type="button"
            (click)="openNewPriorityAssignment()"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[17px]">add_circle</span>
            <span>Nueva asignación prioritaria</span>
          </button>
        </div>
      </div>

      <!-- Critical Alert Cards Row (3 Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Card 1: Triage Pendiente -->
        <div class="bg-white rounded-2xl border border-[#ffdad6] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">crisis_alert</span>
                <span>Triage Pendiente</span>
              </span>
              <span class="text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full font-bold">
                Crítico (< 2h)
              </span>
            </div>
            <div class="text-3xl font-black text-[#001549] mb-1">
              14 solicitudes
            </div>
            <p class="text-xs text-[#444651]">
              Pacientes con prioridad cardiovascular y oncología en espera de confirmación de cupo.
            </p>
          </div>
          <div class="pt-4 border-t border-[#eff4ff] mt-4 flex items-center justify-between">
            <span class="text-[11px] text-[#757682]">6 asignadas hoy</span>
            <button
              type="button"
              (click)="clinical.showToast('Filtrando pacientes en triage prioritario...', 'info')"
              class="text-xs text-[#0056c3] font-bold hover:underline"
            >
              Ver solicitudes
            </button>
          </div>
        </div>

        <!-- Card 2: Reprogramaciones -->
        <div class="bg-white rounded-2xl border border-[#dce9ff] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold text-[#0056c3] uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>Reprogramaciones</span>
              </span>
              <span class="text-[10px] bg-[#eff4ff] text-[#002777] px-2 py-0.5 rounded-full font-bold">
                Moderado
              </span>
            </div>
            <div class="text-3xl font-black text-[#001549] mb-1">
              6 casos
            </div>
            <p class="text-xs text-[#444651]">
              Modificaciones de agenda por bloqueos médicos o solicitud asistencial de especialistas.
            </p>
          </div>
          <div class="pt-4 border-t border-[#eff4ff] mt-4 flex items-center justify-between">
            <span class="text-[11px] text-[#757682]">Tiempo prom: 42 min</span>
            <button
              type="button"
              (click)="clinical.showToast('Revisando casos con solicitud de reagendamiento...', 'info')"
              class="text-xs text-[#0056c3] font-bold hover:underline"
            >
              Gestionar casos
            </button>
          </div>
        </div>

        <!-- Card 3: Ocupación Médica -->
        <div class="bg-white rounded-2xl border border-[#dce9ff] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">pie_chart</span>
                <span>Ocupación Médica</span>
              </span>
              <span class="text-[10px] bg-[#eff4ff] text-[#001549] px-2 py-0.5 rounded-full font-bold">
                >95% Saturado
              </span>
            </div>
            <div class="text-3xl font-black text-[#001549] mb-1">
              3 especialistas
            </div>
            <p class="text-xs text-[#444651]">
              Cardiología Pediátrica, Hemodinamia y Electrofisiología sin franjas libres esta semana.
            </p>
          </div>
          <div class="pt-4 border-t border-[#eff4ff] mt-4 flex items-center justify-between">
            <span class="text-[11px] text-[#757682]">Habilitar sobrecupos</span>
            <button
              type="button"
              (click)="clinical.showToast('Abriendo panel de sobredemanda de especialidades...', 'info')"
              class="text-xs text-[#0056c3] font-bold hover:underline"
            >
              Ajustar franjas
            </button>
          </div>
        </div>

      </div>

      <!-- Main Section: Priority Queue & System Master Config -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Cols: Priority Queue -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-[#001549]">Cola de Asignación Médica</h2>
              <p class="text-[11px] text-[#444651]">Solicitudes entrantes con orden o remisión de alta prioridad</p>
            </div>
            <span class="text-xs bg-[#eff4ff] text-[#002777] font-bold px-2.5 py-1 rounded-full">
              {{ clinical.priorityRequests().length }} en espera
            </span>
          </div>

          <div class="space-y-3">
            @for (req of clinical.priorityRequests(); track req.id) {
              <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs hover:border-[#0056c3]/40 transition-all space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#eff4ff] text-[#002777] font-bold flex items-center justify-center text-xs shrink-0 border border-[#dce9ff]">
                      {{ req.patientInitials }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-[#001549]">{{ req.patientName }}</h3>
                        <span class="text-[10px] text-[#757682] font-mono">{{ req.documentNumber }}</span>
                      </div>
                      <p class="text-xs text-[#0056c3] font-semibold mt-0.5">{{ req.specialty }}</p>
                      <p class="text-[11px] text-[#444651] mt-0.5">
                        Origen: {{ req.referralOrigin }} · {{ req.insurance }}
                      </p>
                    </div>
                  </div>

                  <div class="flex sm:flex-col items-end justify-between gap-1">
                    <span
                      class="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      [ngClass]="{
                        'bg-[#ffdad6] text-[#93000a]': req.status === 'Prioridad alta',
                        'bg-[#eff4ff] text-[#002777]': req.status !== 'Prioridad alta'
                      }"
                    >
                      {{ req.status }}
                    </span>
                    <span class="text-[10px] text-[#757682]">{{ req.timeAgo }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
                  <span class="text-[11px] font-mono text-[#757682]">ID Orden: {{ req.orderId }}</span>
                  <button
                    type="button"
                    (click)="openAssignModal(req)"
                    class="px-4 py-1.5 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span class="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                    <span>Revisar y asignar</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="bg-white rounded-2xl border border-[#e5eeff] p-8 text-center">
                <span class="material-symbols-outlined text-[#0056c3] text-[32px] mb-2">check_circle</span>
                <p class="text-sm font-bold text-[#001549]">Cola de asignación al día</p>
                <p class="text-xs text-[#757682]">No hay solicitudes pendientes en este momento.</p>
              </div>
            }
          </div>
        </div>

        <!-- Right 1 Col: Metrics & System Master Catalogs -->
        <div class="space-y-6">
          
          <!-- Key Metrics Widget -->
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs space-y-4">
            <h3 class="text-sm font-bold text-[#001549]">Métricas de Eficiencia Asistencial</h3>
            
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-[#444651]">Tiempo Medio de Respuesta</span>
                  <span class="font-bold text-[#001549]">1h 12m (Meta: < 2h)</span>
                </div>
                <div class="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                  <div class="bg-[#0056c3] h-full w-[60%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-[#444651]">Capacidad de Agendamiento Hoy</span>
                  <span class="font-bold text-[#001549]">88.4%</span>
                </div>
                <div class="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                  <div class="bg-[#002777] h-full w-[88.4%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuration & Master Catalogs -->
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs space-y-3">
            <h3 class="text-sm font-bold text-[#001549]">Configuración y Catálogos Maestros</h3>
            
            <div class="divide-y divide-[#eff4ff] text-xs">
              <button
                type="button"
                (click)="clinical.showToast('Abriendo Directorio Médico FCV con 142 especialistas...', 'info')"
                class="w-full py-2.5 flex items-center justify-between hover:text-[#0056c3] cursor-pointer transition-colors bg-transparent border-0 text-left"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-[#757682]">badge</span>
                  <span class="font-semibold text-[#0b1c30]">Directorio Médico</span>
                </div>
                <span class="text-[11px] text-[#757682]">142 especialistas</span>
              </button>

              <button
                type="button"
                (click)="clinical.showToast('Listando 38 subespecialidades clínicas activas...', 'info')"
                class="w-full py-2.5 flex items-center justify-between hover:text-[#0056c3] cursor-pointer transition-colors bg-transparent border-0 text-left"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-[#757682]">medical_services</span>
                  <span class="font-semibold text-[#0b1c30]">Especialidades Clínicas</span>
                </div>
                <span class="text-[11px] text-[#757682]">38 activas</span>
              </button>

              <button
                type="button"
                (click)="clinical.showToast('Convenios y Aseguradoras: Sanitas, SURA, Nueva EPS, Pólizas.', 'info')"
                class="w-full py-2.5 flex items-center justify-between hover:text-[#0056c3] cursor-pointer transition-colors bg-transparent border-0 text-left"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-[#757682]">handshake</span>
                  <span class="font-semibold text-[#0b1c30]">Convenios y Aseguradoras</span>
                </div>
                <span class="text-[11px] text-[#757682]">18 EPS / Pólizas</span>
              </button>

              <button
                type="button"
                (click)="clinical.showToast('Gestión de turnos y franjas horarias institucionales 2024-2025.', 'info')"
                class="w-full py-2.5 flex items-center justify-between hover:text-[#0056c3] cursor-pointer transition-colors bg-transparent border-0 text-left"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-[#757682]">schedule</span>
                  <span class="font-semibold text-[#0b1c30]">Horarios y Franjas</span>
                </div>
                <span class="text-[11px] text-[#757682]">Configuración</span>
              </button>
            </div>
          </div>

          <!-- Audit Log Box -->
          <div class="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs space-y-1">
            <div class="flex items-center gap-2 text-[#002777] font-bold">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Auditoría de Agendamiento</span>
            </div>
            <p class="text-[11px] text-[#444651] leading-relaxed">
              Trazabilidad completa de cancelaciones, asignaciones manuales y sobrecupos asistenciales conforme a la Resolución 3100.
            </p>
          </div>

        </div>

      </div>

    </div>
  `
})
export class AdminPortal {
  clinical = inject(ClinicalData);

  openAssignModal(req: PriorityRequest) {
    this.clinical.selectedPriorityRequest.set(req);
    this.clinical.isAssignModalOpen.set(true);
  }

  openNewPriorityAssignment() {
    this.clinical.selectedPriorityRequest.set({
      id: `req-manual-${Date.now()}`,
      patientName: 'Nuevo Paciente Prioritario',
      patientInitials: 'NP',
      documentNumber: 'CC 1.098.999.***',
      status: 'Prioridad alta',
      specialty: 'Cardiología Clínica',
      referralOrigin: 'Urgencias FCV Bucaramanga',
      timeAgo: 'Ingreso inmediato',
      insurance: 'Sanitas EPS',
      orderId: 'ORD-URG-1029'
    });
    this.clinical.isAssignModalOpen.set(true);
  }

  exportReport() {
    this.clinical.showToast('Generando reporte institucional consolidado en formato Excel / PDF...', 'success');
  }
}
