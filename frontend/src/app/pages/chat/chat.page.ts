import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonFooter, IonInput, IonButton, IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ChatService } from '../../core/chat.service';
import { Message } from '../../core/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonFooter, IonInput, IonButton, IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/users"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ other }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-2">
        @for (m of messages(); track m.id) {
          <div class="flex" [class.justify-end]="m.sender === me">
            <div
              class="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
              [class]="m.sender === me ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'"
            >
              <p class="whitespace-pre-wrap break-words">{{ m.content }}</p>
              <p class="mt-1 text-right text-[10px] opacity-70">{{ m.sentAt | date: 'HH:mm' }}</p>
            </div>
          </div>
        }
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="flex items-center gap-2 px-2">
          <ion-input
            class="flex-1"
            placeholder="Écris un message..."
            fill="outline"
            [(ngModel)]="text"
            (keyup.enter)="send()"
          ></ion-input>
          <ion-button (click)="send()" [disabled]="!text.trim()">
            <ion-icon slot="icon-only" name="send"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private sub?: Subscription;

  me = this.auth.username!;
  other = this.route.snapshot.paramMap.get('username')!;
  messages = signal<Message[]>([]);
  text = '';

  constructor() {
    addIcons({ send });
  }

  ngOnInit(): void {
    this.chat.connect(this.me);

    this.chat.history(this.me, this.other).subscribe((list) => {
      list.forEach((m) => this.add(m));
    });

    this.sub = this.chat.incoming$.subscribe((m) => {
      const inThisConversation =
        (m.sender === this.other && m.recipient === this.me) ||
        (m.sender === this.me && m.recipient === this.other);
      if (inThisConversation) this.add(m);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  send(): void {
    const content = this.text.trim();
    if (!content) return;
    this.chat.send(this.me, this.other, content);
    this.text = '';
  }

  private add(m: Message): void {
    // évite les doublons (historique + temps réel)
    if (this.messages().some((x) => x.id === m.id)) return;
    this.messages.update((list) => [...list, m]);
    setTimeout(() => this.content?.scrollToBottom(200), 50);
  }
}
