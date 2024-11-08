import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Budget, ModuleType } from './models/budget';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor() { }
  private readonly url = 'http://localhost:3000/'
  private http:HttpClient = inject(HttpClient)

  post(budget: Budget){
    return this.http.post<Budget>(this.url + "budgets", budget)
  }

  get(){
    return this.http.get<Budget[]>(this.url + "budgets")
  }

  getById(id: string){
    return this.http.get<Budget[]>(this.url + `budgets?id=${id}`)
  }

  //Para validacion async
  getByClient(client: string){
    return this.http.get<Budget[]>(this.url + `budgets?client=${client}`)
  }

  getTypes(){
    return this.http.get<ModuleType[]>(this.url + "module-types")
  }

}
