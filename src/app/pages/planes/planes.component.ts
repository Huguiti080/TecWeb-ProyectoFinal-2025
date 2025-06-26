import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomseguroPipe } from '../../pipes/domseguro.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, DomseguroPipe],
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements AfterViewInit {

  videoId: string = 'tUykoP30Gb0';
  
  faqs = [
    {
      question: '¿Puedo cambiar de plan más tarde?',
      answer: 'Sí, puedes cambiar entre planes en cualquier momento desde tu panel de configuración.'
    },
    {
      question: '¿Hay un límite en el número de usuarios?',
      answer: 'El plan Básico permite hasta 3 usuarios, el Profesional hasta 10 y el Empresa usuarios ilimitados.'
    },
    {
      question: '¿Ofrecen descuentos para organizaciones sin fines de lucro?',
      answer: 'Sí, ofrecemos un 30% de descuento para organizaciones sin fines de lucro verificadas.'
    }
  ];

  ngAfterViewInit(): void {
    this.addPayPalScript();
  }

  addPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=MXN'; // Sandbox client-id
    script.onload = () => this.renderPayPalButton();
    document.body.appendChild(script);
  }

  renderPayPalButton() {
    // @ts-ignore
    if (window['paypal']) {
      // @ts-ignore
      window['paypal'].Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '500.00',
                currency_code: 'MXN'
              },
              description: 'Plan Plus Forza Unity'
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            alert('Pago realizado por ' + details.payer.name.given_name + '!');
          });
        },
        onError: (err: any) => {
          alert('Ocurrió un error con PayPal.');
        }
      }).render('#paypal-plus-button');
    }
  }
}