import { BooruPost } from "renderer/stores/posts";

export interface PostViewProps {
  post: BooruPost;
}
export interface PostViewPreviewProps {
  setIsLoading: (v: boolean) => void;
  isLoading?: boolean;
  source: string;
}