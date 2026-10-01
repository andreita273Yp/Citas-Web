import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';
import { MainView } from '../../models/clinical.models';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between py-4">
      <div class="flex flex-col gap-2">
        <div class="px-6 py-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Menú Clínico</p>
        </div>

        <nav class="flex flex-col gap-1 px-3">
          <button
            type="button"
            (click)="navigate('inicio')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'inicio',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'inicio'
            }"
          >
            <span class="material-symbols-outlined text-[20px]">grid_view</span>
            <span>Inicio</span>
          </button>

          <button
            type="button"
            (click)="navigate('agendar-cita')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'agendar-cita',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'agendar-cita'
            }"
          >
            <span class="material-symbols-outlined text-[20px]">calendar_add_on</span>
            <span>Agendar cita</span>
          </button>

          <button
            type="button"
            (click)="navigate('mis-citas')"
            class="flex items-center justify-between px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'mis-citas',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'mis-citas'
            }"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px]">event_available</span>
              <span>Mis citas</span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              [ngClass]="{
                'bg-white/20 text-white': clinical.currentView() === 'mis-citas',
                'bg-[#eff4ff] text-[#0056c3]': clinical.currentView() !== 'mis-citas'
              }"
            >
              {{ clinical.appointments().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="navigate('historial-de-atenciones')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'historial-de-atenciones',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'historial-de-atenciones'
            }"
          >
            <span class="material-symbols-outlined text-[20px]">clinical_notes</span>
            <span>Historial de atenciones</span>
          </button>

          <button
            type="button"
            (click)="navigate('mi-perfil')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'mi-perfil',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'mi-perfil'
            }"
          >
            <span class="material-symbols-outlined text-[20px]">person</span>
            <span>Mi Perfil</span>
          </button>

          <button
            type="button"
            (click)="navigate('soporte')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all w-full text-left"
            [ngClass]="{
              'bg-[#002777] text-white font-semibold shadow-xs': clinical.currentView() === 'soporte',
              'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]': clinical.currentView() !== 'soporte'
            }"
          >
            <span class="material-symbols-outlined text-[20px]">contact_support</span>
            <span>Soporte</span>
          </button>
        </nav>
      </div>

      <!-- Institutional Contact Card -->
      <div class="px-3">
        <div class="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-1">
          <div class="flex items-center gap-2 text-[#0056c3]">
            <span class="material-symbols-outlined text-[18px]">support_agent</span>
            <span class="text-[11px] font-bold uppercase tracking-wider">Línea FCV 24/7</span>
          </div>
          <span class="text-xs text-[#0b1c30] font-bold">PBX: (607) 639 6767</span>
          <span class="text-[11px] text-[#757682]">Bucaramanga, Santander</span>
        </div>
      </div>
    </aside>
  `
})
export class Sidebar {
  clinical = inject(ClinicalData);

  navigate(view: MainView) {
    this.clinical.setView(view);
  }
}
