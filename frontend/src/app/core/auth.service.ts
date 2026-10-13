import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './config';
import { User } from './models';

const STORAGE_KEY = 'chat_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(this.load());

  readonly user = this._user.asReadonly();

  get username(): string | null {
    return this._user()?.username ?? null;
  }

  isLoggedIn(): boolean {
    return this._user() !== null;
  }

  login(username: string): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/login`, { username }).pipe(
      tap((u) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        this._user.set(u);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  private load(): User | null {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
