import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent,
} from '@ionic/angular';
import { AuthService } from '../../core/auth.service';
import { ChatService } from '../../core/chat.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ me }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">Quitter</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (users().length === 0) {
        <p class="p-6 text-center text-gray-500">
          Personne d'autre pour l'instant. Connecte un second utilisateur pour discuter.
        </p>
      }

      <ion-list>
        @for (u of users(); track u.id) {
          <ion-item button detail (click)="open(u.username)">
            <div
              slot="start"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
            >
              {{ u.username.charAt(0).toUpperCase() }}
            </div>
            <ion-label>{{ u.username }}</ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class UsersPage implements OnInit {
  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private router = inject(Router);

  me = this.auth.username!;
  users = signal<User[]>([]);

  ngOnInit(): void {
    this.chat.connect(this.me);
    this.load();
  }

  load(done?: () => void): void {
    this.chat.users().subscribe({
      next: (list) => {
        this.users.set(list.filter((u) => u.username !== this.me));
        done?.();
      },
      error: () => done?.(),
    });
  }

  refresh(event: any): void {
    this.load(() => event.target.complete());
  }

  open(username: string): void {
    this.router.navigate(['/chat', username]);
  }

  logout(): void {
    this.chat.disconnect();
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
