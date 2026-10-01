import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-profile-view',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <h1 class="text-2xl font-extrabold text-[#001549]">Perfil Clínico y Datos Personales</h1>
          <p class="text-xs text-[#444651] mt-0.5">Identificación del usuario institucional · Datos de contacto y aseguramiento</p>
        </div>

        <button
          type="button"
          (click)="clinical.showToast('Carné digital institucional FCV generado en tu dispositivo.', 'success')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">badge</span>
          <span>Descargar Carné Digital</span>
        </button>
      </div>

      <!-- Main Profile Information Card -->
      <div class="bg-white rounded-2xl border border-[#e5eeff] p-6 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[#eff4ff]">
          <img
            [src]="clinical.currentUser().avatarUrl"
            [alt]="clinical.currentUser().name"
            class="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#e5eeff]"
            referrerpolicy="no-referrer"
          />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-[#001549]">{{ clinical.currentUser().name }}</h2>
              <span class="text-xs bg-[#eff4ff] text-[#002777] px-2.5 py-0.5 rounded-full font-bold">
                {{ clinical.currentUser().badge }}
              </span>
            </div>
            <p class="text-xs text-[#444651] font-mono">{{ clinical.currentUser().documentType }} {{ clinical.currentUser().documentNumber }}</p>
            <p class="text-xs text-[#0056c3] font-semibold">{{ clinical.currentUser().email }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Aseguradora / EPS</span>
            <span class="font-bold text-[#001549] block mt-1">{{ clinical.currentUser().affiliation }}</span>
            <span class="text-[11px] text-emerald-600 font-semibold">Estado: Activo y cotizante</span>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Teléfono Móvil</span>
            <span class="font-bold text-[#001549] block mt-1">+57 318 492 8109</span>
            <span class="text-[11px] text-[#0056c3]">Validado para SMS y WhatsApp</span>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Contacto de Emergencia</span>
            <span class="font-bold text-[#001549] block mt-1">Carlos Martínez (Hermano)</span>
            <span class="text-[11px] text-[#757682]">+57 315 220 8941</span>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Sede Habitual FCV</span>
            <span class="font-bold text-[#001549] block mt-1">Sede Principal - Bucaramanga</span>
            <span class="text-[11px] text-[#757682]">Instituto Cardiovascular</span>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Consentimientos Informados</span>
            <span class="font-bold text-[#001549] block mt-1">Ley 1581 Habeas Data</span>
            <span class="text-[11px] text-emerald-600 font-semibold">Firmado digitalmente</span>
          </div>

          <div class="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span class="text-[#757682] block text-[11px] uppercase tracking-wider font-semibold">Autenticación Segura</span>
            <span class="font-bold text-[#001549] block mt-1">Cifrado TLS 1.3 Hospitalario</span>
            <span class="text-[11px] text-[#0056c3]">Dispositivo reconocido</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="button"
            (click)="clinical.showToast('Tus datos de contacto han sido actualizados en la base de datos FCV.', 'success')"
            class="px-4 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Actualizar Datos de Contacto
          </button>
        </div>
      </div>

    </div>
  `
})
export class ProfileView {
  clinical = inject(ClinicalData);
}
