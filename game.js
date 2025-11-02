// 游戏核心逻辑
const GitAdventureGame = {
    currentLevel: null,
    gameState: {
        repository: {
            files: {},
            commits: [],
            currentBranch: 'master',
            branches: ['master'],
            stagedChanges: {},
            untrackedFiles: {},
            status: {}
        }
    },
    terminalHistory: [],
    commandIndex: -1,
    darkMode: false,
    commands: {},
    levels: [],
    modals: {
        commands: null
    },
    levelCompleted: false, // 添加状态标记关卡是否已完成

    // 初始化游戏
    init() {
        this.initializeDOM();
        this.loadCommands();
        this.loadLevels();
        this.setupEventListeners();
        this.checkSystemTheme();
        this.showLevelSelector();
    },

    // 初始化DOM元素引用
    initializeDOM() {
        this.elements = {
            body: document.body,
            levelSelector: document.getElementById('level-selector'),
            gameContainer: document.getElementById('game-container'),
            levelsContainer: document.getElementById('levels-container'),
            levelTitle: document.getElementById('level-title'),
            levelDescription: document.getElementById('level-description-text'),
            terminalOutput: document.getElementById('terminal-output'),
            commandInput: document.getElementById('command-input'),
            fileTree: document.getElementById('file-tree'),
            backToLevels: document.getElementById('back-to-levels'),
            themeToggle: document.getElementById('theme-toggle'),
            commandsToggle: document.getElementById('commands-toggle'),
            commandsModal: document.getElementById('commands-modal'),
            closeCommands: document.getElementById('close-commands'),
            commandsTable: document.getElementById('commands-table')
        };
    },

    // 设置事件监听器
    setupEventListeners() {
        // 命令输入处理
        this.elements.commandInput.addEventListener('keydown', (e) => this.handleCommandInput(e));
        
        // 返回关卡选择
        this.elements.backToLevels.addEventListener('click', () => this.showLevelSelector());
        
        // 主题切换
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // 命令列表模态框
        this.elements.commandsToggle.addEventListener('click', () => this.showCommandsModal());
        this.elements.closeCommands.addEventListener('click', () => this.hideCommandsModal());
        
        // 点击模态框外部关闭
        this.elements.commandsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.commandsModal) {
                this.hideCommandsModal();
            }
        });
    },

    // 加载命令配置
    loadCommands() {
        // 这里我们直接定义支持的命令
        this.commands = {
            'git init': {
                description: '初始化一个新的Git仓库',
                example: 'git init',
                execute: () => {
                    if (Object.keys(this.gameState.repository.commits).length > 0) {
                        return '错误: 仓库已经初始化';
                    }
                    this.gameState.repository = {
                        files: {},
                        commits: [],
                        currentBranch: 'master',
                        branches: ['master'],
                        stagedChanges: {},
                        untrackedFiles: {},
                        status: {}
                    };
                    return '初始化空的Git仓库成功';
                }
            },
            'git add': {
                description: '将文件添加到暂存区',
                example: 'git add file.txt 或 git add .',
                execute: (args) => {
                    if (!args || args.length === 0) {
                        return '用法: git add <file>...';
                    }
                    
                    if (args[0] === '.') {
                        // 添加所有文件
                        for (let file in this.gameState.repository.untrackedFiles) {
                            this.gameState.repository.stagedChanges[file] = this.gameState.repository.untrackedFiles[file];
                            delete this.gameState.repository.untrackedFiles[file];
                        }
                        return '已将所有未跟踪的文件添加到暂存区';
                    } else {
                        const fileName = args[0];
                        if (this.gameState.repository.untrackedFiles[fileName]) {
                            this.gameState.repository.stagedChanges[fileName] = this.gameState.repository.untrackedFiles[fileName];
                            delete this.gameState.repository.untrackedFiles[fileName];
                            return `已将 ${fileName} 添加到暂存区`;
                        } else {
                            return `错误: 找不到文件 ${fileName}`;
                        }
                    }
                }
            },
            'git commit': {
                description: '创建一个新的提交',
                example: 'git commit -m "提交信息" 或 git commit -a -m "提交信息"',
                execute: (args) => {
                    // 检查是否有要提交的更改（已暂存或修改的）
                    let hasChanges = Object.keys(this.gameState.repository.stagedChanges).length > 0;
                    let useAllChanges = false;
                    let message = null;
                    
                    // 智能解析参数
                    for (let i = 0; i < args.length; i++) {
                        if (args[i] === '-a') {
                            useAllChanges = true;
                            // 检查是否有修改的文件
                            const hasModifiedFiles = Object.keys(this.gameState.repository.untrackedFiles).length > 0 || 
                                                  Object.keys(this.gameState.repository.stagedChanges).length > 0;
                            if (hasModifiedFiles) hasChanges = true;
                        } else if (args[i] === '-m' && i + 1 < args.length) {
                            // 提取提交信息
                            message = args.slice(i + 1).join(' ');
                            break;
                        }
                    }
                    
                    if (!hasChanges) {
                        return '没有要提交的更改';
                    }
                    
                    if (!message) {
                        return '用法: git commit -m "提交信息" 或 git commit -a -m "提交信息"\n请使用-m参数提供提交信息';
                    }
                    
                    // 准备提交的更改
                    let changesToCommit = {...this.gameState.repository.stagedChanges};
                    
                    // 如果使用-a参数，添加所有未暂存的更改
                    if (useAllChanges) {
                        for (let file in this.gameState.repository.untrackedFiles) {
                            changesToCommit[file] = this.gameState.repository.untrackedFiles[file];
                        }
                    }
                    
                    const commitId = 'commit-' + Date.now().toString().slice(-8);
                    this.gameState.repository.commits.push({
                        id: commitId,
                        message: message,
                        changes: changesToCommit,
                        timestamp: new Date().toISOString()
                    });
                    
                    // 更新仓库文件
                    for (let file in changesToCommit) {
                        this.gameState.repository.files[file] = changesToCommit[file];
                        // 从未跟踪文件中移除
                        if (this.gameState.repository.untrackedFiles[file]) {
                            delete this.gameState.repository.untrackedFiles[file];
                        }
                    }
                    
                    // 清空暂存区
                    this.gameState.repository.stagedChanges = {};
                    
                    return `[${this.gameState.repository.currentBranch} ${commitId.substring(0, 7)}] ${message}`;
                }
            },
            'git status': {
                description: '显示工作目录和暂存区的状态',
                example: 'git status',
                execute: () => {
                    let output = '在分支 ' + this.gameState.repository.currentBranch + '\n';
                    
                    if (Object.keys(this.gameState.repository.untrackedFiles).length > 0) {
                        output += '\n未跟踪的文件:\n  (使用 "git add <file>..." 以包含要提交的内容)\n';
                        for (let file in this.gameState.repository.untrackedFiles) {
                            output += '\t' + file + '\n';
                        }
                    }
                    
                    if (Object.keys(this.gameState.repository.stagedChanges).length > 0) {
                        output += '\n要提交的变更:\n  (使用 "git commit" 提交)\n';
                        for (let file in this.gameState.repository.stagedChanges) {
                            output += '\t新增:     ' + file + '\n';
                        }
                    }
                    
                    if (output === '在分支 ' + this.gameState.repository.currentBranch + '\n') {
                        output += '\n没有要提交的变更，工作目录干净';
                    }
                    
                    return output;
                }
            },
            'git log': {
                description: '显示提交历史',
                example: 'git log',
                execute: () => {
                    if (this.gameState.repository.commits.length === 0) {
                        return '没有提交历史';
                    }
                    
                    let output = '';
                    this.gameState.repository.commits.slice().reverse().forEach(commit => {
                        output += 'commit ' + commit.id + '\n';
                        output += 'Date:   ' + new Date(commit.timestamp).toLocaleString() + '\n';
                        output += '\n    ' + commit.message + '\n\n';
                    });
                    
                    return output;
                }
            },
            'ls': {
                description: '列出目录内容',
                example: 'ls',
                execute: () => {
                    const allFiles = {...this.gameState.repository.files, ...this.gameState.repository.untrackedFiles};
                    if (Object.keys(allFiles).length === 0) {
                        return '目录为空';
                    }
                    return Object.keys(allFiles).join('  ');
                }
            },
            'cat': {
                description: '查看文件内容',
                example: 'cat file.txt',
                execute: (args) => {
                    if (!args || args.length === 0) {
                        return '用法: cat <file>';
                    }
                    
                    const fileName = args[0];
                    const allFiles = {...this.gameState.repository.files, ...this.gameState.repository.untrackedFiles, ...this.gameState.repository.stagedChanges};
                    
                    if (allFiles[fileName]) {
                        return allFiles[fileName];
                    } else {
                        return `错误: 没有那个文件或目录: ${fileName}`;
                    }
                }
            },
            'echo': {
                description: '显示文本或创建文件',
                example: 'echo "内容" > file.txt',
                execute: (args) => {
                    if (!args || args.length === 0) {
                        return '';
                    }
                    
                    // 检查是否是文件创建
                    if (args.some(arg => arg === '>') || args.some(arg => arg === '>>')) {
                        const redirectIndex = args.indexOf('>') !== -1 ? args.indexOf('>') : args.indexOf('>>');
                        const isAppend = args[redirectIndex] === '>>';
                        const content = args.slice(0, redirectIndex).join(' ').replace(/^"|"$/g, '');
                        const fileName = args[redirectIndex + 1];
                        
                        if (this.gameState.repository.files[fileName]) {
                            this.gameState.repository.files[fileName] = isAppend ? 
                                this.gameState.repository.files[fileName] + '\n' + content : content;
                        } else if (this.gameState.repository.untrackedFiles[fileName]) {
                            this.gameState.repository.untrackedFiles[fileName] = isAppend ? 
                                this.gameState.repository.untrackedFiles[fileName] + '\n' + content : content;
                        } else {
                            this.gameState.repository.untrackedFiles[fileName] = content;
                        }
                        this.updateFileTree();
                        return '';
                    }
                    
                    return args.join(' ');
                }
            },
            'mkdir': {
                description: '创建目录',
                example: 'mkdir dir',
                execute: (args) => {
                    if (!args || args.length === 0) {
                        return '用法: mkdir <directory>';
                    }
                    
                    const dirName = args[0];
                    // 在模拟环境中，我们用特殊标记表示目录
                    this.gameState.repository.untrackedFiles[dirName + '/'] = '[目录]';
                    this.updateFileTree();
                    return `已创建目录 '${dirName}'`;
                }
            },
            'touch': {
                description: '创建空文件',
                example: 'touch file.txt',
                execute: (args) => {
                    if (!args || args.length === 0) {
                        return '用法: touch <file>...';
                    }
                    
                    args.forEach(fileName => {
                        // 如果文件不存在，则创建空文件
                        if (!this.gameState.repository.files[fileName] && 
                            !this.gameState.repository.untrackedFiles[fileName]) {
                            this.gameState.repository.untrackedFiles[fileName] = '';
                        }
                    });
                    
                    this.updateFileTree();
                    return `已创建文件: ${args.join(', ')}`;
                }
            },
            'help': {
                description: '显示帮助信息',
                example: 'help',
                execute: () => {
                    return 'Git冒险游戏 - 支持的命令:\n' + 
                           '  git init    - 初始化仓库\n' +
                           '  git add     - 添加文件到暂存区\n' +
                           '  git commit  - 创建提交\n' +
                           '  git status  - 查看状态\n' +
                           '  git log     - 查看提交历史\n' +
                           '  ls          - 列出文件\n' +
                           '  cat         - 查看文件内容\n' +
                           '  echo        - 显示文本或创建文件 (用法: echo "内容" > file.txt)\n' +
                           '  touch       - 创建空文件 (用法: touch file.txt)\n' +
                           '  mkdir       - 创建目录\n' +
                           '  help        - 显示此帮助信息';
                }
            }
        };
    },

    // 加载关卡配置
    loadLevels() {
        // 基础关卡配置
        let basicLevels = [
            {
                id: 1,
                title: 'Git基础 - 初始化仓库',
                description: '欢迎来到Git冒险！在这个关卡中，你需要初始化一个Git仓库，并创建你的第一个提交。\n\n任务：\n1. 初始化一个Git仓库\n2. 创建一个README.md文件\n3. 将文件添加到暂存区\n4. 创建一个提交',
                initialState: {
                    repository: {
                        files: {},
                        commits: [],
                        currentBranch: 'master',
                        branches: ['master'],
                        stagedChanges: {},
                        untrackedFiles: {},
                        status: {}
                    }
                },
                completionCondition: (state) => {
                    return state.repository.commits.length > 0 && 
                           state.repository.files['README.md'] !== undefined;
                }
            },
            {
                id: 2,
                title: '文件操作 - 添加和修改',
                description: '很好！现在让我们练习添加多个文件和修改现有文件。\n\n任务：\n1. 创建一个index.html文件\n2. 添加并提交这个文件\n3. 修改README.md文件\n4. 再次提交修改',
                initialState: {
                    repository: {
                        files: {
                            'README.md': '# Git Adventure\n这是一个学习Git的游戏。'
                        },
                        commits: [{
                            id: 'initial-commit',
                            message: '初始提交',
                            changes: {
                                'README.md': '# Git Adventure\n这是一个学习Git的游戏。'
                            },
                            timestamp: new Date().toISOString()
                        }],
                        currentBranch: 'master',
                        branches: ['master'],
                        stagedChanges: {},
                        untrackedFiles: {},
                        status: {}
                    }
                },
                completionCondition: (state) => {
                    return state.repository.commits.length >= 3 &&
                           state.repository.files['index.html'] !== undefined &&
                           state.repository.files['README.md'] !== '# Git Adventure\n这是一个学习Git的游戏。';
                }
            },
            {
                id: 3,
                title: '状态检查 - 理解工作区',
                description: '在这个关卡中，你需要学会使用git status命令来检查你的工作区状态。\n\n任务：\n1. 创建两个新文件\n2. 只添加一个文件到暂存区\n3. 运行git status查看状态\n4. 然后添加并提交所有更改',
                initialState: {
                    repository: {
                        files: {},
                        commits: [],
                        currentBranch: 'master',
                        branches: ['master'],
                        stagedChanges: {},
                        untrackedFiles: {},
                        status: {}
                    }
                },
                completionCondition: (state) => {
                    return state.repository.commits.length > 0 && 
                           Object.keys(state.repository.files).length >= 2;
                }
            }
        ];

        // 检查是否有外部levels.js文件中的关卡
        if (typeof allLevels !== 'undefined' && allLevels.length > 0) {
            this.levels = [...basicLevels, ...allLevels.filter(l => l.id > 3)];
        } else {
            // 如果没有外部关卡，则只使用基础关卡
            this.levels = basicLevels;
            
            // 添加额外的关卡配置
            let additionalLevels = [
                {
                    id: 4,
                    title: '分支操作 - 创建和切换',
                    description: '现在让我们学习Git分支的基本操作。\n\n任务：\n1. 查看当前所在的分支\n2. 创建一个新文件\n3. 添加并提交这个文件\n4. 记住，这个关卡我们将在后续实现完整的分支功能',
                    initialState: {
                        repository: {
                            files: {
                                'README.md': '# Git Adventure\n交互式学习Git的游戏'
                            },
                            commits: [{
                                id: 'initial-commit',
                                message: '初始提交',
                                changes: {
                                    'README.md': '# Git Adventure\n交互式学习Git的游戏'
                                },
                                timestamp: new Date().toISOString()
                            }],
                            currentBranch: 'master',
                            branches: ['master'],
                            stagedChanges: {},
                            untrackedFiles: {},
                            status: {}
                        }
                    },
                    completionCondition: (state) => {
                        return state.repository.commits.length >= 2;
                    }
                },
                {
                    id: 5,
                    title: '合并操作 - 整合代码',
                    description: '在这个关卡中，我们将学习合并的概念。\n\n任务：\n1. 创建一个新文件feature.txt\n2. 添加一些内容到文件中\n3. 提交这个文件\n4. 记住，完整的合并功能将在后续实现',
                    initialState: {
                        repository: {
                            files: {
                                'README.md': '# Git Adventure\n交互式学习Git的游戏'
                            },
                            commits: [{
                                id: 'initial-commit',
                                message: '初始提交',
                                changes: {
                                    'README.md': '# Git Adventure\n交互式学习Git的游戏'
                                },
                                timestamp: new Date().toISOString()
                            }],
                            currentBranch: 'master',
                            branches: ['master'],
                            stagedChanges: {},
                            untrackedFiles: {},
                            status: {}
                        }
                    },
                    completionCondition: (state) => {
                        return state.repository.files['feature.txt'] !== undefined;
                    }
                },
                // 为了演示，我们添加一些简单关卡，完整实现会在引入levels.js后获得所有20个关卡
                {
                    id: 6,
                    title: 'Git日志 - 查看历史',
                    description: '学习如何查看Git的提交历史。\n\n任务：\n1. 创建多个提交\n2. 使用git log查看完整的提交历史\n3. 观察每个提交的详细信息',
                    initialState: {
                        repository: {
                            files: {
                                'README.md': '# Git Adventure'
                            },
                            commits: [{
                                id: 'initial-commit',
                                message: '初始提交',
                                changes: {
                                    'README.md': '# Git Adventure'
                                },
                                timestamp: new Date().toISOString()
                            }],
                            currentBranch: 'master',
                            branches: ['master'],
                            stagedChanges: {},
                            untrackedFiles: {},
                            status: {}
                        }
                    },
                    completionCondition: (state) => {
                        return state.repository.commits.length >= 3;
                    }
                }
            ];
            
            this.levels = [...basicLevels, ...additionalLevels];
        }
    },

    // 显示关卡选择器
    showLevelSelector() {
        this.elements.levelSelector.classList.remove('hidden');
        this.elements.gameContainer.classList.add('hidden');
        
        // 清空并重新填充关卡列表
        this.elements.levelsContainer.innerHTML = '';
        
        this.levels.forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `
                <h3>关卡 ${level.id}: ${level.title}</h3>
                <p>${level.description.split('\n')[0]}...</p>
            `;
            
            card.addEventListener('click', () => this.startLevel(level.id));
            this.elements.levelsContainer.appendChild(card);
        });
    },

    // 开始指定关卡
    startLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        if (!level) return;
        
        this.currentLevel = level;
        this.gameState = JSON.parse(JSON.stringify(level.initialState));
        this.levelCompleted = false; // 重置关卡完成状态
        
        this.elements.levelTitle.textContent = `关卡 ${level.id}: ${level.title}`;
        this.elements.levelDescription.innerHTML = level.description.replace(/\n/g, '<br>');
        
        this.elements.levelSelector.classList.add('hidden');
        this.elements.gameContainer.classList.remove('hidden');
        
        // 重置终端
        this.elements.terminalOutput.innerHTML = '';
        this.elements.commandInput.value = '';
        this.terminalHistory = [];
        this.commandIndex = -1;
        
        // 确保命令输入框可用
        this.elements.commandInput.disabled = false;
        this.elements.commandInput.placeholder = '输入命令...';
        
        this.updateFileTree();
        this.printToTerminal(`欢迎来到关卡 ${level.id}: ${level.title}`);
        this.printToTerminal('输入命令开始游戏，或输入 help 查看可用命令');
        this.elements.commandInput.focus();
    },



    // 执行命令
    executeCommand(command) {
        this.printToTerminal(`$ ${command}`, 'prompt');
        
        const parts = command.split(' ');
        const mainCommand = parts[0];
        const args = parts.slice(1);
        
        let output = '';
        
        // 处理git命令
        if (mainCommand === 'git' && args.length > 0) {
            const gitSubcommand = 'git ' + args[0];
            const gitArgs = args.slice(1);
            
            if (this.commands[gitSubcommand]) {
                output = this.commands[gitSubcommand].execute(gitArgs);
            } else {
                output = `错误: 未知的命令 '${command}'`;
            }
        } else if (this.commands[mainCommand]) {
            // 处理非git命令
            output = this.commands[mainCommand].execute(args);
        } else {
            output = `错误: 未知的命令 '${command}'`;
        }
        
        if (output) {
            this.printToTerminal(output);
        }
        
        // 只有在关卡未完成的情况下才检查完成条件
        if (!this.levelCompleted) {
            this.checkLevelCompletion();
        }
    },

    // 打印到终端
    printToTerminal(text, type = 'output') {
        const line = document.createElement('div');
        line.className = type;
        line.textContent = text;
        this.elements.terminalOutput.appendChild(line);
        this.elements.terminalOutput.scrollTop = this.elements.terminalOutput.scrollHeight;
    },

    // 更新文件树显示
    updateFileTree() {
        const allFiles = {...this.gameState.repository.files, ...this.gameState.repository.untrackedFiles, ...this.gameState.repository.stagedChanges};
        const fileNames = Object.keys(allFiles);
        
        if (fileNames.length === 0) {
            this.elements.fileTree.textContent = '空目录';
            return;
        }
        
        this.elements.fileTree.innerHTML = '';
        
        fileNames.forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-tree-item';
            
            let prefix = '';
            if (this.gameState.repository.stagedChanges[fileName]) {
                prefix = '[已暂存] ';
            } else if (this.gameState.repository.untrackedFiles[fileName]) {
                prefix = '[未跟踪] ';
            }
            
            fileItem.textContent = prefix + fileName;
            this.elements.fileTree.appendChild(fileItem);
        });
    },

    // 检查关卡完成
    checkLevelCompletion() {
        if (this.currentLevel && this.currentLevel.completionCondition(this.gameState) && !this.levelCompleted) {
            this.levelCompleted = true;
            setTimeout(() => {
                // 禁用命令输入框，防止输入新命令
                this.elements.commandInput.disabled = true;
                this.elements.commandInput.placeholder = '关卡已完成...';
                
                // 显示完成模态窗口
                this.showCompletionModal();
            }, 500);
        }
    },
    
    // 显示完成模态窗口
    showCompletionModal() {
        // 创建模态窗口容器
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.fontFamily = 'Arial, sans-serif';
        
        // 创建模态内容
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = this.darkMode ? '#2c2c2c' : 'white';
        modalContent.style.padding = '30px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modalContent.style.textAlign = 'center';
        modalContent.style.minWidth = '300px';
        modalContent.style.color = this.darkMode ? 'white' : 'black';
        
        // 创建标题
        const title = document.createElement('h2');
        title.textContent = '恭喜完成！';
        title.style.marginTop = '0';
        title.style.marginBottom = '20px';
        title.style.color = '#4CAF50';
        
        // 创建消息
        const message = document.createElement('p');
        message.textContent = `你成功完成了「${this.currentLevel.title}」关卡！`;
        message.style.marginBottom = '25px';
        message.style.fontSize = '16px';
        
        // 创建按钮
        const button = document.createElement('button');
        button.textContent = '返回关卡选择';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '12px 24px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';
        button.style.transition = 'background-color 0.3s';
        
        // 添加悬停效果
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#45a049';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#4CAF50';
        });
        
        // 添加点击事件
        const handleClick = () => {
            modal.remove();
            this.showLevelSelector();
            this.levelCompleted = false;
        };
        button.addEventListener('click', handleClick);
        
        // 将元素添加到模态内容
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(button);
        
        // 将模态内容添加到模态窗口
        modal.appendChild(modalContent);
        
        // 添加到body
        document.body.appendChild(modal);
    },
    
    // 处理命令输入
    handleCommandInput(event) {
        // 关卡完成状态由模态窗口处理，不再需要键盘事件处理
        
        if (event.key === 'Enter') {
            const command = this.elements.commandInput.value.trim();
            if (command) {
                this.executeCommand(command);
                this.terminalHistory.push(command);
                this.commandIndex = this.terminalHistory.length;
                this.elements.commandInput.value = '';
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.commandIndex > 0) {
                this.commandIndex--;
                this.elements.commandInput.value = this.terminalHistory[this.commandIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.commandIndex < this.terminalHistory.length - 1) {
                this.commandIndex++;
                this.elements.commandInput.value = this.terminalHistory[this.commandIndex];
            } else {
                this.commandIndex = this.terminalHistory.length;
                this.elements.commandInput.value = '';
            }
        }
    },
    
    // 显示命令列表模态框
    showCommandsModal() {
        // 清空表格
        const tbody = this.elements.commandsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // 填充表格
        for (let cmd in this.commands) {
            const row = tbody.insertRow();
            const cmdCell = row.insertCell(0);
            const descCell = row.insertCell(1);
            const exampleCell = row.insertCell(2);
            
            cmdCell.textContent = cmd;
            descCell.textContent = this.commands[cmd].description;
            exampleCell.textContent = this.commands[cmd].example;
        }
        
        this.elements.commandsModal.classList.remove('hidden');
    },

    // 隐藏命令列表模态框
    hideCommandsModal() {
        this.elements.commandsModal.classList.add('hidden');
    },

    // 检查系统主题
    checkSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setDarkMode(true);
        } else {
            this.setDarkMode(false);
        }
    },

    // 切换主题
    toggleTheme() {
        this.setDarkMode(!this.darkMode);
    },

    // 设置深色模式
    setDarkMode(isDark) {
        this.darkMode = isDark;
        if (isDark) {
            this.elements.body.classList.add('dark');
            this.elements.body.classList.remove('light');
        } else {
            this.elements.body.classList.add('light');
            this.elements.body.classList.remove('dark');
        }
    }
};

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    GitAdventureGame.init();
});