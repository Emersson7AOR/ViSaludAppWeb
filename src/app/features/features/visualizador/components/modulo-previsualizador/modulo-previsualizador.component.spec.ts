import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloPrevisualizadorComponent } from './modulo-previsualizador.component';

describe('ModuloPrevisualizadorComponent', () => {
  let component: ModuloPrevisualizadorComponent;
  let fixture: ComponentFixture<ModuloPrevisualizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuloPrevisualizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuloPrevisualizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
