import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-dicom-uploader',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule, MatError
  ],
  templateUrl: './dicom-uploader.component.html',
  styleUrls: ['./dicom-uploader.component.css']
})
export class DicomUploaderComponent {
  @Input() fileError: string | null = null;
  @Output() fileSelected = new EventEmitter<File>();
  
  hovering = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.hovering = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.hovering = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.hovering = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
