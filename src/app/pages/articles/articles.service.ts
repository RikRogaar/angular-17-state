import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Article, RemoveArticle } from '@interfaces/article';
import { ApiService } from '@services/api.service';
import { Observable, Subject, map, merge, retry, switchMap } from 'rxjs';
import { connect } from 'ngxtension/connect';

export interface Error {
  id: number;
  message: string
}

export interface ArticlesState {
  articles: Article[];
  status: "loading" | "success" | "error" | "error-deleting";
  error: Error | null;
}

// The reason this works so well is because we are using Angular signals in combination with RxJS's proficiency in emitting events
// This in turn means that we can use the same state application wide.
// If we have for example 2 components next to each other, and only one of them triggers an event to delete one article
// Both will in turn be updated
@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  // Injecting the service using inject() as opposed to defining it in the constructor
  private apiService = inject(ApiService);

  // define state for this service
  private state = signal<ArticlesState>({
    articles: [],
    status: "loading",
    error: null
  });

  // accessor values.
  // Since state is a signal and the selectors use this state,
  // this is automatically re-called updates the state.
  public articles = computed(() => this.state().articles);
  public status = computed(() => this.state().status);
  public error = computed(() => this.state().error);


  // sources that trigger updates
  public retryArticles$ = new Subject<void>();
  public resetArticles$ = new Subject<void>();
  private errorArticles$ = new Subject<Error>();
  private errorDeletingArticles$ = new Subject<Error>();
  public removeArticle$ = new Subject<number>();

  // Observable to delete the article with retry logic
  private deleteArticleWithRetry$ = this.removeArticle$.pipe(
    switchMap((id) => {
      return this.apiService.deleteArticle(id).pipe(
        retry({
          delay: (err) => {
            this.errorDeletingArticles$.next(JSON.parse(err));

            return this.retryArticles$;
          }
        })
      );
    })
  );

  // allArticles$ is an observable stream representing the articles fetched from the API, with retry logic.
  public allArticles$ = merge(
    this.getArticlesWithRetry(),
    this.resetArticles$.pipe(
      switchMap(() => this.getArticlesWithRetry())
    )
  );

  // Initialize the state with the initial loading status. These functions are bootstrapped,
  // meaning that if any of the sources (retryArticles$, errorArticles$, or allArticles$) are updated,
  // they will trigger corresponding state updates, ensuring the state reflects the latest data.
  // I'm using ngxtension to make this more readable.
  constructor() {
    connect(this.state)
      .with(this.allArticles$, (state, articles) => ({
        ...state,
        articles,
        status: "success",
      }))
      .with(this.retryArticles$, (state) => ({
        ...state,
        status: "loading"
      }))
      .with(this.resetArticles$, (state) => ({
        ...state,
        status: "loading"
      }))
      .with(this.errorArticles$, (state, error) => ({
        ...state,
        status: "error",
        error: error
      }))
      .with(this.deleteArticleWithRetry$, (state, deletedArticle) => ({
        ...state,
        articles: state.articles.filter((article) => article.id !== deletedArticle.id),
        status: "success",
      }))
      .with(this.errorDeletingArticles$, (state, error) => ({
        ...state,
        status: "error-deleting",
        error: error
      }))
  }

  private getArticlesWithRetry(): Observable<Article[]> {
    return this.apiService.getArticles().pipe(
      retry({
        delay: (err) => {
          this.errorArticles$.next(JSON.parse(err));
          return this.retryArticles$;
        }
      })
    );
  }
}
