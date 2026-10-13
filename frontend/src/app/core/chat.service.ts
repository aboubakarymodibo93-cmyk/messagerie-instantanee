import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable, Subject, Subscription } from 'rxjs';
import { API_URL, WS_URL } from './config';
import { Message, User } from './models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private rx = new RxStomp();
  private sub?: Subscription;
  private connected = false;
  private incoming = new Subject<Message>();

  /** Flux de tous les messages reçus (et les échos de ceux qu'on envoie). */
  readonly incoming$ = this.incoming.asObservable();

  connect(username: string): void {
    if (this.connected) return;
    this.connected = true;
    this.rx.configure({ brokerURL: WS_URL, reconnectDelay: 3000 });
    this.rx.activate();
    this.sub = this.rx
      .watch(`/topic/messages.${username}`)
      .subscribe((frame) => this.incoming.next(JSON.parse(frame.body) as Message));
  }

  disconnect(): void {
    this.sub?.unsubscribe();
    this.rx.deactivate();
    this.connected = false;
  }

  send(sender: string, recipient: string, content: string): void {
    this.rx.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ sender, recipient, content }),
    });
  }

  users(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`);
  }

  history(me: string, other: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_URL}/messages`, { params: { me, with: other } });
  }
}
