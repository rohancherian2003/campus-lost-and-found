import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignSystemComponent } from './design-system.component';

describe('DesignSystemComponent', () => {
  let component: DesignSystemComponent;
  let fixture: ComponentFixture<DesignSystemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DesignSystemComponent]
    });
    fixture = TestBed.createComponent(DesignSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
