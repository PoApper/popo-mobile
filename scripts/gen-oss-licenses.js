#!/usr/bin/env node
/**
 * 앱에 번들되는 프로덕션 의존성의 오픈소스 라이선스 목록을 생성한다.
 * 의존성이 바뀌었을 때만 `npm run licenses`로 재생성하고, 결과 JSON은 커밋한다.
 *
 * ponytail: JS 의존성만 수집한다. Android AAR / CocoaPods 등 네이티브 전용
 * 의존성(Firebase Android SDK, OkHttp 등)은 빠진다. 필요해지면 Android는
 * oss-licenses-plugin, iOS는 Pods 하위 LICENSE 수집으로 확장한다.
 */
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'src', 'assets', 'oss-licenses.json');
const MAX_BUFFER = 64 * 1024 * 1024;

/** npm ls가 peer dependency 경고로 exit code 1을 내도 stdout은 유효하다. */
const listPackageDirs = () => {
  const args = ['ls', '--prod', '--all', '--parseable'];
  let stdout;
  try {
    stdout = execFileSync('npm', args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (e) {
    if (!e.stdout) throw e;
    stdout = e.stdout;
  }
  return stdout.split('\n').filter(line => line.includes('node_modules'));
};

const readLicenseText = dir => {
  const file = fs
    .readdirSync(dir)
    .find(name => /^(licen[cs]e|copying)/i.test(name));
  if (!file) return null;
  const fullPath = path.join(dir, file);
  return fs.statSync(fullPath).isFile()
    ? fs.readFileSync(fullPath, 'utf8').trim()
    : null;
};

/** package.json의 license는 문자열이거나 구형 licenses 배열이다. */
const readLicenseId = pkg => {
  if (typeof pkg.license === 'string') return pkg.license;
  if (typeof pkg.license === 'object' && pkg.license) return pkg.license.type;
  if (Array.isArray(pkg.licenses)) {
    return pkg.licenses.map(l => l.type || l).join(', ');
  }
  return 'UNKNOWN';
};

const readHomepage = pkg => {
  if (pkg.homepage) return pkg.homepage;
  const repo = pkg.repository;
  const url = typeof repo === 'string' ? repo : repo?.url;
  return url ? url.replace(/^git\+/, '').replace(/\.git$/, '') : null;
};

/** 동일한 라이선스 전문이 수백 번 반복되므로 texts 배열로 모아 인덱스만 참조한다. */
const collect = () => {
  const byId = new Map();
  const texts = [];
  const textIndexes = new Map();

  for (const dir of listPackageDirs()) {
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) continue;

    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    if (!pkg.name || !pkg.version) continue;

    const id = `${pkg.name}@${pkg.version}`;
    if (byId.has(id)) continue;

    const text = readLicenseText(dir);
    if (text !== null && !textIndexes.has(text)) {
      textIndexes.set(text, texts.push(text) - 1);
    }

    byId.set(id, {
      name: pkg.name,
      version: pkg.version,
      license: readLicenseId(pkg),
      homepage: readHomepage(pkg),
      textIndex: text === null ? -1 : textIndexes.get(text),
    });
  }

  const packages = [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return {packages, texts};
};

const {packages, texts} = collect();
fs.writeFileSync(OUT_FILE, JSON.stringify({packages, texts}, null, 2) + '\n');

const missing = packages.filter(p => p.textIndex === -1).length;
console.log(
  `${packages.length}개 패키지, 고유 라이선스 전문 ${texts.length}개를 ` +
    `${path.relative(ROOT, OUT_FILE)}에 기록했습니다.` +
    (missing ? ` (전문 없음: ${missing}개)` : ''),
);
