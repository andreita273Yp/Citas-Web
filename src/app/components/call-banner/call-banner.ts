import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-call-banner',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clinical.activeConsultationCall(); as call) {
      <div class="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#001549] text-white p-5 rounded-2xl shadow-2xl border-2 border-[#006ef4] animate-in slide-in-from-bottom-5 duration-300">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#006ef4] text-white flex items-center justify-center shrink-0 animate-bounce">
            <span class="material-symbols-outlined text-[28px]">volume_up</span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[10px] font-mono tracking-widest text-sky-300 font-bold uppercase">
                Llamado a Consultorio Activo
              </span>
            </div>
            
            <h4 class="text-base font-black text-white mt-0.5 truncate">
              {{ call.patientName }}
            </h4>
            
            <p class="text-xs text-sky-100 font-semibold mt-0.5">
              Por favor ingresar a: <span class="text-emerald-300 font-bold underline">{{ call.room }}</span>
            </p>
            
            <p class="text-[11px] text-gray-300 mt-1">
              Atiende: {{ call.doctorName }} · Instituto Cardiovascular
            </p>
          </div>

          <button
            type="button"
            (click)="clinical.dismissCall()"
            class="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span class="text-gray-300">Pantalla de Sala de Espera FCV</span>
          <button
            type="button"
            (click)="clinical.dismissCall()"
            class="text-sky-300 hover:underline font-bold"
          >
            Aceptar ingreso
          </button>
        </div>
      </div>
    }
  `
})
export class CallBanner {
  clinical = inject(ClinicalData);
}
