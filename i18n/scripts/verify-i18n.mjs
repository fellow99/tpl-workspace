// i18n 语料校验脚本：校验三语言 key 一致性、缺译、占位符一致性
// 用法：node i18n/scripts/verify-i18n.mjs（校验失败以非零码退出，供 CI 卡口）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCALES = ['zh-CN', 'en-US', 'zh-TW'];
const DOMAINS = ['common', 'app'];

function loadDomain(domain) {
  const result = {};
  for (const locale of LOCALES) {
    const file = resolve(ROOT, `i18n/${domain}/${locale}.json`);
    result[locale] = JSON.parse(readFileSync(file, 'utf8'));
  }
  return result;
}

const errors = [];
const placeholders = (s) => (String(s).match(/\{[^}]+\}/g) || []).sort().join('|');

for (const domain of DOMAINS) {
  const data = loadDomain(domain);
  const zhKeys = Object.keys(data['zh-CN']);

  for (const locale of LOCALES) {
    const keys = Object.keys(data[locale]);
    // key 一致性
    const missing = zhKeys.filter((k) => !(k in data[locale]));
    const extra = keys.filter((k) => !(k in data['zh-CN']));
    if (missing.length) errors.push(`[${domain}/${locale}] 缺 key: ${missing.join(', ')}`);
    if (extra.length) errors.push(`[${domain}/${locale}] 多 key: ${extra.join(', ')}`);
    // 缺译（空值）
    for (const [k, v] of Object.entries(data[locale])) {
      if (v === '' || v === null || v === undefined) errors.push(`[${domain}/${locale}] 空值: ${k}`);
    }
    // 占位符一致性（对照 zh-CN）
    if (locale !== 'zh-CN') {
      for (const k of zhKeys) {
        if (k in data[locale] && placeholders(data['zh-CN'][k]) !== placeholders(data[locale][k])) {
          errors.push(`[${domain}/${locale}] 占位符不一致: ${k}`);
        }
      }
    }
  }
}

// 契约校验：tpl-app-api 的 MessageKey 常量必须 ⊆ 语料键（避免后端返回语料不存在的 key）
const MESSAGE_KEY_FILE = resolve(ROOT, 'tpl-app-api/src/main/java/org/fellow99/tpl/appapi/model/MessageKey.java');
try {
  const keySource = readFileSync(MESSAGE_KEY_FILE, 'utf8');
  const used = [...keySource.matchAll(/"((?:message)(?:\.[a-zA-Z]+)*)"/g)].map((m) => m[1]);
  const corpusKeys = new Set(Object.keys(loadDomain('common')['zh-CN']).concat(Object.keys(loadDomain('app')['zh-CN'])));
  for (const k of used) {
    if (!corpusKeys.has(k)) errors.push(`[contract] MessageKey 使用了语料不存在的 key: ${k}`);
  }
} catch (e) {
  errors.push(`[contract] 无法读取 MessageKey.java: ${e.message}`);
}

if (errors.length) {
  console.error('❌ i18n 校验失败：');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
} else {
  console.log('✅ i18n 语料校验通过（三语言 key 一致、无缺译、占位符一致、MessageKey 契约一致）');
}
