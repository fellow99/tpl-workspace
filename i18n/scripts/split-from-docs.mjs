// 从 docs/004-多语言国际化支持.json 拆分语料到 i18n/common 与 i18n/app（zh-CN 事实源）
// 归类规则：common./app./ui./dict./message. 前缀 → common（跨端共享）；其余（auth./profile./业务名）→ app
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('../../docs/004-多语言国际化支持.json', import.meta.url), 'utf8'));
const common = {};
const app = {};
const COMMON_PREFIXES = ['common.', 'app.', 'ui.', 'dict.', 'message.'];

for (const [k, v] of Object.entries(src.messages)) {
  if (COMMON_PREFIXES.some((p) => k.startsWith(p))) common[k] = v;
  else app[k] = v;
}

mkdirSync(new URL('../common/', import.meta.url), { recursive: true });
mkdirSync(new URL('../app/', import.meta.url), { recursive: true });
writeFileSync(new URL('../common/zh-CN.json', import.meta.url), JSON.stringify(common, null, 2) + '\n');
writeFileSync(new URL('../app/zh-CN.json', import.meta.url), JSON.stringify(app, null, 2) + '\n');
console.log('common:', Object.keys(common).length, 'app:', Object.keys(app).length);
