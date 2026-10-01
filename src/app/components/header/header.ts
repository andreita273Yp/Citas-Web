import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData, FCV_LOGO } from '../../services/clinical-data';
import { UserRole } from '../../models/clinical.models';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Left: Logo and Sede Selector -->
      <div class="flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          class="flex items-center gap-3 cursor-pointer text-left bg-transparent border-0 p-0"
          (click)="clinical.setView('inicio')"
        >
          <img
            [src]="logoUrl"
            alt="FCV Official Brand Logo"
            class="h-9 sm:h-10 w-auto object-contain"
            referrerpolicy="no-referrer"
          />
          <div class="hidden sm:flex flex-col">
            <span class="text-xs font-bold uppercase tracking-wider text-[#001549]">Fundación Cardiovascular</span>
            <span class="text-[11px] text-[#444651]">Sistema Clínico Institucional</span>
          </div>
        </button>

        <!-- Sede selector dropdown -->
        <div class="relative hidden md:block">
          <button
            type="button"
            (click)="toggleSedeDropdown()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] text-[#001549] text-xs font-semibold transition-colors"
          >
            <span class="material-symbols-outlined text-[16px] text-[#0056c3]">location_on</span>
            <span>{{ clinical.currentSede() }}</span>
            <span class="material-symbols-outlined text-[16px] text-[#757682]">expand_more</span>
          </button>

          @if (isSedeOpen()) {
            <div class="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#e5eeff] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div class="px-3 py-1.5 text-[11px] font-bold text-[#757682] uppercase tracking-wider">
                Sedes de Atención FCV
              </div>
              <button
                type="button"
                (click)="selectSede('Sede Principal - Bucaramanga')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center justify-between font-medium text-[#0b1c30]"
              >
                <span>Sede Principal - Bucaramanga</span>
                @if (clinical.currentSede() === 'Sede Principal - Bucaramanga') {
                  <span class="material-symbols-outlined text-[16px] text-[#0056c3]">check</span>
                }
              </button>
              <button
                type="button"
                (click)="selectSede('Hospital Internacional de Colombia (HIC) - Piedecuesta')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center justify-between font-medium text-[#0b1c30]"
              >
                <span>Hospital Internacional de Colombia (HIC)</span>
                @if (clinical.currentSede() === 'Hospital Internacional de Colombia (HIC) - Piedecuesta') {
                  <span class="material-symbols-outlined text-[16px] text-[#0056c3]">check</span>
                }
              </button>
              <button
                type="button"
                (click)="selectSede('Instituto Cardiovascular - Floridablanca')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center justify-between font-medium text-[#0b1c30]"
              >
                <span>Instituto Cardiovascular - Floridablanca</span>
                @if (clinical.currentSede() === 'Instituto Cardiovascular - Floridablanca') {
                  <span class="material-symbols-outlined text-[16px] text-[#0056c3]">check</span>
                }
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Right: Role Switcher, Notifications, Profile, Logout -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Interactive Role Switcher Pill -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleRoleDropdown()"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-all"
            [ngClass]="{
              'bg-[#002777] text-white': clinical.currentRole() === 'patient',
              'bg-[#0056c3] text-white': clinical.currentRole() === 'doctor',
              'bg-[#001549] text-white': clinical.currentRole() === 'admin'
            }"
          >
            <span class="material-symbols-outlined text-[15px]">
              {{ clinical.currentRole() === 'patient' ? 'verified_user' : clinical.currentRole() === 'doctor' ? 'stethoscope' : 'admin_panel_settings' }}
            </span>
            <span class="uppercase tracking-wider">
              {{ clinical.currentRole() === 'patient' ? 'Portal Pacientes' : clinical.currentRole() === 'doctor' ? 'Portal Médico' : 'Portal Administrador' }}
            </span>
            <span class="material-symbols-outlined text-[15px] opacity-80">arrow_drop_down</span>
          </button>

          @if (isRoleOpen()) {
            <div class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e5eeff] py-2 z-50">
              <div class="px-3 py-1 text-[11px] font-bold text-[#757682] uppercase tracking-wider border-b border-[#e5eeff] pb-1.5 mb-1">
                Cambiar Perfil Activo
              </div>
              <button
                type="button"
                (click)="switchRole('patient')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center gap-2"
                [class.bg-[#eff4ff]]="clinical.currentRole() === 'patient'"
              >
                <span class="w-2 h-2 rounded-full bg-[#002777]"></span>
                <div>
                  <div class="font-bold text-[#001549]">Laura Martínez</div>
                  <div class="text-[11px] text-[#444651]">Portal de Pacientes (EPS Sanitas)</div>
                </div>
              </button>
              <button
                type="button"
                (click)="switchRole('doctor')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center gap-2"
                [class.bg-[#eff4ff]]="clinical.currentRole() === 'doctor'"
              >
                <span class="w-2 h-2 rounded-full bg-[#0056c3]"></span>
                <div>
                  <div class="font-bold text-[#001549]">Dr. Andrés Gómez</div>
                  <div class="text-[11px] text-[#444651]">Cardiología Clínica (Consultorio 412)</div>
                </div>
              </button>
              <button
                type="button"
                (click)="switchRole('admin')"
                class="w-full text-left px-3 py-2 text-xs hover:bg-[#eff4ff] flex items-center gap-2"
                [class.bg-[#eff4ff]]="clinical.currentRole() === 'admin'"
              >
                <span class="w-2 h-2 rounded-full bg-[#001549]"></span>
                <div>
                  <div class="font-bold text-[#001549]">Dra. Marcela Cadena</div>
                  <div class="text-[11px] text-[#444651]">Centro de Gestión y Agendamiento</div>
                </div>
              </button>
            </div>
          }
        </div>

        <!-- Notifications button -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleNotifications()"
            class="relative p-2 rounded-full text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Notificaciones Clínicas"
          >
            <span class="material-symbols-outlined text-[22px]">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
          </button>

          @if (isNotificationsOpen()) {
            <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#e5eeff] p-3 z-50">
              <div class="flex items-center justify-between pb-2 border-b border-[#eff4ff] mb-2">
                <span class="text-xs font-bold text-[#001549]">Avisos Institucionales FCV</span>
                <span class="text-[10px] bg-[#eff4ff] text-[#0056c3] px-2 py-0.5 rounded-full font-bold">2 Nuevas</span>
              </div>
              <div class="space-y-2">
                <div class="p-2.5 rounded-lg bg-[#eff4ff] text-xs">
                  <div class="font-bold text-[#002777]">Cita Confirmada para Hoy</div>
                  <div class="text-[#444651] text-[11px] mt-0.5">Control con Dr. Andrés Gómez a las 09:30 AM en Cons. 412.</div>
                </div>
                <div class="p-2.5 rounded-lg bg-[#eff4ff] text-xs">
                  <div class="font-bold text-[#002777]">Resultados PACS Disponibles</div>
                  <div class="text-[#444651] text-[11px] mt-0.5">Ecocardiograma transtorácico listo para consulta médica.</div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Profile badge -->
        <button
          type="button"
          class="flex items-center gap-2 pl-2 border-l border-[#e5eeff] cursor-pointer text-left bg-transparent border-t-0 border-r-0 border-b-0"
          (click)="clinical.setView('mi-perfil')"
        >
          <img
            [src]="clinical.currentUser().avatarUrl"
            [alt]="clinical.currentUser().name"
            class="w-9 h-9 rounded-full object-cover ring-1 ring-[#e5eeff]"
            referrerpolicy="no-referrer"
          />
          <div class="hidden xl:flex flex-col text-left leading-tight">
            <span class="text-xs font-bold text-[#0b1c30]">{{ clinical.currentUser().name }}</span>
            <span class="text-[11px] text-[#444651]">{{ clinical.currentUser().title || clinical.currentUser().badge }}</span>
          </div>
        </button>

        <!-- Logout Action -->
        <button
          type="button"
          (click)="clinical.logout()"
          class="p-2 rounded-lg text-[#444651] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
          title="Cerrar sesión"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  `
})
export class Header {
  clinical = inject(ClinicalData);
  logoUrl = FCV_LOGO;

  isSedeOpen = signal(false);
  isRoleOpen = signal(false);
  isNotificationsOpen = signal(false);

  toggleSedeDropdown() {
    this.isSedeOpen.update(v => !v);
    this.isRoleOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  toggleRoleDropdown() {
    this.isRoleOpen.update(v => !v);
    this.isSedeOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  toggleNotifications() {
    this.isNotificationsOpen.update(v => !v);
    this.isSedeOpen.set(false);
    this.isRoleOpen.set(false);
  }

  selectSede(sede: string) {
    this.clinical.setSede(sede);
    this.isSedeOpen.set(false);
  }

  switchRole(role: UserRole) {
    this.clinical.setRole(role);
    this.isRoleOpen.set(false);
  }
}
