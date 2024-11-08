import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from '../budget.service';
import { Budget, ModuleType, Zone } from '../models/budget';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-view.component.html',
  styleUrl: './budget-view.component.css',
})
export class BudgetViewComponent implements OnInit {
  // ADDITIONAL DOCS: same as BudgetListComponent
  id: string | null = "";
  //Inicio la interfaz
  budget: Budget = {
    id: "",
    client: "",
    date: new Date,
    zone: "",
    moduleType:[]

  };
  lengthModules: number = 0;
  zoneAnalysis: ZoneAnalysis={};
  total:number=0;
  private activatedRoute = inject(ActivatedRoute)
  private budgetService:BudgetService = inject(BudgetService);

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    const chargeId = this.id !== null ? this.id : '';
    this.chargeBudget(chargeId);
  }

  chargeBudget(id : string){
    this.budgetService.getById(id)
    .subscribe(
      (response) => {
        console.log(response); 
        this.budget = response[0]
        this.zoneAnalysis = this.mapToZoneWithStats(this.budget)
        this.calculateTotal()
      },
      (error) => {
        console.error('Error:', error);
      });
  }

  //Metodo para calcular el total
  calculateTotal(){
    this.budget.moduleType.forEach(module=>{
      this.total += module.price
    })
  }

  mapToZone(budget: Budget): Map<Zone, ModuleType[]> {
    // Crear un Map para almacenar los módulos agrupados por zona
    const groupedByZone = new Map<Zone, ModuleType[]>();
    
    // Inicializar todas las zonas posibles con un array vacío
    Object.values(Zone).forEach(zone => {
      groupedByZone.set(zone as Zone, []);
    });
  
    // Agrupar los módulos por zona
    budget.moduleType.forEach(module => {
      const modulesInZone = groupedByZone.get(module.zone) || [];
      modulesInZone.push(module);
      groupedByZone.set(module.zone, modulesInZone);
    });
  
    // Opcional: eliminar las zonas que no tienen módulos
    for (const [zone, modules] of groupedByZone.entries()) {
      if (modules.length === 0) {
        groupedByZone.delete(zone);
      }
    }
  
    return groupedByZone;
  }

  mapToZoneWithStats(budget: Budget): ZoneAnalysis {
    const analysis: ZoneAnalysis = {};
    
    Object.values(Zone).forEach(zone => {
      analysis[zone] = {
        totalModules: 0,
        totalSlots: 0,
        totalPrice: 0,
        modules: []
      };
    });
  
    budget.moduleType.forEach(module => {
      const zoneStats = analysis[module.zone];
      zoneStats.modules.push(module);
      zoneStats.totalModules++;
      zoneStats.totalSlots += module.slots;
      zoneStats.totalPrice += module.price;
    });
  
    // Eliminar zonas sin módulos
    Object.keys(analysis).forEach(zone => {
      if (analysis[zone].totalModules === 0) {
        delete analysis[zone];
      }
    });
  
    return analysis;
  }

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

}

interface ZoneStats {
  totalModules: number;
  totalSlots: number;
  totalPrice: number;
  modules: ModuleType[];
}

interface ZoneAnalysis {
  [key: string]: ZoneStats;
}

