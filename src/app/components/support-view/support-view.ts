import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-support-view',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <h1 class="text-2xl font-extrabold text-[#001549]">Canales de Soporte y Orientación FCV</h1>
          <p class="text-xs text-[#444651] mt-0.5">Asistencia al usuario, líneas PBX, sedes y preguntas frecuentes</p>
        </div>

        <button
          type="button"
          (click)="clinical.showToast('Conectando con asistente virtual FCV en WhatsApp...', 'info')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">chat</span>
          <span>Chat Asistencial WhatsApp</span>
        </button>
      </div>

      <!-- Support Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-2">
          <div class="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0056c3] flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">call</span>
          </div>
          <h3 class="text-sm font-bold text-[#001549]">Central Telefónica PBX</h3>
          <p class="text-xs text-[#444651]">Línea directa institucional para citas y trámites asistenciales:</p>
          <p class="text-sm font-black text-[#002777] font-mono">(607) 639 6767</p>
          <span class="text-[10px] text-[#757682] block">Disponible 24 horas los 365 días del año</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-2">
          <div class="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#002777] flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">local_hospital</span>
          </div>
          <h3 class="text-sm font-bold text-[#001549]">Hospital Internacional (HIC)</h3>
          <p class="text-xs text-[#444651]">Km 7 Autopista Bucaramanga - Piedecuesta</p>
          <p class="text-xs font-bold text-[#001549]">Torre Médica y Centro de Cáncer</p>
          <span class="text-[10px] text-[#0056c3] font-semibold block">Servicio de Urgencias y UCI Adulto / Pediátrica</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-2">
          <div class="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0056c3] flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">cardiology</span>
          </div>
          <h3 class="text-sm font-bold text-[#001549]">Instituto Cardiovascular</h3>
          <p class="text-xs text-[#444651]">Calle 155A No. 23-58 · El Bosque, Floridablanca</p>
          <p class="text-xs font-bold text-[#001549]">Consultorios 412 - Torre Especialistas</p>
          <span class="text-[10px] text-[#0056c3] font-semibold block">Hemodinamia y Consulta Externa</span>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white rounded-2xl border border-[#e5eeff] p-6 shadow-xs space-y-4">
        <h3 class="text-sm font-bold text-[#001549]">Preguntas Frecuentes de Agendamiento</h3>
        
        <div class="space-y-3 text-xs">
          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <h4 class="font-bold text-[#001549] mb-1">¿Con cuánta anticipación debo llegar a mi cita médica?</h4>
            <p class="text-[#444651] leading-relaxed">
              Te recomendamos presentarte 15 minutos antes de la hora programada en caso de consultas especializadas presenciales, o 30 minutos antes si requieres apertura de historia clínica o trámites con tu aseguradora de salud.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <h4 class="font-bold text-[#001549] mb-1">¿Qué documentos debo presentar en el consultorio?</h4>
            <p class="text-[#444651] leading-relaxed">
              Documento de identidad original (Cédula o Tarjeta de Identidad), orden médica vigente emitida por tu EPS o médico tratante (si aplica), y los resultados de exámenes de laboratorio o estudios previos pertinentes.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <h4 class="font-bold text-[#001549] mb-1">¿Cómo puedo reprogramar o cancelar una cita?</h4>
            <p class="text-[#444651] leading-relaxed">
              Puedes hacerlo directamente desde la sección "Mis citas" de este portal con hasta 4 horas de anticipación, o comunicándote con nuestro conmutador institucional (607) 639 6767.
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SupportView {
  clinical = inject(ClinicalData);
}
