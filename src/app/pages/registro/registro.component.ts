import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgChartsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent implements OnInit {
  modoSeleccion = false;
  tipo: 'registro' | 'contacto' | null = null;
  registros: any[] = [];
  modoEdicion = false;
  registroEditado: any = {};
  indexEditando = -1;

  // 🟦 GRÁFICA
  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Cantidad por Servicio' }
    ]
  };

  constructor(private router: Router, private firestore: Firestore) {}

  ngOnInit(): void {
    this.modoSeleccion = false;
    this.tipo = null;
  }

  verTipo(tipoSel: 'registro' | 'contacto'): void {
    if (tipoSel === 'contacto') {
      this.router.navigate(['/contactoregistro']);
      return;
    }

    this.tipo = 'registro';
    this.modoSeleccion = true;

    const colRef = collection(this.firestore, 'registros');
    collectionData(colRef, { idField: 'id' }).subscribe((data) => {
      this.registros = data;
      this.generarGrafica(); // ← aquí actualizamos la gráfica cada vez que hay nuevos datos
    });
  }

  generarGrafica(): void {
    const conteo: { [key: string]: number } = {};
    for (const reg of this.registros) {
      const servicio = reg.servicio;
      conteo[servicio] = (conteo[servicio] || 0) + 1;
    }

    this.chartData.labels = Object.keys(conteo);
    this.chartData.datasets[0].data = Object.values(conteo);
  }

  async eliminarRegistro(index: number): Promise<void> {
    const reg = this.registros[index];
    if (!reg?.id) return;
    await deleteDoc(doc(this.firestore, 'registros', reg.id));
  }

  editarRegistro(index: number): void {
    this.indexEditando = index;
    this.registroEditado = { ...this.registros[index] };
    this.modoEdicion = true;
  }

  async guardarEdicion(): Promise<void> {
    if (this.indexEditando === -1) return;
    const reg = this.registroEditado;
    await updateDoc(doc(this.firestore, 'registros', reg.id), {
      nombre: reg.nombre,
      correo: reg.correo,
      telefono: reg.telefono,
      servicio: reg.servicio,
    });
    this.cancelarEdicion();
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.indexEditando = -1;
    this.registroEditado = {};
  }

  volver(): void {
    this.modoSeleccion = false;
    this.tipo = null;
    this.modoEdicion = false;
    this.indexEditando = -1;
  } 

}
