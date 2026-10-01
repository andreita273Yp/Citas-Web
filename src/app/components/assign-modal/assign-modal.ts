import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-assign-modal',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clinical.isAssignModalOpen(); as isOpen) {
      @if (clinical.selectedPriorityRequest(); as req) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#e5eeff] flex flex-col">
            
            <!-- Header -->
            <div class="p-5 border-b border-[#e5eeff] flex items-center justify-between bg-gradient-to-r from-white to-[#eff4ff]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#002777] flex items-center justify-center">
                  <span class="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                </div>
                <div>
                  <h3 class="text-base font-extrabold text-[#001549]">Asignación Médica Prioritaria</h3>
                  <p class="text-xs text-[#444651]">Centro de Gestión y Agendamiento Asistencial FCV</p>
                </div>
              </div>

              <button
                type="button"
                (click)="close()"
                class="p-2 text-[#757682] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-xl transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4 text-left">
              <!-- Patient & Request summary -->
              <div class="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[#001549]">{{ req.patientName }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a]">
                    {{ req.status }}
                  </span>
                </div>
                <p class="text-xs text-[#0056c3] font-semibold">{{ req.specialty }}</p>
                <p class="text-[11px] text-[#444651]">
                  Doc: {{ req.documentNumber }} · Origen: {{ req.referralOrigin }} · {{ req.insurance }}
                </p>
              </div>

              <!-- Specialist Selection -->
              <div>
                <label for="assign-doctor-select" class="block text-xs font-bold text-[#444651] uppercase tracking-wider mb-1.5">
                  Asignar a Especialista Clínico
                </label>
                <select
                  id="assign-doctor-select"
                  [(ngModel)]="selectedDoctor"
                  class="w-full p-2.5 rounded-lg border border-[#c5c6d3] text-xs font-medium text-[#0b1c30] bg-white"
                >
                  <option value="Dr. Andrés Gómez">Dr. Andrés Gómez · Cardiología Clínica (Floridablanca)</option>
                  <option value="Dra. Patricia Valenzuela">Dra. Patricia Valenzuela · Ecocardiografía & Imágenes (HIC)</option>
                  <option value="Dr. Mauricio Mendoza">Dr. Mauricio Mendoza · Electrofisiología y Arritmias</option>
                  <option value="Dra. Claudia Torres">Dra. Claudia Torres · Cirugía Cardiovascular Pediátrica</option>
                </select>
              </div>

              <!-- Date & Time Selection -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="assign-date-input" class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Fecha Asignada</label>
                  <input
                    id="assign-date-input"
                    type="date"
                    [(ngModel)]="assignedDate"
                    class="w-full p-2 rounded-lg border border-[#c5c6d3] text-xs text-[#0b1c30] bg-white"
                  />
                </div>
                <div>
                  <label for="assign-time-select" class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Hora de Consulta</label>
                  <select
                    id="assign-time-select"
                    [(ngModel)]="assignedTime"
                    class="w-full p-2 rounded-lg border border-[#c5c6d3] text-xs text-[#0b1c30] bg-white"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:15 AM">09:15 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="14:00 PM">14:00 PM</option>
                    <option value="16:15 PM">16:15 PM</option>
                  </select>
                </div>
              </div>

              <!-- Observation Note -->
              <div>
                <label for="assign-note-input" class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Nota Asistencial FCV</label>
                <input
                  id="assign-note-input"
                  type="text"
                  [(ngModel)]="adminNote"
                  placeholder="Ej: Cupo prioritario aprobado por Comité Asistencial..."
                  class="w-full p-2.5 rounded-lg border border-[#c5c6d3] text-xs text-[#0b1c30] bg-white"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
              <button
                type="button"
                (click)="close()"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-[#757682] hover:bg-white transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="confirmAssignment(req.id)"
                class="px-5 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">check</span>
                <span>Confirmar Asignación</span>
              </button>
            </div>

          </div>
        </div>
      }
    }
  `
})
export class AssignModal {
  clinical = inject(ClinicalData);

  selectedDoctor = 'Dr. Andrés Gómez';
  assignedDate = '2024-10-25';
  assignedTime = '08:00 AM';
  adminNote = 'Cupo prioritario asignado institucionalmente vía Supervisión Operativa';

  close() {
    this.clinical.isAssignModalOpen.set(false);
    this.clinical.selectedPriorityRequest.set(null);
  }

  confirmAssignment(reqId: string) {
    this.clinical.assignPriorityRequest(
      reqId,
      this.selectedDoctor,
      this.assignedDate,
      this.assignedTime
    );
  }
}
