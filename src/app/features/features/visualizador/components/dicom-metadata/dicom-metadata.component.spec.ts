import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomMetadataComponent } from './dicom-metadata.component';

describe('DicomMetadataComponent', () => {
  let component: DicomMetadataComponent;
  let fixture: ComponentFixture<DicomMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicomMetadataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicomMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
