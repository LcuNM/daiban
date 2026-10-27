// 把 chat-digest 上传到 GitHub（不依赖 git，直接用 GitHub API）
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/elysia/.dsh/chat-digest';
const TOKEN = process.env.GH_TOKEN;
const REPO = process.env.REPO_NAME || 'daiban';
const DESC = process.env.REPO_DESC || '待办 —— 把微信群聊自动总结成要点的本地小软件';

if (!TOKEN) { console.log('NO_TOKEN: 需要设置环境变量 GH_TOKEN'); process.exit(1); }

const SKIP_DIRS = new Set(['data', 'runtime', 'node_modules', '.git', '.vscode']);
const SKIP_FILE = /\.bak|\*/;

function walk(dir, rel) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      out.push(...walk(full, r));
    } else {
      if (/\.bak/.test(name) || /\.log$/.test(name) || name === 'Thumbs.db') continue;
      out.push({ path: r, full });
    }
  }
  return out;
}

async function api(p, method, body) {
  const res = await fetch('https://api.github.com' + p, {
    method,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chat-digest-uploader',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(p + ' -> ' + res.status + ' ' + text.slice(0, 300));
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

(async () => {
  const me = await api('/user', 'GET');
  console.log('用户:', me.login);

  let repo;
  try {
    repo = await api('/user/repos', 'POST', { name: REPO, description: DESC, private: false, has_issues: true, auto_init: false });
    console.log('已创建仓库:', repo.full_name);
  } catch (e) {
    if (e.status === 422) {
      repo = await api('/repos/' + me.login + '/' + REPO, 'GET');
      console.log('仓库已存在，往里面推:', repo.full_name);
    } else throw e;
  }

  // 空仓库不能直接建 blob，先建一个初始提交
  let baseSha = null;
  try {
    const head = await api('/repos/' + repo.full_name + '/git/ref/heads/main', 'GET');
    baseSha = head.object.sha;
    console.log('已有 main 分支:', baseSha.slice(0, 7));
  } catch (e) {
    if (e.status === 404 || e.status === 409) {
      const init = await api('/repos/' + repo.full_name + '/contents/README.md', 'PUT', {
        message: '初始化仓库',
        content: fs.readFileSync(path.join(ROOT, 'README.md')).toString('base64'),
      });
      baseSha = init.commit.sha;
      console.log('已创建初始提交:', baseSha.slice(0, 7));
    } else throw e;
  }

  const files = walk(ROOT, '');
  console.log('待上传文件:', files.length);

  const tree = [];
  for (const f of files) {
    const content = fs.readFileSync(f.full);
    const blob = await api('/repos/' + repo.full_name + '/git/blobs', 'POST', {
      content: content.toString('base64'),
      encoding: 'base64',
    });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write('.');
  }
  console.log('');

  const treeRes = await api('/repos/' + repo.full_name + '/git/trees', 'POST', { tree });
  const parents = baseSha ? [baseSha] : [];
  const commit = await api('/repos/' + repo.full_name + '/git/commits', 'POST', {
    message: '上传 待办（chat-digest）',
    tree: treeRes.sha,
    parents,
  });
  try {
    await api('/repos/' + repo.full_name + '/git/refs', 'POST', { ref: 'refs/heads/main', sha: commit.sha });
  } catch (e) {
    if (e.status === 422 || e.status === 409) {
      await api('/repos/' + repo.full_name + '/git/refs/heads/main', 'PATCH', { sha: commit.sha, force: true });
    } else throw e;
  }

  console.log('URL=https://github.com/' + repo.full_name);
  console.log('ZIP=https://github.com/' + repo.full_name + '/archive/refs/heads/main.zip');
})().catch((e) => { console.log('FAIL: ' + e.message); process.exit(1); });
