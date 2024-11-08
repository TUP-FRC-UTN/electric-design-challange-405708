import { Component, inject } from '@angular/core';
import { BudgetService } from '../budget.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Budget } from '../models/budget';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './budget-list.component.html',
  styleUrl: './budget-list.component.css',
})
export class BudgetListComponent {
  private readonly budgetService: BudgetService = inject(BudgetService)
  private readonly router: Router = inject(Router)
  searchTerm = new FormControl('');
  budgets: Budget[] = [];
  allBudgets: Budget[] = []; // Lista completa de órdenes


  constructor() {}

  ngOnInit(): void {
    this.getOrders();
    this.filterOrders(); // Llamada para suscribirse a los cambios en el input
  }

  getOrders() {
    this.budgetService.get().subscribe({
      next: (response) => {
        this.budgets = response;
        this.allBudgets = response; // Copia de la lista completa
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }


  filterOrders() {
    this.searchTerm.valueChanges.subscribe(searchTerm => {
      if (searchTerm === null || searchTerm.trim() === '') {
        // Si el término de búsqueda está vacío, mostramos todas las órdenes
        this.budgets = [...this.allBudgets];
      } else {
        // Filtramos las órdenes basándonos en el término de búsqueda
        const lowerCaseTerm = searchTerm.toLowerCase();
        this.budgets = this.allBudgets.filter(budget => 
          budget.client.toLowerCase().includes(lowerCaseTerm)
        );
      }
    });
  }

  toDetail(id:string | undefined){
    this.router.navigate([`budget/detail/${id}`]);
  }

}
