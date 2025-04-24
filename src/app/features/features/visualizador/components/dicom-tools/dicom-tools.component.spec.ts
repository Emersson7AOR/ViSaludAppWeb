import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomToolsComponent } from './dicom-tools.component';

describe('DicomToolsComponent', () => {
  let component: DicomToolsComponent;
  let fixture: ComponentFixture<DicomToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicomToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicomToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
