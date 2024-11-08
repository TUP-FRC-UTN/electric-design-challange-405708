import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { Budget, ModuleType, Zone } from '../models/budget';
import { ActivatedRoute, Router } from '@angular/router';
import { DateValidator } from '../date.validator';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './budget-form.component.html',
  styleUrl: './budget-form.component.css',
})
export class BudgetFormComponent implements OnInit {

  private budgetService:BudgetService = inject(BudgetService);
  private router:Router = inject(Router);
  ambientes: Zone[] = Object.values(Zone); //PARA ENUM
  today:Date = new Date()
  modulosLength: number=0;

  reactiveForm:FormGroup = new FormGroup({
    //Fecha arranca con el dia de hoy
    fecha: new FormControl(new Date().toISOString().split('T')[0],[Validators.required, DateValidator.greaterThanToday]), //Validar que no sea mayor a hoy
    cliente: new FormControl('', [Validators.required]), //Async Validate (1 solo presupuesto por cliente)
    modulos: new FormArray([])
  })

  ngOnInit(): void {
    this.reactiveForm.get('cliente')?.setAsyncValidators(this.budgetLimitClientValidator());
    this.reactiveForm.controls['modulos'].setValidators(
      Validators.compose([Validators.minLength(5), this.validateSlotsPerZone.bind(this)])
    );
    this.modulos.valueChanges.subscribe(() => {
      this.modulos.updateValueAndValidity();
  });
  }

  get modulos(){
    return this.reactiveForm.controls["modulos"] as FormArray;
  }

  //Minimo 5
  onNewEvent(){
    const formArray = this.reactiveForm.controls["modulos"] as FormArray;
    const eventForm = new FormGroup({
      id: new FormControl("", [Validators.required]), //Select API
      price: new FormControl("", [Validators.required]), // Inicializado como deshabilitado
      name: new FormControl(""),
      slots: new FormControl("", [Validators.required]), // Inicializado como deshabilitado
      zone: new FormControl("", [Validators.required]), //Select ENUM
    });

    //Cambios en tipo de modulo afecta a price y slots
    eventForm.get("id")?.valueChanges.subscribe((selectedValue) => {
      this.updatePriceAndSlots(eventForm, selectedValue);
    });

    this.modulosLength = this.modulosLength + 1
    this.chargeSelect();
    formArray.push(eventForm);
  }

  onDeleteEvent(index: number) {
    this.modulos.removeAt(index);
    this.modulosLength = this.modulosLength - 1
  }

   //Metodo cuando cambie el valor del select para asignar valores a slots y price
   updatePriceAndSlots(eventForm: FormGroup, id: string | null) {

    // Encuentra el producto en el array `selectTypes`
    const selectModule = this.selectTypes.find(modulo => modulo.id === id);
    
    if (selectModule) {
      // Actualiza los valores de `price` y `slots`
      eventForm.get("price")?.setValue(selectModule.price);
      eventForm.get("slots")?.setValue(selectModule.slots);
      eventForm.get("name")?.setValue(selectModule.name);
    }
  
  }

  selectTypes:ModuleType[] = [];
  chargeSelect(){
    //llamada a la api
    this.budgetService.getTypes().subscribe({
      next: (response) => {
        this.selectTypes = response;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    })
  }

  //Genera un numero entre 0 y 999, para que no se repita el id
  generarNumeroAleatorio(): string {
    const numeroAleatorio = Math.floor(Math.random() * 1000); 
     //te l pasa como string
    return numeroAleatorio.toString();
  }

  save(){
    //Creo objeto basado en interfaz


    const budget:Budget = {
      id: this.generarNumeroAleatorio(), //id aleatorio
      client: this.reactiveForm.value.cliente,
      date: this.reactiveForm.value.fecha,
      zone: this.reactiveForm.value.zone,
      moduleType: this.reactiveForm.value.modulos
    }

    //llamada a la api
    this.budgetService.post(budget).subscribe({
      next: (response) => {
        console.log('Budget enviado correctamente', response);
        this.router.navigate([`budget/detail/${budget.id}`]);
      },
      error: (error) => {
        console.error('Error al enviar el Budget', error);
      }
    });

  }

  //Cambio de color segun validacion
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

//Cambio de color segun validacion para FORM ARRAY
onValidateFrmAr(index: number, controlName: string) {
  const controlArray = this.reactiveForm.get('modulos') as FormArray;

  if (controlArray && controlArray.at(index)) {
      const control = controlArray.at(index).get(controlName);
      return {
          'is-invalid': control?.invalid && (control?.dirty || control?.touched),
          'is-valid': control?.valid
      };
  }
  return {};
}



  //Async Validator
  budgetLimitClientValidator(): AsyncValidatorFn | null{
    return (control: AbstractControl) : Observable<ValidationErrors | null> => {
      return this.budgetService.getByClient(control.value).pipe(
        map(data =>{
          return data.length > 1 ? {budgetLimit : true} : null
        }),
        catchError(() => {
          alert("error en la api")
          return of({apiCaida : true})
        })
      )
    }
  }

  validateSlotsPerZone(): { [key: string]: any } | null {
    const slotsByZone: { [zone: string]: number } = {};
    const zonesWithErrors: string[] = [];
  
    this.modulos.controls.forEach((moduleControl: AbstractControl) => {
        const zone = moduleControl.get('zone')?.value;
        const slots = moduleControl.get('slots')?.value;
  
        if (zone && slots) {
            slotsByZone[zone] = (slotsByZone[zone] || 0) + slots;
            if (slotsByZone[zone] > 3) {
                zonesWithErrors.push(zone);
            }
        }
    });
  
    return zonesWithErrors.length > 0 
        ? { slotsExceeded: { zones: zonesWithErrors } } 
        : null;
}

}
