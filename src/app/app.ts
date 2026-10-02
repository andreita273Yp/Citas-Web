import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from './services/clinical-data';
import { Login } from './components/login/login';
import { IdentityDashboard } from './components/identity-dashboard/identity-dashboard';
import { MyAppointments } from './components/my-appointments/my-appointments';
import { AuthSession } from './services/auth-session';
import { OperationsPanel } from './components/operations-panel/operations-panel';
import { AdminOffer } from './components/admin-offer/admin-offer';
import { BookAppointment } from './components/book-appointment/book-appointment';
import { ProfessionalAgenda } from './components/professional-agenda/professional-agenda';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, Login, IdentityDashboard, MyAppointments, OperationsPanel, AdminOffer, BookAppointment, ProfessionalAgenda],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  clinical = inject(ClinicalData);
  session = inject(AuthSession);
}
