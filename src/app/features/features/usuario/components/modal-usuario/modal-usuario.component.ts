import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../../../../core/services/usuario/usuario.service';
import { SuccessService } from '../../../../core/services/alerts/alerts.service';

@Component({
  selector: 'app-modal-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit {
  /*userForm!: FormGroup;
  
  constructor(
    public dialogRef: MatDialogRef<ModalUsuarioComponent>,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private alertService: SuccessService
  ) {}*/

  ngOnInit(): void {
    /*this.initForm();
    this.loadUserData();*/
  }
/*
  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  loadUserData(): void {
    this.usuarioService.getCurrentUser().subscribe(user => {
      this.userForm.patchValue({
        username: user.username,
        email: user.email
      });
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      this.usuarioService.updateUser(userData).subscribe({
        next: () => {
          this.alertService.success('Usuario actualizado correctamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.alertService.error('Error al actualizar usuario');
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  } */
}
