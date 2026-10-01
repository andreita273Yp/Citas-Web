import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { AgendaApi, AgendaBlock, BlockInput, ProfessionalProfile } from '../../services/agenda-api';

/** HU-018 a HU-020 · El PROFESSIONAL publica, edita y elimina sus bloques; el backend valida pasado, solapes y sedes. */
@Component({
  selector: 'app-professional-agenda',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './professional-agenda.html',
})
export class ProfessionalAgenda {
  private readonly api = inject(AgendaApi);

  readonly profile = signal<ProfessionalProfile | null>(null);
  readonly blocks = signal<AgendaBlock[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly editingId = signal<number | null>(null);

  readonly today = isoDate(new Date());
  filter: { from: string; to: string; locationId: number | null } = { from: this.today, to: '', locationId: null };
  form: BlockInput = { locationId: 0, date: this.today, startTime: '08:00', endTime: '12:00' };
  edit: BlockInput = { locationId: 0, date: '', startTime: '', endTime: '' };

  constructor() {
    this.api.me().subscribe({
      next: p => { this.profile.set(p); this.form.locationId = p.locations[0]?.id ?? 0; },
      error: e => this.fail(e, 'No fue posible cargar tu perfil profesional.'),
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.blocks({ from: this.filter.from || undefined, to: this.filter.to || undefined, locationId: this.filter.locationId }).subscribe({
      next: v => { this.blocks.set(v); this.loading.set(false); },
      error: e => { this.fail(e, 'No fue posible cargar tu agenda.'); this.loading.set(false); },
    });
  }

  create() {
    this.run(this.api.create({ ...this.form, locationId: Number(this.form.locationId) }), 'Bloque publicado.', () => this.load());
  }

  startEdit(block: AgendaBlock) {
    this.editingId.set(block.id);
    this.edit = { locationId: block.locationId, date: block.date, startTime: block.startTime, endTime: block.endTime };
  }

  saveEdit(block: AgendaBlock) {
    this.run(this.api.update(block.id, { ...this.edit, locationId: Number(this.edit.locationId) }), 'Bloque actualizado.', () => {
      this.editingId.set(null);
      this.load();
    });
  }

  remove(block: AgendaBlock) {
    if (!confirm(`¿Eliminar el bloque del ${block.date} ${block.startTime}–${block.endTime}?`)) return;
    this.run(this.api.remove(block.id), 'Bloque eliminado.', () => this.load());
  }

  /** Solo bloques futuros sin citas comprometidas pueden cambiar (el backend lo vuelve a validar). */
  editable(block: AgendaBlock) {
    return block.bookedSlots === 0 && `${block.date}T${block.startTime}` > nowIso();
  }

  private run<T>(request: Observable<T>, success: string, after: () => void) {
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    request.subscribe({
      next: () => { this.message.set(success); this.saving.set(false); after(); },
      error: e => { this.fail(e, 'No fue posible guardar el bloque.'); this.saving.set(false); },
    });
  }

  private fail(error: unknown, fallback: string) {
    this.error.set(apiErrorMessage(error, fallback));
  }
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function isoDate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function nowIso() { const d = new Date(); return `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
