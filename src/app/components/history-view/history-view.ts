import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-history-view',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <h1 class="text-2xl font-extrabold text-[#001549]">Historial de Atenciones Clínicas</h1>
          <p class="text-xs text-[#444651] mt-0.5">Expediente digital institucional · Informes diagnósticos y resultados</p>
        </div>

        <button
          type="button"
          (click)="clinical.showToast('Descargando copia de historia clínica consolidada FCV (PDF)...', 'success')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#002777] border border-[#dce9ff] text-xs font-semibold shadow-xs transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>
          <span>Descargar Historia Consolidada</span>
        </button>
      </div>

      <!-- Timeline Records -->
      <div class="space-y-4">
        @for (record of clinical.medicalHistory(); track record.id) {
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs hover:border-[#0056c3]/40 transition-all space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#0056c3] text-[20px]">verified</span>
                  <h3 class="text-sm font-bold text-[#001549]">{{ record.specialty }}</h3>
                  <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {{ record.status }}
                  </span>
                </div>
                <p class="text-xs text-[#444651] mt-1 font-medium">Médico tratante: {{ record.doctorName }}</p>
                <p class="text-xs text-[#0b1c30] mt-2 bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] leading-relaxed">
                  <strong>Evolución / Diagnóstico:</strong> {{ record.diagnosis }}
                </p>
              </div>

              <div class="text-left sm:text-right shrink-0">
                <span class="text-xs font-bold text-[#002777] block">{{ record.date }}</span>
                <span class="text-[11px] text-[#757682] block">Fundación Cardiovascular</span>
              </div>
            </div>

            <!-- Documents Attachments -->
            <div class="pt-3 border-t border-[#eff4ff]">
              <span class="text-[11px] font-bold text-[#757682] uppercase tracking-wider block mb-2">
                Documentos y Resultados Oficiales
              </span>
              <div class="flex flex-wrap gap-2">
                @for (doc of record.documents; track doc.title) {
                  <button
                    type="button"
                    (click)="downloadDoc(doc.title)"
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002777] text-xs font-semibold transition-colors cursor-pointer border border-[#dce9ff]"
                  >
                    <span class="material-symbols-outlined text-[16px] text-[#ba1a1a]">picture_as_pdf</span>
                    <span>{{ doc.title }}</span>
                    <span class="text-[10px] text-[#757682] font-mono">({{ doc.size }})</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class HistoryView {
  clinical = inject(ClinicalData);

  downloadDoc(title: string) {
    this.clinical.showToast(`Descargando documento institucional: ${title}`, 'success');
  }
}
