import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DownloadFormat } from '../dicom-viewer/handlers/download-handler';

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    FormsModule
  ],
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.css']
})
export class DownloadDialogComponent {
  selectedFormat: DownloadFormat = DownloadFormat.PNG;
  formats = [
    { value: DownloadFormat.JPG, label: 'JPG', description: 'Formato comprimido, ideal para compartir' },
    { value: DownloadFormat.PNG, label: 'PNG', description: 'Mejor calidad, con transparencia' },
    { value: DownloadFormat.PDF, label: 'PDF', description: 'Documento PDF con la imagen' }
  ];

  constructor(public dialogRef: MatDialogRef<DownloadDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDownload(): void {
    this.dialogRef.close(this.selectedFormat);
  }
}
