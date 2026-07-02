export function initAgentRepl(container: HTMLElement) {
  container.innerHTML = `
    <div class="terminal-widget">
      <div class="terminal-header">
        <div class="terminal-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="terminal-title">Cairn Code — Interactive Agent Sandbox</div>
        <div class="terminal-actions">
          <span class="terminal-badge">Agent Active</span>
        </div>
      </div>
      
      <div class="terminal-tabs">
        <button class="tab-btn active" data-tab="repl">Terminal REPL</button>
        <button class="tab-btn" data-tab="files">Project Files</button>
        <button class="tab-btn" data-tab="config">config.json</button>
      </div>

      <div class="terminal-content">
        <!-- REPL Tab -->
        <div class="tab-content active" id="tab-repl">
          <div class="terminal-output" id="terminal-out">
            <div class="line system">Cairn Code v1.0.0 (c) 2026 Cairn Software</div>
            <div class="line system">Connected to local workspace: /Users/cairn/workspace/demo</div>
            <div class="line system">Ready. Type a prompt or choose a template below.</div>
          </div>
          
          <div class="terminal-input-row">
            <span class="prompt-symbol">cairn &gt;</span>
            <input type="text" id="repl-input" placeholder="Ask the agent to build, refactor, or test..." autocomplete="off">
            <button id="run-btn" class="terminal-run-btn">Run</button>
          </div>
        </div>

        <!-- Files Tab -->
        <div class="tab-content" id="tab-files">
          <div class="files-explorer">
            <div class="files-sidebar">
              <div class="file-item directory">src</div>
              <div class="file-item file active" data-file="auth">  auth.ts</div>
              <div class="file-item file" data-file="server">  server.ts</div>
              <div class="file-item file" data-file="db">  database.ts</div>
              <div class="file-item directory">tests</div>
              <div class="file-item file" data-file="test">  auth.test.ts</div>
            </div>
            <div class="file-editor">
              <div class="editor-header">
                <span class="editor-filename" id="editor-title">auth.ts</span>
                <span class="editor-lang">TypeScript</span>
              </div>
              <pre class="editor-code"><code id="code-view"></code></pre>
            </div>
          </div>
        </div>

        <!-- Config Tab -->
        <div class="tab-content" id="tab-config">
          <pre class="config-view"><code>{
  "default_provider": "anthropic",
  "default_model": "claude-3-5-sonnet-latest",
  "max_turns": 40,
  "permissions": {
    "auto_allow": ["file_read", "glob", "grep"],
    "ask": ["file_write", "file_edit", "shell"]
  }
}</code></pre>
        </div>
      </div>

      <div class="terminal-footer">
        <div class="terminal-suggestions">
          <span class="sugg-label">Try task:</span>
          <button class="sugg-btn" data-task="audit">🔒 Audit auth.ts</button>
          <button class="sugg-btn" data-task="add-route">🚀 Add /api/flower</button>
          <button class="sugg-btn" data-task="fix-test">🧪 Fix auth.test.ts</button>
        </div>
        <div class="terminal-metrics">
          <span id="metric-turns">Turns: 0/40</span>
          <span id="metric-cost">Cost: $0.00</span>
        </div>
      </div>

      <!-- Custom Permission Modal inside Terminal -->
      <div class="terminal-overlay-modal" id="perm-modal">
        <div class="perm-card">
          <div class="perm-title">⚠️ Permission Requested</div>
          <div class="perm-desc" id="perm-desc">Tool: file_write</div>
          <div class="perm-btns">
            <button class="perm-btn deny" id="perm-deny">Deny</button>
            <button class="perm-btn allow" id="perm-allow">Allow</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // DOM Elements
  const replInput = container.querySelector('#repl-input') as HTMLInputElement;
  const runBtn = container.querySelector('#run-btn') as HTMLButtonElement;
  const terminalOut = container.querySelector('#terminal-out') as HTMLDivElement;
  const tabBtns = container.querySelectorAll('.tab-btn');
  const tabContents = container.querySelectorAll('.tab-content');
  const suggBtns = container.querySelectorAll('.sugg-btn');
  const codeView = container.querySelector('#code-view') as HTMLElement;
  const editorTitle = container.querySelector('#editor-title') as HTMLSpanElement;
  const permModal = container.querySelector('#perm-modal') as HTMLDivElement;
  const permDesc = container.querySelector('#perm-desc') as HTMLDivElement;
  const permAllow = container.querySelector('#perm-allow') as HTMLButtonElement;
  const permDeny = container.querySelector('#perm-deny') as HTMLButtonElement;

  const metricTurns = container.querySelector('#metric-turns') as HTMLSpanElement;
  const metricCost = container.querySelector('#metric-cost') as HTMLSpanElement;

  // File system state
  const mockFiles: Record<string, string> = {
    auth: `// src/auth.ts\nimport jwt from 'jsonwebtoken';\n\nexport function verifyToken(token: string) {\n  // FIXME: vulnerable to signature verification bypass!\n  const decoded = jwt.decode(token);\n  return decoded;\n}`,
    server: `// src/server.ts\nimport express from 'express';\nimport { verifyToken } from './auth';\n\nconst app = express();\napp.use(express.json());\n\napp.post('/api/login', (req, res) => {\n  const token = req.headers.authorization;\n  const user = verifyToken(token);\n  res.json({ status: 'ok', user });\n});`,
    db: `// src/database.ts\nexport class Database {\n  private static instance: Database;\n  private data: any = {};\n\n  static getInstance() {\n    if (!this.instance) this.instance = new Database();\n    return this.instance;\n  }\n}`,
    test: `// tests/auth.test.ts\nimport { verifyToken } from '../src/auth';\nimport assert from 'assert';\n\ndescribe('Auth Tests', () => {\n  it('should reject invalid token signature', () => {\n    const badToken = 'header.payload.signaturebypass';\n    const res = verifyToken(badToken);\n    assert.equal(res, null); // Currently fails!\n  });\n});`
  };

  // Sync initial file view
  let currentFileKey = 'auth';
  function updateCodeView() {
    codeView.textContent = mockFiles[currentFileKey];
    editorTitle.textContent = `${currentFileKey === 'test' ? 'tests/auth.test.ts' : `src/${currentFileKey}.ts`}`;
  }
  updateCodeView();

  // File sidebar clicks
  container.querySelectorAll('.file-item.file').forEach((el) => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.file-item.file').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      const fileKey = el.getAttribute('data-file') || 'auth';
      currentFileKey = fileKey;
      updateCodeView();
    });
  });

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      container.querySelector(`#tab-${tabId}`)?.classList.add('active');
    });
  });

  // Simulator Engine variables
  let running = false;
  let turns = 0;
  let cost = 0.0;
  let resolvePermission: ((allowed: boolean) => void) | null = null;

  // Append lines helper
  function appendLine(text: string, type: 'system' | 'user' | 'thinking' | 'tool' | 'result' | 'code' | 'error' = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type}`;
    div.innerHTML = text;
    terminalOut.appendChild(div);
    terminalOut.scrollTop = terminalOut.scrollHeight;
  }

  // Stream text token by token
  function streamText(text: string, type: any, delay = 15): Promise<void> {
    return new Promise((resolve) => {
      const div = document.createElement('div');
      div.className = `line ${type}`;
      terminalOut.appendChild(div);
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          // parse simple HTML tags
          if (text[index] === '<') {
            const closingIdx = text.indexOf('>', index);
            if (closingIdx !== -1) {
              div.innerHTML += text.substring(index, closingIdx + 1);
              index = closingIdx + 1;
              return;
            }
          }
          div.innerHTML += text[index];
          index++;
          terminalOut.scrollTop = terminalOut.scrollHeight;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }

  // Request permission helper
  function requestPermission(desc: string): Promise<boolean> {
    return new Promise((resolve) => {
      permDesc.textContent = desc;
      permModal.classList.add('active');
      resolvePermission = resolve;
    });
  }

  permAllow.onclick = () => {
    permModal.classList.remove('active');
    if (resolvePermission) {
      resolvePermission(true);
      resolvePermission = null;
    }
  };

  permDeny.onclick = () => {
    permModal.classList.remove('active');
    if (resolvePermission) {
      resolvePermission(false);
      resolvePermission = null;
    }
  };

  function updateMetrics(t: number, c: number) {
    turns = t;
    cost += c;
    metricTurns.textContent = `Turns: ${turns}/40`;
    metricCost.textContent = `Cost: $${cost.toFixed(4)}`;
  }

  // Simulation Routines
  async function runAuditSimulation() {
    updateMetrics(0, 0);
    appendLine('cairn &gt; Audit security of auth.ts and secure the bypass vulnerability.', 'user');
    await streamText('🤖 <b>Thinking:</b> The user wants to audit <code>src/auth.ts</code>. First, I should search for authentication-related files or read <code>src/auth.ts</code> directly.', 'thinking');
    
    // Step 1: Read file
    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>file_read</b> { path: "src/auth.ts" }', 'tool');
    await new Promise(r => setTimeout(r, 800));
    appendLine(`✅ Read 7 lines. Content:<br><pre class="term-pre">${mockFiles.auth}</pre>`, 'result');

    // Step 2: Analyse & plan edit
    await streamText('🤖 <b>Thinking:</b> In <code>src/auth.ts</code>, <code>jwt.decode(token)</code> is used without verifying the JWT signature. This allows any attacker to bypass authentication by creating a token with custom headers/payloads. I should modify this function to use <code>jwt.verify(token, SECRET)</code> instead. Let\'s check if there\'s a test file to run to verify.', 'thinking');
    
    turns++; updateMetrics(turns, 0.0006);
    appendLine('🔧 [Tool Call] <b>glob</b> { pattern: "tests/**/*.ts" }', 'tool');
    await new Promise(r => setTimeout(r, 600));
    appendLine('✅ Found: <code>tests/auth.test.ts</code>', 'result');

    // Step 3: Run existing tests (fails)
    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm test" }', 'tool');
    const allowedShell1 = await requestPermission('Allow Cairn Code to run: "npm test" on your machine?');
    if (!allowedShell1) {
      appendLine('❌ Permission Denied by user.', 'error');
      running = false;
      return;
    }
    appendLine('Running command: npm test...', 'system');
    await new Promise(r => setTimeout(r, 1200));
    appendLine('❌ Test failing: should reject invalid token signature<br><span class="term-red">AssertionError: [jwt.decode] returned payload bypassing signature check</span>', 'error');

    // Step 4: Edit file (needs permission)
    await streamText('🤖 <b>Thinking:</b> I need to replace <code>jwt.decode(token)</code> with <code>jwt.verify(token, "JWT_SECRET_KEY")</code> inside <code>src/auth.ts</code>. Let\'s make this target edit.', 'thinking');
    
    turns++; updateMetrics(turns, 0.0007);
    appendLine('🔧 [Tool Call] <b>file_edit</b> { path: "src/auth.ts", start_line: 4, end_line: 7 }', 'tool');
    const allowedEdit = await requestPermission('Allow Cairn Code to edit: "src/auth.ts"?');
    if (!allowedEdit) {
      appendLine('❌ Permission Denied by user.', 'error');
      running = false;
      return;
    }

    // Apply file change
    mockFiles.auth = `// src/auth.ts\nimport jwt from 'jsonwebtoken';\n\nconst JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';\n\nexport function verifyToken(token: string) {\n  try {\n    return jwt.verify(token, JWT_SECRET);\n  } catch (err) {\n    return null;\n  }\n}`;
    if (currentFileKey === 'auth') updateCodeView();
    appendLine('✅ File edited successfully. Diffs applied: +6 lines, -2 lines.', 'result');

    // Step 5: Verify via test
    await streamText('🤖 <b>Thinking:</b> Now that I\'ve updated the token validation to verify signature, I should run the unit tests again to check if my changes fixed the vulnerability.', 'thinking');
    
    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm test" }', 'tool');
    const allowedShell2 = await requestPermission('Allow Cairn Code to run: "npm test" on your machine?');
    if (!allowedShell2) {
      appendLine('❌ Permission Denied by user.', 'error');
      running = false;
      return;
    }
    appendLine('Running command: npm test...', 'system');
    await new Promise(r => setTimeout(r, 1000));
    appendLine('✅ <b>All tests passed! (1/1 tests green)</b>', 'result');

    // Finish
    await streamText('🤖 <b>Done!</b> I have verified that <code>src/auth.ts</code> is secure now. The vulnerability has been resolved by verifying the JWT signature, and tests verify that fake signatures are rejected. Let me know if you need anything else.', 'thinking');
    appendLine('✨ Cairn Code completed the task successfully in 5 turns.', 'system');
    running = false;
  }

  async function runAddRouteSimulation() {
    updateMetrics(0, 0);
    appendLine('cairn &gt; Add a new route /api/flower that returns a random flower name.', 'user');
    await streamText('🤖 <b>Thinking:</b> The user wants to add an API route. First, let\'s locate the Express server entry point.', 'thinking');
    
    turns++; updateMetrics(turns, 0.0003);
    appendLine('🔧 [Tool Call] <b>glob</b> { pattern: "src/**/*.ts" }', 'tool');
    await new Promise(r => setTimeout(r, 500));
    appendLine('✅ Found: <code>src/auth.ts</code>, <code>src/server.ts</code>, <code>src/database.ts</code>', 'result');

    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>file_read</b> { path: "src/server.ts" }', 'tool');
    await new Promise(r => setTimeout(r, 600));
    appendLine(`✅ Read 12 lines. Content:<br><pre class="term-pre">${mockFiles.server}</pre>`, 'result');

    await streamText('🤖 <b>Thinking:</b> I see that <code>src/server.ts</code> sets up Express. I will add the <code>/api/flower</code> endpoint. It will return a random flower with its name and meaning. I\'ll import a random array of flowers.', 'thinking');
    
    turns++; updateMetrics(turns, 0.0008);
    appendLine('🔧 [Tool Call] <b>file_edit</b> { path: "src/server.ts", start_line: 9, end_line: 13 }', 'tool');
    const allowedEdit = await requestPermission('Allow Cairn Code to edit: "src/server.ts"?');
    if (!allowedEdit) {
      appendLine('❌ Permission Denied by user.', 'error');
      running = false;
      return;
    }

    mockFiles.server = `// src/server.ts\nimport express from 'express';\nimport { verifyToken } from './auth';\n\nconst app = express();\napp.use(express.json());\n\nconst FLOWERS = [\n  { name: 'Red Rose', meaning: 'Love & Romance' },\n  { name: 'Lavender', meaning: 'Devotion & Tranquility' },\n  { name: 'Bluebell', meaning: 'Humility & Gratitude' }\n];\n\napp.get('/api/flower', (req, res) => {\n  const randomFlower = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];\n  res.json(randomFlower);\n});\n\napp.post('/api/login', (req, res) => {\n  const token = req.headers.authorization;\n  const user = verifyToken(token);\n  res.json({ status: 'ok', user });\n});`;
    if (currentFileKey === 'server') updateCodeView();
    appendLine('✅ Diffs applied. Added /api/flower route.', 'result');

    turns++; updateMetrics(turns, 0.0005);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm run build" }', 'tool');
    const allowedShell = await requestPermission('Allow Cairn Code to run: "npm run build"?');
    if (!allowedShell) {
      appendLine('❌ Permission Denied by user.', 'error');
      running = false;
      return;
    }
    appendLine('Building project...', 'system');
    await new Promise(r => setTimeout(r, 1200));
    appendLine('✅ Build successful. Zero errors. Bundle compiled.', 'result');

    await streamText('🤖 <b>Done!</b> Added the <code>/api/flower</code> route returning random floral descriptions. Let me know if you\'d like me to write a frontend connection or tests for this route.', 'thinking');
    appendLine('✨ Cairn Code completed the task successfully in 4 turns.', 'system');
    running = false;
  }

  async function runFixTestSimulation() {
    updateMetrics(0, 0);
    appendLine('cairn &gt; Run npm test, see what\'s failing, and fix it.', 'user');
    await streamText('🤖 <b>Thinking:</b> Let\'s run the test command first to inspect the output.', 'thinking');

    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm test" }', 'tool');
    const allowed1 = await requestPermission('Allow Cairn Code to run: "npm test"?');
    if (!allowed1) {
      appendLine('❌ Permission Denied.', 'error');
      running = false;
      return;
    }
    appendLine('Running tests...', 'system');
    await new Promise(r => setTimeout(r, 800));
    appendLine('❌ Failing Test:<br><b>tests/auth.test.ts: L8</b> assertion error: <code>verifyToken</code> should reject invalid signature.', 'error');

    await streamText('🤖 <b>Thinking:</b> The test for signature verification is failing because <code>src/auth.ts</code> doesn\'t verify the token correctly. Let\'s read <code>src/auth.ts</code>.', 'thinking');

    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>file_read</b> { path: "src/auth.ts" }', 'tool');
    await new Promise(r => setTimeout(r, 600));
    appendLine(`✅ File Read content:<br><pre class="term-pre">${mockFiles.auth}</pre>`, 'result');

    if (mockFiles.auth.includes('jwt.decode')) {
      await streamText('🤖 <b>Thinking:</b> Ah! The function uses <code>jwt.decode(token)</code> which doesn\'t verify the cryptographic signature. I must replace it with <code>jwt.verify</code>.', 'thinking');
      turns++; updateMetrics(turns, 0.0007);
      appendLine('🔧 [Tool Call] <b>file_edit</b> { path: "src/auth.ts", start_line: 4, end_line: 7 }', 'tool');
      const allowedEdit = await requestPermission('Allow Cairn Code to edit: "src/auth.ts"?');
      if (!allowedEdit) {
        appendLine('❌ Permission Denied.', 'error');
        running = false;
        return;
      }
      mockFiles.auth = `// src/auth.ts\nimport jwt from 'jsonwebtoken';\n\nconst JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';\n\nexport function verifyToken(token: string) {\n  try {\n    return jwt.verify(token, JWT_SECRET);\n  } catch (err) {\n    return null;\n  }\n}`;
      if (currentFileKey === 'auth') updateCodeView();
      appendLine('✅ Diffs applied. auth.ts updated.', 'result');
    } else {
      await streamText('🤖 <b>Thinking:</b> Wait! The signature verification is already using <code>jwt.verify</code>. Oh! The test file itself might be failing to supply a proper signature or has an incorrect assertion. Let\'s read the test file.', 'thinking');
      turns++; updateMetrics(turns, 0.0004);
      appendLine('🔧 [Tool Call] <b>file_read</b> { path: "tests/auth.test.ts" }', 'tool');
      await new Promise(r => setTimeout(r, 600));
      appendLine(`✅ File Read content:<br><pre class="term-pre">${mockFiles.test}</pre>`, 'result');
      // No edit needed as we assume audit edit fixed it.
    }

    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm test" }', 'tool');
    const allowed2 = await requestPermission('Allow Cairn Code to run: "npm test"?');
    if (!allowed2) {
      appendLine('❌ Permission Denied.', 'error');
      running = false;
      return;
    }
    appendLine('Running tests...', 'system');
    await new Promise(r => setTimeout(r, 800));
    appendLine('✅ <b>All tests passed! (1/1 tests green)</b>', 'result');

    await streamText('🤖 <b>Done!</b> The failing unit test has been fixed and successfully verified.', 'thinking');
    appendLine('✨ Cairn Code completed the task successfully in 3 turns.', 'system');
    running = false;
  }

  // Handle custom manual inputs
  async function runCustomInput(query: string) {
    appendLine(`cairn &gt; ${query}`, 'user');
    await streamText(`🤖 <b>Thinking:</b> Searching local workspace for context related to "${query}"...`, 'thinking');
    turns++; updateMetrics(turns, 0.0005);
    appendLine('🔧 [Tool Call] <b>grep</b> { query: "' + query + '" }', 'tool');
    await new Promise(r => setTimeout(r, 1200));
    appendLine('✅ Found occurrences in:<br>• <code>src/server.ts: L8</code><br>• <code>src/auth.ts: L4</code>', 'result');
    await streamText('🤖 <b>Thinking:</b> I can read these occurrences to analyze, but since I am in demo mode, let\'s run code validation tests.', 'thinking');
    turns++; updateMetrics(turns, 0.0004);
    appendLine('🔧 [Tool Call] <b>shell</b> { command: "npm run test" }', 'tool');
    const allowed = await requestPermission('Allow Cairn Code to run: "npm run test"?');
    if (!allowed) {
      appendLine('❌ Permission Denied.', 'error');
      running = false;
      return;
    }
    appendLine('Running tests...', 'system');
    await new Promise(r => setTimeout(r, 800));
    appendLine('✅ All tests green.', 'result');
    await streamText('🤖 <b>Done!</b> Codebase is healthy. Everything looks good!', 'thinking');
    running = false;
  }

  // Run button handler
  function triggerPrompt() {
    if (running) return;
    const value = replInput.value.trim();
    if (!value) return;
    running = true;
    replInput.value = '';
    runCustomInput(value);
  }

  runBtn.onclick = triggerPrompt;
  replInput.onkeypress = (e) => {
    if (e.key === 'Enter') triggerPrompt();
  };

  // Suggestion buttons handler
  suggBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (running) return;
      running = true;
      const task = btn.getAttribute('data-task');
      if (task === 'audit') {
        runAuditSimulation();
      } else if (task === 'add-route') {
        runAddRouteSimulation();
      } else if (task === 'fix-test') {
        runFixTestSimulation();
      }
    });
  });
}
