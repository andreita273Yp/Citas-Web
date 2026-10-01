import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData, FCV_LOGO } from '../../services/clinical-data';

@Component({
  selector: 'app-appointment-details-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clinical.selectedAppointment(); as apt) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-[#e5eeff] flex flex-col max-h-[90vh]">
          
          <!-- Header with FCV Logo -->
          <div class="p-5 border-b border-[#e5eeff] flex items-center justify-between bg-gradient-to-r from-white to-[#eff4ff]">
            <div class="flex items-center gap-3">
              <img [src]="logoUrl" alt="FCV" class="h-8 w-auto object-contain" referrerpolicy="no-referrer" />
              <div>
                <h3 class="text-sm font-extrabold text-[#001549]">Volante Digital de Cita Médica</h3>
                <p class="text-[11px] font-mono text-[#0056c3] font-bold">{{ apt.code }}</p>
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
          <div class="p-6 overflow-y-auto space-y-6 text-left">
            
            <!-- Doctor & Specialty block -->
            <div class="flex items-center gap-4 p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <img [src]="apt.doctorAvatar" [alt]="apt.doctorName" class="w-14 h-14 rounded-full object-cover ring-2 ring-white" referrerpolicy="no-referrer" />
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#0056c3] block">{{ apt.specialty }}</span>
                <h4 class="text-base font-bold text-[#001549]">{{ apt.doctorName }}</h4>
                <p class="text-xs text-[#444651]">{{ apt.doctorTitle }}</p>
              </div>
            </div>

            <!-- Schedule & Location info -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-lg border border-[#e5eeff]">
                <span class="text-[#757682] block text-[11px]">Fecha y Hora:</span>
                <span class="font-bold text-[#0b1c30]">{{ apt.date }}</span>
                <span class="font-bold text-[#002777] block">{{ apt.time }}</span>
              </div>
              <div class="p-3 rounded-lg border border-[#e5eeff]">
                <span class="text-[#757682] block text-[11px]">Ubicación y Consultorio:</span>
                <span class="font-bold text-[#0b1c30]">{{ apt.location }}</span>
                <span class="font-bold text-[#0056c3] block">{{ apt.room }}</span>
              </div>
              <div class="p-3 rounded-lg border border-[#e5eeff]">
                <span class="text-[#757682] block text-[11px]">Paciente:</span>
                <span class="font-bold text-[#0b1c30]">{{ apt.patientName }}</span>
                <span class="text-[11px] text-[#757682] block font-mono">{{ apt.patientDocument }}</span>
              </div>
              <div class="p-3 rounded-lg border border-[#e5eeff]">
                <span class="text-[#757682] block text-[11px]">Aseguradora / EPS:</span>
                <span class="font-bold text-[#0b1c30]">{{ apt.insurance }}</span>
                <span class="text-[11px] text-[#0056c3] block font-semibold">Estado: {{ apt.status }}</span>
              </div>
            </div>

            <!-- Preparation & Guidance Note -->
            <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-1">
              <div class="flex items-center gap-2 text-xs font-bold text-[#001549]">
                <span class="material-symbols-outlined text-[#0056c3] text-[18px]">info</span>
                <span>Instrucciones para el ingreso institucional</span>
              </div>
              <p class="text-xs text-[#444651] leading-relaxed">
                Presentarse 15 minutos antes de la hora indicada. Acercarse a los quioscos digitales de auto-atención en el Piso 1 o Piso 4 y escanear el código QR para anunciar su llegada.
              </p>
            </div>

            <!-- Simulated QR Code Barcode for Quick Kiosk Check-In -->
            <div class="p-4 rounded-xl border border-dashed border-[#c5c6d3] flex items-center justify-between bg-white">
              <div>
                <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block">Autocheck-in Hospitalario</span>
                <span class="text-xs font-bold text-[#001549]">Escanea en el quiosco FCV</span>
                <span class="text-[11px] text-[#757682] block font-mono mt-0.5">HASH: FCV-CHECKIN-{{ apt.code }}-AUTH</span>
              </div>
              <div class="w-16 h-16 bg-[#eff4ff] border border-[#dce9ff] rounded-lg p-1 flex items-center justify-center">
                <span class="material-symbols-outlined text-[38px] text-[#001549]">qr_code_2</span>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              (click)="cancelAppointment(apt.id)"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
            >
              Cancelar cita
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printConfirmation()"
                class="px-4 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[16px]">print</span>
                <span>Imprimir volante</span>
              </button>
              <button
                type="button"
                (click)="close()"
                class="px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class AppointmentDetailsModal {
  clinical = inject(ClinicalData);
  logoUrl = FCV_LOGO;

  close() {
    this.clinical.selectedAppointment.set(null);
  }

  cancelAppointment(id: string) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita médica? Esta acción liberará el espacio en la agenda institucional.')) {
      this.clinical.cancelAppointment(id);
    }
  }

  printConfirmation() {
    this.clinical.showToast('Enviando volante digital a la impresora o descargando PDF...', 'success');
  }
}
