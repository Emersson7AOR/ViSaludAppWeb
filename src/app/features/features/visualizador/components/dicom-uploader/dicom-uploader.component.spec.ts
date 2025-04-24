import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomUploaderComponent } from './dicom-uploader.component';

describe('DicomUploaderComponent', () => {
  let component: DicomUploaderComponent;
  let fixture: ComponentFixture<DicomUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicomUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicomUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
