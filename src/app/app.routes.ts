import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'budget',
        loadChildren: () => import('./budget.routes').then(r=> r.BUDGETS_ROUTES)
    }
];


