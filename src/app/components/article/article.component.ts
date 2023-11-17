import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '@interfaces/article';
import { ArticlesService } from '@pages/articles/articles.service';

enum DeleteStringState {
  Initial = 'x',
  Deleting = '...',
  Retry = 'Retry...',
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
})
export class ArticleComponent {
  @Input() article!: Article;
  @Output() delete = new EventEmitter<number>();

  public articlesService = inject(ArticlesService);
  public deleteString: DeleteStringState = DeleteStringState.Initial;
  public retryString: DeleteStringState = DeleteStringState.Retry;

  public handleDelete(article: Article) {
    this.deleteString = DeleteStringState.Deleting;

    this.delete.emit(article.id);
  }

  public handleRetry(article: Article) {
    this.retryString = DeleteStringState.Deleting;

    this.delete.emit(article.id);
  }
}
