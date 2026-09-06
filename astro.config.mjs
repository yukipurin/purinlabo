// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 日本語をルート（/）、英語を /en/ に置く。
// 主ターゲットが日本語圏（フリマ出品者）なので ja を prefix なしにする。
// ここを後から変えると全URLが変わりSEOを失うため、公開前に確定させる。
export default defineConfig({
  site: 'https://purinlabo.com',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
