import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalData, FCV_BACKGROUND, FCV_LOGO } from '../../services/clinical-data';
import { AuthApi } from '../../services/auth-api';
import { AuthSession } from '../../services/auth-session';
import { IdentityApi, Eps, EpsPlan } from '../../services/identity-api';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen grid place-items-center bg-[#f8f9ff] p-4 sm:p-8">
      <section class="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e5eeff] bg-white shadow-2xl lg:grid lg:grid-cols-2">
        <div class="p-7 sm:p-10">
          <div class="mb-8 flex items-center gap-3">
            <img [src]="logoUrl" alt="Logo FCV" class="h-10 w-auto" referrerpolicy="no-referrer">
            <span class="border-l border-[#c5c6d3] pl-3 text-xs font-bold uppercase tracking-wider text-[#444651]">Portal de citas</span>
          </div>
          @if (mode() === 'login') {
            <h1 class="text-3xl font-extrabold text-[#002777]">Inicia sesión</h1>
            <p class="mt-2 text-sm text-[#444651]">Accede con el correo y contraseña de tu cuenta.</p>
            <form class="mt-7 space-y-4" (ngSubmit)="login()">
              <label class="block text-sm font-semibold text-[#0b1c30]">Correo electrónico<input [(ngModel)]="loginEmail" name="loginEmail" type="email" required autocomplete="email" [disabled]="submitting()" class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm focus:border-[#0056c3] focus:outline-none"></label>
              <label class="block text-sm font-semibold text-[#0b1c30]">Contraseña<input [(ngModel)]="loginPassword" name="loginPassword" type="password" required autocomplete="current-password" [disabled]="submitting()" class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm focus:border-[#0056c3] focus:outline-none"></label>
              @if (error()) { <p class="rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
              @if (message()) { <p class="rounded-lg bg-[#e5f5e7] p-3 text-sm text-[#0b5d1e]" role="status">{{ message() }}</p> }
              <button type="submit" [disabled]="submitting()" class="w-full rounded-xl bg-[#002777] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{{ submitting() ? 'Validando…' : 'Iniciar sesión' }}</button>
            </form>
            <p class="mt-6 text-center text-sm text-[#444651]">¿No tienes cuenta? <button type="button" (click)="showRegistration()" class="font-bold text-[#006ef4] hover:underline">Regístrate como paciente</button></p>
            <p class="mt-3 text-center text-sm text-[#444651]"><button type="button" (click)="showRecovery()" class="font-bold text-[#006ef4] hover:underline">¿Olvidaste tu contraseña?</button></p>
          } @else if (mode() === 'recovery') {
            <h1 class="text-3xl font-extrabold text-[#002777]">Recuperar acceso</h1>
            <p class="mt-2 text-sm text-[#444651]">Ingresa tu correo. La respuesta será la misma exista o no una cuenta.</p>
            <form class="mt-7 space-y-4" (ngSubmit)="recover()">
              <label class="block text-sm font-semibold text-[#0b1c30]">Correo electrónico<input [(ngModel)]="recoveryEmail" name="recoveryEmail" type="email" required class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm"></label>
              @if (error()) { <p class="rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
              @if (message()) { <p class="rounded-lg bg-[#e5f5e7] p-3 text-sm text-[#0b5d1e]" role="status">{{ message() }}</p> }
              <button type="submit" [disabled]="submitting()" class="w-full rounded-xl bg-[#002777] px-4 py-3 text-sm font-bold text-white">Solicitar recuperación</button>
            </form>
            <p class="mt-4 text-center text-sm"><button type="button" (click)="showReset()" class="font-bold text-[#006ef4] hover:underline">Ya tengo un token</button></p>
            <p class="mt-5 text-center text-sm"><button type="button" (click)="showLogin()" class="font-bold text-[#006ef4] hover:underline">Volver a iniciar sesión</button></p>
          } @else if (mode() === 'reset') {
            <h1 class="text-3xl font-extrabold text-[#002777]">Nueva contraseña</h1>
            <p class="mt-2 text-sm text-[#444651]">Usa el token temporal entregado por el canal local autorizado.</p>
            <form class="mt-7 space-y-4" (ngSubmit)="resetPassword()">
              <label class="block text-sm font-semibold text-[#0b1c30]">Token<input [(ngModel)]="resetToken" name="resetToken" required class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm"></label>
              <label class="block text-sm font-semibold text-[#0b1c30]">Nueva contraseña<input [(ngModel)]="resetPasswordValue" name="resetPassword" type="password" required minlength="8" class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm"></label>
              <label class="block text-sm font-semibold text-[#0b1c30]">Confirmar contraseña<input [(ngModel)]="resetConfirmation" name="resetConfirmation" type="password" required class="mt-1.5 w-full rounded-lg border border-[#c5c6d3] px-3 py-2.5 text-sm"></label>
              @if (error()) { <p class="rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
              @if (message()) { <p class="rounded-lg bg-[#e5f5e7] p-3 text-sm text-[#0b5d1e]" role="status">{{ message() }}</p> }
              <button type="submit" [disabled]="submitting()" class="w-full rounded-xl bg-[#002777] px-4 py-3 text-sm font-bold text-white">Cambiar contraseña</button>
            </form>
            <p class="mt-5 text-center text-sm"><button type="button" (click)="showLogin()" class="font-bold text-[#006ef4] hover:underline">Volver a iniciar sesión</button></p>
          } @else {
            <h1 class="text-3xl font-extrabold text-[#002777]">Crear cuenta</h1>
            <p class="mt-2 text-sm text-[#444651]">El registro crea únicamente una cuenta de usuario paciente.</p>
            <form class="mt-6 grid gap-3 sm:grid-cols-2" (ngSubmit)="register()">
              <label class="text-sm font-semibold text-[#0b1c30]">Nombres<input [(ngModel)]="registration.firstName" name="firstName" required autocomplete="given-name" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Apellidos<input [(ngModel)]="registration.lastName" name="lastName" required autocomplete="family-name" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Tipo de documento<select [(ngModel)]="registration.documentType" name="documentType" required class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"><option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option></select></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Número de documento<input [(ngModel)]="registration.documentNumber" name="documentNumber" required class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30] sm:col-span-2">Correo electrónico<input [(ngModel)]="registration.email" name="email" type="email" required autocomplete="email" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Teléfono<input [(ngModel)]="registration.phone" name="phone" required autocomplete="tel" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Contraseña<input [(ngModel)]="registration.password" name="password" type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"></label>
              <label class="text-sm font-semibold text-[#0b1c30]">EPS (opcional)<select [(ngModel)]="selectedEpsId" (ngModelChange)="loadPlans()" name="eps" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"><option [ngValue]="null">Sin afiliación</option>@for (eps of epsList(); track eps.id) { <option [ngValue]="eps.id">{{ eps.name }}</option> }</select></label>
              <label class="text-sm font-semibold text-[#0b1c30]">Plan (opcional)<select [(ngModel)]="registration.insurancePlanId" name="insurancePlanId" [disabled]="!selectedEpsId" class="mt-1 w-full rounded-lg border border-[#c5c6d3] px-3 py-2"><option [ngValue]="undefined">Sin plan</option>@for (plan of plans(); track plan.id) { <option [ngValue]="plan.id">{{ plan.name }}</option> }</select></label>
              @if (error()) { <p class="sm:col-span-2 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
              <button type="submit" [disabled]="submitting()" class="sm:col-span-2 rounded-xl bg-[#002777] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{{ submitting() ? 'Creando…' : 'Crear cuenta' }}</button>
            </form>
            <p class="mt-5 text-center text-sm text-[#444651]"><button type="button" (click)="showLogin()" class="font-bold text-[#006ef4] hover:underline">Volver a iniciar sesión</button></p>
          }
        </div>
        <aside class="relative hidden min-h-full bg-cover bg-center p-10 lg:block" [style.background-image]="'url(' + backgroundUrl + ')'">
          <div class="absolute inset-0 bg-[#002777]/80"></div>
          <div class="relative flex h-full flex-col justify-end text-white"><p class="text-xs font-bold uppercase tracking-widest">Sistema ficticio de formación</p><h2 class="mt-3 text-3xl font-extrabold">Agenda tus citas de forma segura.</h2><p class="mt-3 text-sm leading-relaxed text-white/85">La cuenta y sesión se validan contra la API. Las capacidades clínicas se habilitan por fases posteriores.</p></div>
        </aside>
      </section>
    </main>
  `,
})
export class Login {
  readonly clinical = inject(ClinicalData);
  private readonly api = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private readonly identity = inject(IdentityApi);
  readonly logoUrl = FCV_LOGO;
  readonly backgroundUrl = FCV_BACKGROUND;
  readonly mode = signal<'login' | 'register' | 'recovery' | 'reset'>('login');
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  loginEmail = '';
  loginPassword = '';
  recoveryEmail = '';
  resetToken = '';
  resetPasswordValue = '';
  resetConfirmation = '';
  readonly epsList = signal<Eps[]>([]);
  readonly plans = signal<EpsPlan[]>([]);
  selectedEpsId: number | null = null;
  registration: { firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; password: string; insurancePlanId?: number } = { firstName: '', lastName: '', documentType: 'CC', documentNumber: '', email: '', phone: '', password: '' };

  showRegistration() { this.mode.set('register'); this.error.set(''); this.message.set(''); this.identity.eps().subscribe({ next: values => this.epsList.set(values), error: () => this.error.set('No fue posible cargar los planes disponibles.') }); }
  showLogin() { this.mode.set('login'); this.error.set(''); }
  showRecovery() { this.mode.set('recovery'); this.error.set(''); this.message.set(''); }
  showReset() { this.mode.set('reset'); this.error.set(''); this.message.set(''); }
  loadPlans() { this.registration.insurancePlanId = undefined; this.plans.set([]); if (this.selectedEpsId) this.identity.plans(this.selectedEpsId).subscribe({ next: values => this.plans.set(values), error: () => this.error.set('No fue posible cargar los planes.') }); }

  login() {
    this.submitting.set(true); this.error.set('');
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: response => { this.session.start(response); this.clinical.login(this.session.role()); this.submitting.set(false); },
      error: () => { this.error.set('Correo o contraseña inválidos.'); this.submitting.set(false); },
    });
  }

  register() {
    this.submitting.set(true); this.error.set(''); this.message.set('');
    this.api.register(this.registration).subscribe({
      next: () => { this.loginEmail = this.registration.email; this.loginPassword = ''; this.message.set('Cuenta creada. Ahora inicia sesión.'); this.mode.set('login'); this.submitting.set(false); },
      error: error => { this.error.set(error.status === 409 ? 'El correo o documento ya está registrado.' : 'No fue posible crear la cuenta. Verifica los datos.'); this.submitting.set(false); },
    });
  }

  recover() {
    this.submitting.set(true); this.error.set('');
    this.identity.recover(this.recoveryEmail).subscribe({ next: () => { this.message.set('Si existe una cuenta, recibirás instrucciones de recuperación.'); this.submitting.set(false); }, error: () => { this.message.set('Si existe una cuenta, recibirás instrucciones de recuperación.'); this.submitting.set(false); } });
  }

  resetPassword() {
    this.submitting.set(true); this.error.set('');
    this.identity.reset(this.resetToken, this.resetPasswordValue, this.resetConfirmation).subscribe({ next: () => { this.message.set('Contraseña actualizada. Ya puedes iniciar sesión.'); this.mode.set('login'); this.submitting.set(false); }, error: () => { this.error.set('El token es inválido, venció o la contraseña no coincide.'); this.submitting.set(false); } });
  }
}
