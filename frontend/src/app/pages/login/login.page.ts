import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { ChatService } from '../../core/chat.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton],
  template: `
    <ion-content class="ion-padding">
      <div class="flex min-h-full flex-col justify-center gap-4">
        <h1 class="text-3xl font-bold">Messagerie</h1>
        <p class="text-gray-500">Choisis un nom d'utilisateur unique pour te connecter.</p>

        <ion-input
          label="Nom d'utilisateur"
          label-placement="floating"
          fill="outline"
          autocapitalize="off"
          [(ngModel)]="username"
          (keyup.enter)="login()"
        ></ion-input>

        @if (error()) {
          <p class="text-sm text-red-600">{{ error() }}</p>
        }

        <ion-button expand="block" [disabled]="loading()" (click)="login()">
          Se connecter
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private router = inject(Router);

  username = '';
  loading = signal(false);
  error = signal('');

  login(): void {
    const name = this.username.trim();
    if (!name) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(name).subscribe({
      next: (u) => {
        this.chat.connect(u.username);
        this.router.navigateByUrl('/users', { replaceUrl: true });
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Connexion impossible. Vérifie le nom et le serveur.');
      },
    });
  }
}
