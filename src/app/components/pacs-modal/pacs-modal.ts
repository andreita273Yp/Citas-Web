import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../services/clinical-data';

@Component({
  selector: 'app-pacs-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clinical.isPacsModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-[#0b131e] text-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh]">
          
          <!-- PACS Viewer Top Toolbar -->
          <div class="p-4 bg-[#050b14] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#0056c3]/30 text-[#81d1f6] flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">vital_signs</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-white tracking-wide">Visor Clínico PACS / DICOM</h3>
                  <span class="text-[10px] bg-[#0056c3] text-white px-2 py-0.5 rounded font-mono font-bold">CALIBRADO</span>
                </div>
                <p class="text-[11px] text-gray-400 font-mono">
                  Paciente: {{ clinical.selectedPacsPatient() }} · ID: PACS-FCV-2024-9981 · Modalidad: US (Doppler)
                </p>
              </div>
            </div>

            <!-- Toolbar tools -->
            <div class="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                (click)="togglePlay()"
                class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">{{ isPlaying() ? 'pause' : 'play_arrow' }}</span>
                <span>{{ isPlaying() ? 'Pausar Cine' : 'Reproducir Cine' }}</span>
              </button>

              <button
                type="button"
                (click)="toggleZoom()"
                class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">zoom_in</span>
                <span>Zoom: {{ zoomLevel() }}x</span>
              </button>

              <button
                type="button"
                (click)="invertImage()"
                class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">contrast</span>
                <span>Contraste</span>
              </button>

              <button
                type="button"
                (click)="close()"
                class="p-1.5 ml-2 rounded-lg bg-white/10 hover:bg-red-500/40 text-gray-300 hover:text-white transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <!-- Main Diagnostic Canvas & Metadata Layout -->
          <div class="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto bg-black">
            
            <!-- Main Simulated Ultrasound / Echocardiogram Screen -->
            <div class="lg:col-span-2 bg-[#080d14] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center min-h-[340px]">
              
              <!-- Medical Metadata Watermark Overlay -->
              <div class="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 space-y-0.5 pointer-events-none select-none">
                <div>FUNDACIÓN CARDIOVASCULAR (FCV)</div>
                <div>INSTITUTO CARDIOVASCULAR DE COLOMBIA</div>
                <div>PROBE: S5-1 Cardiac Sector (3.5 MHz)</div>
                <div>FPS: 54 Hz · MI: 1.1 · TIS: 0.8</div>
                <div>GAIN: {{ gain() }} dB · DYN: 60 dB</div>
              </div>

              <div class="absolute top-3 right-3 text-[10px] font-mono text-gray-400 text-right pointer-events-none select-none">
                <div>24-OCT-2024 10:14:02</div>
                <div>FRAME: {{ currentFrame() }}/60</div>
                <div class="text-sky-400">DOPPLER VEL: 1.2 m/s</div>
              </div>

              <!-- High-Fidelity SVG Ultrasound Visualization -->
              <div
                class="transition-transform duration-200"
                [style.transform]="'scale(' + zoomLevel() + ')'"
                [class.filter]="isInverted()"
                [style.filter]="isInverted() ? 'invert(1)' : 'none'"
              >
                <svg viewBox="0 0 400 300" class="w-80 sm:w-96 h-auto drop-shadow-2xl">
                  <!-- Ultrasound Sector Beam Fan -->
                  <defs>
                    <radialGradient id="beamGlow" cx="50%" cy="0%" r="90%">
                      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
                      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.15"/>
                      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="dopplerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
                      <stop offset="50%" stop-color="#eab308" stop-opacity="0.7"/>
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.85"/>
                    </linearGradient>
                  </defs>

                  <!-- Beam Sector Fan -->
                  <path d="M200,20 L360,260 A210,210 0 0,1 40,260 Z" fill="url(#beamGlow)" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.6"/>

                  <!-- Cardiac Chambers Anatomy Outline (Apical 4 Chamber) -->
                  <!-- Left Ventricle & Right Ventricle -->
                  <path d="M200,50 Q230,130 250,200 Q200,220 180,200 Q150,130 200,50" fill="none" stroke="#e0f2fe" stroke-width="2.5" opacity="0.85"/>
                  <!-- Interventricular Septum -->
                  <path d="M200,55 Q195,140 190,210" fill="none" stroke="#bae6fd" stroke-width="3" opacity="0.9"/>
                  <!-- Mitral & Tricuspid Valves Motion -->
                  <line x1="180" y1="180" x2="220" y2="185" stroke="#f0f9ff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
                  <!-- Atria -->
                  <path d="M160,210 Q140,250 175,255 Q195,250 190,210" fill="none" stroke="#7dd3fc" stroke-width="1.8" opacity="0.75"/>
                  <path d="M190,210 Q215,250 245,255 Q260,240 240,210" fill="none" stroke="#7dd3fc" stroke-width="1.8" opacity="0.75"/>

                  <!-- Color Doppler Jet Simulation -->
                  <ellipse cx="205" cy="180" rx="16" ry="24" fill="url(#dopplerGradient)" opacity="0.75"/>

                  <!-- Calibration Grid Tick Marks -->
                  <line x1="370" y1="60" x2="380" y2="60" stroke="#94a3b8" stroke-width="1.5"/>
                  <line x1="370" y1="120" x2="380" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
                  <line x1="370" y1="180" x2="380" y2="180" stroke="#94a3b8" stroke-width="1.5"/>
                  <line x1="370" y1="240" x2="380" y2="240" stroke="#94a3b8" stroke-width="1.5"/>
                </svg>
              </div>

              <!-- Depth Scale Indicator on Bottom -->
              <div class="absolute bottom-2 left-3 text-[10px] font-mono text-gray-400">
                16 cm · ECG Sync 68 BPM · Sin Arritmias
              </div>
            </div>

            <!-- Right: Diagnostic Findings & Measurements Panel -->
            <div class="bg-[#0e1624] p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="border-b border-white/10 pb-2">
                  <span class="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Mediciones Hemodinámicas</span>
                  <h4 class="text-xs font-bold text-white mt-0.5">Ecocardiograma Transtorácico</h4>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="flex justify-between py-1 border-b border-white/5">
                    <span class="text-gray-400">Fracción de Eyección (FEVI):</span>
                    <span class="font-mono font-bold text-emerald-400">62% (Normal)</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/5">
                    <span class="text-gray-400">Diámetro Diastólico VI:</span>
                    <span class="font-mono font-bold text-white">48 mm</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/5">
                    <span class="text-gray-400">Grosor Septal:</span>
                    <span class="font-mono font-bold text-white">10.2 mm</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/5">
                    <span class="text-gray-400">Gradiente Aórtico Máx:</span>
                    <span class="font-mono font-bold text-white">7.8 mmHg</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/5">
                    <span class="text-gray-400">Válvula Mitral:</span>
                    <span class="font-mono font-bold text-sky-300">Insuficiencia leve</span>
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Conclusión Imagenológica:</span>
                  <p class="text-gray-200 text-[11px] leading-relaxed">
                    Función sistólica del ventrículo izquierdo conservada. Sin alteraciones segmentarias de contractilidad. Patrón de llenado diastólico normal.
                  </p>
                </div>
              </div>

              <div class="space-y-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  (click)="attachToRecord()"
                  class="w-full py-2 px-3 rounded-lg bg-[#0056c3] hover:bg-[#002777] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-[16px]">attachment</span>
                  <span>Adjuntar informe a Historia Clínica</span>
                </button>
                <button
                  type="button"
                  (click)="close()"
                  class="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold transition-colors"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    }
  `
})
export class PacsModal {
  clinical = inject(ClinicalData);

  isPlaying = signal(true);
  zoomLevel = signal(1.0);
  isInverted = signal(false);
  gain = signal(52);
  currentFrame = signal(34);

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  toggleZoom() {
    this.zoomLevel.update(z => (z === 1.0 ? 1.5 : z === 1.5 ? 2.0 : 1.0));
  }

  invertImage() {
    this.isInverted.update(v => !v);
  }

  attachToRecord() {
    this.clinical.showToast('Informe PACS adjuntado exitosamente a la evolución de Mariana Silva Rincón.', 'success');
    this.close();
  }

  close() {
    this.clinical.isPacsModalOpen.set(false);
  }
}
