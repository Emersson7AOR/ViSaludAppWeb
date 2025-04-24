import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloVisualizadorComponent } from './modulo-visualizador.component';

describe('ModuloVisualizadorComponent', () => {
  let component: ModuloVisualizadorComponent;
  let fixture: ComponentFixture<ModuloVisualizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuloVisualizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuloVisualizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
