import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoregistroComponent } from './contactoregistro.component';

describe('ContactoregistroComponent', () => {
  let component: ContactoregistroComponent;
  let fixture: ComponentFixture<ContactoregistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoregistroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoregistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
