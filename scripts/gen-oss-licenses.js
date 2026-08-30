#!/usr/bin/env node
/**
 * 앱에 번들되는 프로덕션 의존성의 오픈소스 라이선스 목록을 생성한다.
 * 의존성이 바뀌었을 때만 `npm run licenses`로 재생성하고, 결과 JSON은 커밋한다.
 *
 * 라이선스 전문은 번들에 싣지 않고 화면에서 SPDX/저장소 링크로 연결한다.
 *
 * ponytail: JS 의존성만 수집한다. Android AAR / CocoaPods 등 네이티브 전용
 * 의존성(Firebase Android SDK, OkHttp 등)은 빠진다. 필요해지면 Android는
 * oss-licenses-plugin, iOS는 Pods 하위 LICENSE 수집으로 확장한다.
 */
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'src', 'assets', 'oss-licenses.json');
const MAX_BUFFER = 64 * 1024 * 1024;
const SPDX_BASE = 'https://spdx.org/licenses';
const REQUEST_TIMEOUT = 10000;

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

/** license-checker의 publisher와 같은 값으로, package.json의 author에서 온다. */
const readPublisher = pkg => {
  const {author} = pkg;
  if (typeof author === 'string') {
    return author.replace(/\s*[<(].*$/, '').trim() || null;
  }
  return author && author.name ? author.name.trim() : null;
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

/**
 * `(MIT OR GPL-2.0)`처럼 복합 표현식이면 개별 식별자로 쪼갠다.
 * 화면에서 각 라이선스를 따로 링크하기 위함이다.
 */
const parseLicenseIds = expression =>
  expression
    .replace(/[()]/g, ' ')
    .split(/\s+(?:OR|AND)\s+|,/i)
    .map(id => id.trim())
    .filter(Boolean);

/**
 * SPDX 페이지 존재 여부를 실제로 확인한다. `BSD`처럼 관용적으로 쓰이지만
 * SPDX에 없는 값이 있어 형식만 보고 링크를 만들면 죽은 링크가 생긴다.
 * 네트워크 자체가 실패하면 링크 없는 목록이 커밋되지 않도록 예외를 던진다.
 */
const spdxPageExists = url =>
  new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {method: 'HEAD', timeout: REQUEST_TIMEOUT},
      response => {
        response.resume();
        resolve(response.statusCode === 200);
      },
    );
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
    request.end();
  });

const resolveLicenseUrls = async packages => {
  const cache = new Map();
  for (const pkg of packages) {
    for (const {id} of pkg.licenses) {
      if (cache.has(id)) continue;
      const url = `${SPDX_BASE}/${encodeURIComponent(id)}.html`;
      cache.set(id, (await spdxPageExists(url)) ? url : null);
    }
  }
  for (const pkg of packages) {
    for (const license of pkg.licenses) {
      license.url = cache.get(license.id);
    }
  }
  return cache;
};

const collect = () => {
  const byId = new Map();

  for (const dir of listPackageDirs()) {
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) continue;

    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    if (!pkg.name || !pkg.version) continue;

    const id = `${pkg.name}@${pkg.version}`;
    if (byId.has(id)) continue;

    byId.set(id, {
      name: pkg.name,
      version: pkg.version,
      licenses: parseLicenseIds(readLicenseId(pkg)).map(id => ({
        id,
        url: null,
      })),
      publisher: readPublisher(pkg),
    });
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const main = async () => {
  const packages = collect();
  const cache = await resolveLicenseUrls(packages);

  fs.writeFileSync(OUT_FILE, JSON.stringify(packages, null, 2) + '\n');

  const unresolved = [...cache.entries()]
    .filter(([, url]) => !url)
    .map(([id]) => id);
  console.log(
    `${packages.length}개 패키지, 라이선스 식별자 ${cache.size}종을 ` +
      `${path.relative(ROOT, OUT_FILE)}에 기록했습니다.`,
  );
  if (unresolved.length) {
    console.log(`SPDX 페이지 없음: ${unresolved.join(', ')}`);
  }
};

main().catch(error => {
  console.error(`생성 실패: ${error.message}`);
  process.exit(1);
});
