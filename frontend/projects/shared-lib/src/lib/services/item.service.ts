import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item, Category, DisposedRecord, OverviewStats, CountdownStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private buildParams(filters: any): HttpParams {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key].toString());
      }
    });
    return params;
  }

  // --- Public APIs ---
  getPublicItems(type: 'lost' | 'found', filters: any): Observable<any> {
    const params = this.buildParams({ type, ...filters });
    return this.http.get<any>(`${this.apiUrl}/public/items`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getPublicCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}/public/categories`).pipe(
      map(res => res.success ? res.data : [])
    );
  }

  // --- Admin Lost Items ---
  getLostItems(filters: any): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/lost-items`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getLostItemById(id: string): Observable<Item> {
    return this.http.get<any>(`${this.apiUrl}/admin/lost-items/${id}`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  createLostItem(item: any): Observable<Item> {
    return this.http.post<any>(`${this.apiUrl}/admin/lost-items`, item).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  updateLostItem(id: string, update: any): Observable<Item> {
    return this.http.put<any>(`${this.apiUrl}/admin/lost-items/${id}`, update).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  deleteLostItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/lost-items/${id}`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  // --- Admin Found Items ---
  getFoundItems(filters: any): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/found-items`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getFoundItemById(id: string): Observable<Item> {
    return this.http.get<any>(`${this.apiUrl}/admin/found-items/${id}`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  createFoundItem(item: any): Observable<Item> {
    return this.http.post<any>(`${this.apiUrl}/admin/found-items`, item).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  updateFoundItem(id: string, update: any): Observable<Item> {
    return this.http.put<any>(`${this.apiUrl}/admin/found-items/${id}`, update).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  deleteFoundItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/found-items/${id}`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  // --- Expired Items & Disposal ---
  /**
   * Returns a paginated response from the server.
   * Accepts optional filters: { page, pageSize, search }
   */
  getExpiredItems(filters: any = {}): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/expired-items`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  disposeItem(id: string, type: 'Lost' | 'Found', disposal: any): Observable<DisposedRecord> {
    const params = new HttpParams().set('type', type);
    return this.http.post<any>(`${this.apiUrl}/admin/expired-items/${id}/dispose`, disposal, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  // --- Admin Categories ---
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}/admin/categories`).pipe(
      map(res => res.success ? res.data : [])
    );
  }

  createCategory(category: any): Observable<Category> {
    return this.http.post<any>(`${this.apiUrl}/admin/categories`, category).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  // --- History ---
  getReturnedHistory(filters: any): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/history/returned`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getDisposedHistory(filters: any): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/history/disposed`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getLostNotFoundHistory(filters: any): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(`${this.apiUrl}/admin/history/lost-not-found`, { params }).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getHistoryStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/history/stats`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  // --- Stats ---
  getOverviewStats(): Observable<OverviewStats> {
    return this.http.get<any>(`${this.apiUrl}/public/stats/overview`).pipe(
      map(res => res.success ? res.data : null)
    );
  }

  getCountdownStats(): Observable<CountdownStats> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats/countdown`).pipe(
      map(res => res.success ? res.data : null)
    );
  }
}
