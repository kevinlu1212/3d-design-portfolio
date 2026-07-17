const { execSync } = require('child_process');
const fs = require('fs');
const REPO = 'kevinlu1212/3d-design-portfolio';

function ghExec(c) { return execSync(c, { encoding: 'utf8', maxBuffer: 50*1024*1024 }).trim(); }
function ghApi(m, p, b) {
  const c = b ? `gh api repos/${REPO}/${p} -X ${m} --input -` : `gh api repos/${REPO}/${p} -X ${m}`;
  const o = { encoding: 'utf8' }; if (b) o.input = JSON.stringify(b);
  return JSON.parse(execSync(c, o));
}

// Remote HEAD
const parentSha = ghApi('GET', 'git/refs/heads/master').object.sha;
const parentCommit = ghApi('GET', `git/commits/${parentSha}`);
const parentTree = ghApi('GET', `git/trees/${parentCommit.tree.sha}`);

// Changed files
const diff = ghExec('git diff HEAD~1 --name-status');
const lines = diff.split('\n').filter(l => l.trim());
console.log('Changed:', lines.length, 'files');

// Create blobs for all files
const entries = [...parentTree.tree];

for (const line of lines) {
  const [status, ...pathParts] = line.split('\t');
  const filePath = pathParts.join('\t');

  if (status === 'D') {
    // Remove from tree
    const idx = entries.findIndex(e => e.path === filePath);
    if (idx !== -1) entries.splice(idx, 1);
    console.log(`  D ${filePath}`);
  } else if (status === 'R') {
    // Rename: old → new
    const newPath = pathParts[pathParts.length - 1];
    // Remove old entry
    const oldName = pathParts[0];
    const idx = entries.findIndex(e => e.path === oldName);
    if (idx !== -1) entries.splice(idx, 1);
    // Add new entry with blob
    const blob = fs.readFileSync(newPath);
    const blobResult = ghApi('POST', 'git/blobs', { content: blob.toString('base64'), encoding: 'base64' });
    entries.push({ path: newPath, mode: '100644', type: 'blob', sha: blobResult.sha });
    console.log(`  R ${oldName} → ${newPath}`);
  } else {
    // A or M — create blob
    const blob = fs.readFileSync(filePath);

    // If it's a large image, check if blob exists first
    if (blob.length > 100000) {
      const localSha = ghExec(`git hash-object "${filePath}"`);
      try {
        ghApi('GET', `git/blobs/${localSha}`);
        entries.push({ path: filePath, mode: '100644', type: 'blob', sha: localSha });
        console.log(`  ${status} ${filePath} (blob exists)`);
        continue;
      } catch {}
    }

    const blobResult = ghApi('POST', 'git/blobs', { content: blob.toString('base64'), encoding: 'base64' });
    // Remove existing entry for this path if modifying
    const idx = entries.findIndex(e => e.path === filePath);
    if (idx !== -1) entries.splice(idx, 1);
    entries.push({ path: filePath, mode: '100644', type: 'blob', sha: blobResult.sha });
    console.log(`  ${status} ${filePath} (${blob.length} bytes)`);
  }
}

// Create tree + commit
const newTree = ghApi('POST', 'git/trees', { tree: entries });
const commitMsg = ghExec('git log -1 --format=%B');
const newCommit = ghApi('POST', 'git/commits', { message: commitMsg, tree: newTree.sha, parents: [parentSha] });
ghApi('PATCH', 'git/refs/heads/master', { sha: newCommit.sha, force: true });

const v = ghApi('GET', 'git/refs/heads/master');
console.log(v.object.sha === newCommit.sha ? '\n✅ Done! https://kevinlu1212.github.io/3d-design-portfolio/' : '\n⚠️ Failed');
