import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';
import { Appointment } from '../../models/clinical.models';

@Component({
  selector: 'app-appointments-view',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <h1 class="text-2xl font-extrabold text-[#001549]">Mis Citas y Autorizaciones</h1>
          <p class="text-xs text-[#444651] mt-0.5">Gestión integral de consultas presenciales y telemedicina institucional</p>
        </div>

        <button
          type="button"
          (click)="openBooking()"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Agendar Nueva Cita</span>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 border-b border-[#e5eeff] pb-2 text-xs">
        <button
          type="button"
          (click)="filter.set('todas')"
          class="px-3.5 py-1.5 rounded-lg font-semibold transition-all"
          [ngClass]="{
            'bg-[#002777] text-white shadow-xs': filter() === 'todas',
            'text-[#444651] hover:bg-[#eff4ff]': filter() !== 'todas'
          }"
        >
          Todas ({{ clinical.appointments().length }})
        </button>
        <button
          type="button"
          (click)="filter.set('programadas')"
          class="px-3.5 py-1.5 rounded-lg font-semibold transition-all"
          [ngClass]="{
            'bg-[#002777] text-white shadow-xs': filter() === 'programadas',
            'text-[#444651] hover:bg-[#eff4ff]': filter() !== 'programadas'
          }"
        >
          Programadas ({{ scheduledCount() }})
        </button>
        <button
          type="button"
          (click)="filter.set('canceladas')"
          class="px-3.5 py-1.5 rounded-lg font-semibold transition-all"
          [ngClass]="{
            'bg-[#002777] text-white shadow-xs': filter() === 'canceladas',
            'text-[#444651] hover:bg-[#eff4ff]': filter() !== 'canceladas'
          }"
        >
          Canceladas ({{ canceledCount() }})
        </button>
      </div>

      <!-- Appointments List Grid -->
      <div class="space-y-4">
        @for (apt of filteredAppointments(); track apt.id) {
          <div class="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs hover:border-[#0056c3]/40 transition-all space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <img
                  [src]="apt.doctorAvatar"
                  [alt]="apt.doctorName"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-[#e5eeff]"
                  referrerpolicy="no-referrer"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-[#001549]">{{ apt.doctorName }}</h3>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      [ngClass]="{
                        'bg-[#eff4ff] text-[#002777]': apt.status === 'Confirmada',
                        'bg-[#ffdad6] text-[#93000a]': apt.status === 'Cancelada',
                        'bg-emerald-50 text-emerald-700': apt.status === 'En atención'
                      }">
                      {{ apt.status }}
                    </span>
                  </div>
                  <p class="text-xs text-[#0056c3] font-semibold">{{ apt.specialty }}</p>
                  <p class="text-xs text-[#444651] mt-1">{{ apt.reason }}</p>
                </div>
              </div>

              <div class="text-left sm:text-right">
                <span class="text-xs font-extrabold text-[#001549] block">{{ apt.date }}</span>
                <span class="text-xs text-[#0056c3] font-bold block">{{ apt.time }}</span>
                <span class="text-[11px] text-[#757682] block">{{ apt.location }}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#eff4ff] text-xs">
              <div class="flex items-center gap-2 text-[#757682]">
                <span>Cód: <strong class="font-mono text-[#002777]">{{ apt.code }}</strong></span>
                <span>·</span>
                <span>{{ apt.type }}</span>
                <span>·</span>
                <span class="text-[#002777] font-semibold">{{ apt.room }}</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="viewDetails(apt)"
                  class="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002777] font-semibold transition-colors"
                >
                  Ver Volante
                </button>
                @if (apt.status !== 'Cancelada') {
                  <button
                    type="button"
                    (click)="clinical.cancelAppointment(apt.id)"
                    class="px-3 py-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="p-12 text-center bg-white rounded-2xl border border-[#e5eeff]">
            <p class="text-sm font-bold text-[#001549]">No hay citas en este estado</p>
            <p class="text-xs text-[#757682] mt-1">Usa el botón de Agendar Nueva Cita para reservar tu espacio institucional.</p>
          </div>
        }
      </div>

    </div>
  `
})
export class AppointmentsView {
  clinical = inject(ClinicalData);
  filter = signal<'todas' | 'programadas' | 'canceladas'>('todas');

  scheduledCount = computed(() =>
    this.clinical.appointments().filter(a => a.status !== 'Cancelada').length
  );

  canceledCount = computed(() =>
    this.clinical.appointments().filter(a => a.status === 'Cancelada').length
  );

  filteredAppointments = computed(() => {
    const f = this.filter();
    const list = this.clinical.appointments();
    if (f === 'programadas') return list.filter(a => a.status !== 'Cancelada');
    if (f === 'canceladas') return list.filter(a => a.status === 'Cancelada');
    return list;
  });

  openBooking() {
    this.clinical.isBookingModalOpen.set(true);
  }

  viewDetails(apt: Appointment) {
    this.clinical.selectedAppointment.set(apt);
  }
}
