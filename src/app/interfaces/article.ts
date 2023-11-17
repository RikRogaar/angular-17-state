export interface Article {
    id: number;
    title: string;
}

export type RemoveArticle = Article['id'];