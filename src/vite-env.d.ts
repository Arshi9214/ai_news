/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORLD_NEWS_API_KEY?: string
  readonly VITE_NEWSDATA_API_KEY?: string
  readonly VITE_GNEWS_API_KEY?: string
  readonly VITE_GROQ_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
