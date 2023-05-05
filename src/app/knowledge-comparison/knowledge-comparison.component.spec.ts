import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeComparisonComponent } from './knowledge-comparison.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('KnowledgeComparisonComponent', () => {
  let component: KnowledgeComparisonComponent;
  let fixture: ComponentFixture<KnowledgeComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KnowledgeComparisonComponent],
      imports: [RouterTestingModule, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
