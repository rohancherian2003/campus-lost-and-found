import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  public get refreshTokenValue(): string | null {
    return localStorage.getItem('refreshToken');
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map(res => {
        if (res.success && res.data) {
          const loginData: LoginResponse = res.data;
          localStorage.setItem('accessToken', loginData.accessToken);
          localStorage.setItem('refreshToken', loginData.refreshToken);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          this.currentUserSubject.next(loginData.user);
          return loginData;
        }
        throw new Error(res.message || 'Login failed');
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const token = this.refreshTokenValue;
    if (!token) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken: token }).pipe(
      map(res => {
        if (res.success && res.data && res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          return res.data;
        }
        throw new Error(res.message || 'Failed to refresh token');
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/profile`).pipe(
      map(res => {
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.message || 'Failed to load profile');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
