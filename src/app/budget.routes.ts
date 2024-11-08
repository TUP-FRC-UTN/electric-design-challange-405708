import { Routes } from '@angular/router';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { BudgetFormComponent } from './budget-form/budget-form.component';
import { BudgetViewComponent } from './budget-view/budget-view.component';

export const BUDGETS_ROUTES: Routes = [
    {
        path: 'list', component: BudgetListComponent
    },
    {
        path: 'form', component: BudgetFormComponent
    },
    {
        path: 'detail/:id', component: BudgetViewComponent
    }
]