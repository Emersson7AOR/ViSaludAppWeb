import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FilterTagsPipe, DicomTag } from '../../../../pipes/filter-tags.pipe';
import { GroupByPipe } from '../../../../pipes/group-by.pipe';

@Component({
  selector: 'app-dicom-metadata',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    FilterTagsPipe,
    GroupByPipe
  ],
  templateUrl: './dicom-metadata.component.html',
  styleUrls: ['./dicom-metadata.component.css']
})
export class DicomMetadataComponent implements OnInit {
  @Input() metadata: DicomTag[] = [];
  
  tagSearchText: string = '';
  selectedCategory: string = 'Todos';
  tagCategories: string[] = [];
  
  ngOnInit(): void {
    // Initialize tag categories
    this.tagCategories = FilterTagsPipe.getAllCategories();
    this.tagCategories.unshift('Todos');
  }
  
  getTagDescription(tag: string): string {
    return FilterTagsPipe.getTagDescription(tag);
  }
}
