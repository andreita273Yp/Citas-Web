import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-booking-modal',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clinical.isBookingModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#e5eeff] flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="p-5 border-b border-[#e5eeff] flex items-center justify-between bg-gradient-to-r from-white to-[#eff4ff]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#002777] flex items-center justify-center">
                <span class="material-symbols-outlined text-[24px]">calendar_add_on</span>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-[#001549]">Agendamiento de Cita Médica</h3>
                <p class="text-xs text-[#444651]">Fundación Cardiovascular · Sistema de Turnos Clínicos</p>
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

          <!-- Body / Steps Content -->
          <div class="p-6 overflow-y-auto space-y-6">
            
            <!-- Step Indicator -->
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  [ngClass]="step() >= 1 ? 'bg-[#002777] text-white' : 'bg-[#eff4ff] text-[#757682]'">1</span>
                <span class="text-xs font-semibold" [class.text-[#002777]]="step() >= 1">Especialidad</span>
              </div>
              <div class="w-12 h-0.5" [ngClass]="step() >= 2 ? 'bg-[#002777]' : 'bg-[#e5eeff]'"></div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  [ngClass]="step() >= 2 ? 'bg-[#002777] text-white' : 'bg-[#eff4ff] text-[#757682]'">2</span>
                <span class="text-xs font-semibold" [class.text-[#002777]]="step() >= 2">Especialista y Horario</span>
              </div>
              <div class="w-12 h-0.5" [ngClass]="step() >= 3 ? 'bg-[#002777]' : 'bg-[#e5eeff]'"></div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  [ngClass]="step() >= 3 ? 'bg-[#002777] text-white' : 'bg-[#eff4ff] text-[#757682]'">3</span>
                <span class="text-xs font-semibold" [class.text-[#002777]]="step() >= 3">Confirmar</span>
              </div>
            </div>

            <!-- Step 1: Specialty Selection -->
            @if (step() === 1) {
              <div class="space-y-4">
                <span class="block text-xs font-bold text-[#444651] uppercase tracking-wider">
                  Selecciona la especialidad requerida
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (spec of specialties; track spec.name) {
                    <button
                      type="button"
                      (click)="selectedSpecialty.set(spec.name)"
                      class="p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 w-full"
                      [ngClass]="{
                        'border-[#0056c3] bg-[#eff4ff] shadow-xs': selectedSpecialty() === spec.name,
                        'border-[#e5eeff] bg-white hover:border-[#0056c3]/40': selectedSpecialty() !== spec.name
                      }"
                    >
                      <span class="material-symbols-outlined text-[24px]" [class.text-[#0056c3]]="selectedSpecialty() === spec.name" [class.text-[#757682]]="selectedSpecialty() !== spec.name">
                        {{ spec.icon }}
                      </span>
                      <div>
                        <h4 class="text-xs font-bold text-[#001549]">{{ spec.name }}</h4>
                        <p class="text-[11px] text-[#444651] mt-0.5">{{ spec.desc }}</p>
                      </div>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Step 2: Doctor and Slot Selection -->
            @if (step() === 2) {
              <div class="space-y-5">
                <div>
                  <label for="doctor-selection" class="block text-xs font-bold text-[#444651] uppercase tracking-wider mb-2">
                    Profesionales Disponibles en {{ selectedSpecialty() }}
                  </label>
                  <div id="doctor-selection" class="space-y-2">
                    @for (doc of clinical.availableDoctors; track doc.id) {
                      <button
                        type="button"
                        (click)="selectedDoctor.set(doc.name)"
                        class="p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between w-full"
                        [ngClass]="{
                          'border-[#0056c3] bg-[#eff4ff] shadow-xs': selectedDoctor() === doc.name,
                          'border-[#e5eeff] bg-white hover:border-[#0056c3]/40': selectedDoctor() !== doc.name
                        }"
                      >
                        <div class="flex items-center gap-3">
                          <img [src]="doc.avatar" [alt]="doc.name" class="w-10 h-10 rounded-full object-cover" referrerpolicy="no-referrer" />
                          <div>
                            <h4 class="text-xs font-bold text-[#001549]">{{ doc.name }}</h4>
                            <p class="text-[11px] text-[#0056c3]">{{ doc.specialty }} · {{ doc.room }}</p>
                            <p class="text-[10px] text-[#757682]">{{ doc.sede }}</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-[11px] font-bold text-[#002777] bg-white px-2 py-0.5 rounded border border-[#dce9ff] block">
                            {{ doc.nextSlot }}
                          </span>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Date & Time Slot Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label for="booking-date" class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Fecha de la Consulta</label>
                    <select
                      id="booking-date"
                      [(ngModel)]="selectedDate"
                      class="w-full py-2 px-3 rounded-lg border border-[#c5c6d3] text-xs font-medium text-[#0b1c30] bg-white"
                    >
                      <option value="Jueves, 24 de Octubre de 2024">Jueves, 24 de Octubre de 2024</option>
                      <option value="Viernes, 25 de Octubre de 2024">Viernes, 25 de Octubre de 2024</option>
                      <option value="Lunes, 28 de Octubre de 2024">Lunes, 28 de Octubre de 2024</option>
                      <option value="Martes, 29 de Octubre de 2024">Martes, 29 de Octubre de 2024</option>
                    </select>
                  </div>

                  <div>
                    <span class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Franja Horaria Disponible</span>
                    <div class="grid grid-cols-3 gap-1.5">
                      @for (slot of timeSlots; track slot) {
                        <button
                          type="button"
                          (click)="selectedTime.set(slot)"
                          class="py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center"
                          [ngClass]="{
                            'bg-[#002777] text-white border-[#002777] shadow-xs': selectedTime() === slot,
                            'bg-white text-[#444651] border-[#c5c6d3] hover:border-[#0056c3]': selectedTime() !== slot
                          }"
                        >
                          {{ slot }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Step 3: Modality and Reason Confirmation -->
            @if (step() === 3) {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
                  <div class="text-xs font-bold text-[#002777] uppercase tracking-wider">Resumen de la Cita Médica</div>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span class="text-[#757682] block">Especialidad:</span>
                      <span class="font-bold text-[#001549]">{{ selectedSpecialty() }}</span>
                    </div>
                    <div>
                      <span class="text-[#757682] block">Profesional:</span>
                      <span class="font-bold text-[#001549]">{{ selectedDoctor() }}</span>
                    </div>
                    <div>
                      <span class="text-[#757682] block">Fecha y Hora:</span>
                      <span class="font-bold text-[#001549]">{{ selectedDate }} · {{ selectedTime() }}</span>
                    </div>
                    <div>
                      <span class="text-[#757682] block">Sede:</span>
                      <span class="font-bold text-[#001549]">Instituto Cardiovascular (Cons. 412)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Modalidad de Atención</span>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      (click)="selectedModality.set('Presencial')"
                      class="p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all"
                      [ngClass]="{
                        'bg-[#002777] text-white border-[#002777]': selectedModality() === 'Presencial',
                        'bg-white text-[#444651] border-[#c5c6d3]': selectedModality() !== 'Presencial'
                      }"
                    >
                      <span class="material-symbols-outlined text-[18px]">apartment</span>
                      <span>Presencial (Sede FCV)</span>
                    </button>
                    <button
                      type="button"
                      (click)="selectedModality.set('Telemedicina')"
                      class="p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all"
                      [ngClass]="{
                        'bg-[#002777] text-white border-[#002777]': selectedModality() === 'Telemedicina',
                        'bg-white text-[#444651] border-[#c5c6d3]': selectedModality() !== 'Telemedicina'
                      }"
                    >
                      <span class="material-symbols-outlined text-[18px]">videocam</span>
                      <span>Telemedicina FCV</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label for="consult-reason" class="block text-xs font-semibold text-[#0b1c30] mb-1.5">Motivo de Consulta o Síntomas</label>
                  <textarea
                    id="consult-reason"
                    [(ngModel)]="consultReason"
                    rows="3"
                    placeholder="Describe brevemente el motivo de tu consulta, revisión de exámenes o síntomas recientes..."
                    class="w-full p-3 rounded-lg border border-[#c5c6d3] text-xs text-[#0b1c30] focus:outline-none focus:border-[#0056c3]"
                  ></textarea>
                </div>
              </div>
            }

          </div>

          <!-- Footer Actions -->
          <div class="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
            @if (step() > 1) {
              <button
                type="button"
                (click)="prevStep()"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-[#444651] hover:bg-white border border-transparent hover:border-[#c5c6d3] transition-colors"
              >
                Atrás
              </button>
            } @else {
              <div></div>
            }

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="close()"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-[#757682] hover:bg-white transition-colors"
              >
                Cancelar
              </button>

              @if (step() < 3) {
                <button
                  type="button"
                  (click)="nextStep()"
                  class="px-5 py-2 rounded-xl bg-[#002777] hover:bg-[#0056c3] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Continuar
                </button>
              } @else {
                <button
                  type="button"
                  (click)="confirmBooking()"
                  class="px-5 py-2 rounded-xl bg-[#0056c3] hover:bg-[#002777] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Confirmar y Generar Cita</span>
                </button>
              }
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class BookingModal {
  clinical = inject(ClinicalData);

  step = signal<number>(1);
  selectedSpecialty = signal<string>('Cardiología Clínica');
  selectedDoctor = signal<string>('Dr. Andrés Gómez');
  selectedDate = 'Jueves, 24 de Octubre de 2024';
  selectedTime = signal<string>('09:30 AM');
  selectedModality = signal<'Presencial' | 'Telemedicina'>('Presencial');
  consultReason = 'Consulta de control y revisión de resultados de laboratorio';

  specialties = [
    { name: 'Cardiología Clínica', icon: 'cardiology', desc: 'Evaluación cardiovascular, hipertensión y chequeo preventivo.' },
    { name: 'Ecocardiografía & Imágenes', icon: 'vital_signs', desc: 'Ecocardiogramas Doppler, tomografía y resonancia cardíaca.' },
    { name: 'Electrofisiología y Arritmias', icon: 'ecg_heart', desc: 'Marcapasos, holter 48h, ablaciones y estudio de síncope.' },
    { name: 'Cirugía Cardiovascular Pediátrica', icon: 'child_care', desc: 'Atención médica integral en cardiopatías congénitas.' }
  ];

  timeSlots = ['08:00 AM', '09:30 AM', '11:00 AM', '14:00 PM', '15:30 PM', '16:45 PM'];

  close() {
    this.clinical.isBookingModalOpen.set(false);
    this.step.set(1);
  }

  prevStep() {
    this.step.update(s => Math.max(1, s - 1));
  }

  nextStep() {
    this.step.update(s => Math.min(3, s + 1));
  }

  confirmBooking() {
    this.clinical.bookAppointment({
      specialty: this.selectedSpecialty(),
      doctorName: this.selectedDoctor(),
      date: this.selectedDate,
      time: this.selectedTime(),
      type: this.selectedModality(),
      reason: this.consultReason
    });
  }
}
