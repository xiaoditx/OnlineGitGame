// 扩展关卡配置
const additionalLevels = [
    {
        id: 4,
        title: '分支操作 - 创建和切换',
        description: '现在让我们学习Git分支的基本操作。\n\n任务：\n1. 查看当前所在的分支\n2. 创建一个名为"feature"的新分支\n3. 切换到新创建的分支\n4. 在feature分支上创建一个新文件并提交',
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
            // 这里需要在game.js中实现git branch和git checkout命令
            return false; // 占位，实际实现时需要更新
        }
    },
    {
        id: 5,
        title: '合并操作 - 整合代码',
        description: '在这个关卡中，你将学习如何合并分支。\n\n任务：\n1. 切换回master分支\n2. 将feature分支合并到master分支\n3. 验证合并是否成功',
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
                currentBranch: 'feature',
                branches: ['master', 'feature'],
                stagedChanges: {},
                untrackedFiles: {},
                status: {}
            }
        },
        completionCondition: (state) => {
            // 这里需要在game.js中实现git merge命令
            return false; // 占位，实际实现时需要更新
        }
    },
    {
        id: 6,
        title: '撤销更改 - 重置和恢复',
        description: '学习如何撤销工作区中的更改。\n\n任务：\n1. 修改README.md文件的内容\n2. 使用git checkout撤销修改\n3. 验证文件内容已恢复',
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
            return state.repository.files['README.md'] === '# Git Adventure\n交互式学习Git的游戏';
        }
    },
    {
        id: 7,
        title: '忽略文件 - .gitignore',
        description: '学习如何使用.gitignore文件忽略不需要跟踪的文件。\n\n任务：\n1. 创建一个.gitignore文件\n2. 在.gitignore中添加规则忽略.log文件\n3. 创建一个测试.log文件\n4. 验证.log文件是否被忽略',
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
            return state.repository.files['.gitignore'] !== undefined;
        }
    },
    {
        id: 8,
        title: '差异比较 - git diff',
        description: '学习如何比较文件的不同版本。\n\n任务：\n1. 修改README.md文件\n2. 使用git diff查看更改内容\n3. 添加并提交更改\n4. 使用git diff查看与上一次提交的差异',
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
        id: 9,
        title: '暂存部分文件 - git add 部分',
        description: '学习如何只暂存文件的一部分更改。\n\n任务：\n1. 在README.md中添加多个更改\n2. 尝试只暂存其中一部分更改\n3. 提交已暂存的更改\n4. 查看剩余的未暂存更改',
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
        id: 10,
        title: '标签管理 - git tag',
        description: '学习如何为重要的提交创建标签。\n\n任务：\n1. 查看当前仓库的标签\n2. 为最近的提交创建一个标签\n3. 再次查看标签列表确认添加成功',
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
                tags: [],
                stagedChanges: {},
                untrackedFiles: {},
                status: {}
            }
        },
        completionCondition: (state) => {
            return state.repository.tags && state.repository.tags.length > 0;
        }
    }
];

// 更多关卡配置（示例框架）
const levelTemplates = [
    {
        id: 11,
        title: '历史回溯 - git reset',
        description: '学习如何使用git reset命令回溯历史。\n\n任务：\n1. 创建多个提交\n2. 使用git reset回到之前的提交\n3. 查看提交历史确认回溯成功',
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
    },
    {
        id: 12,
        title: '交互式添加 - git add -p',
        description: '学习如何交互式地选择要暂存的更改。\n\n任务：\n1. 在文件中添加多处更改\n2. 使用git add -p交互式选择部分更改\n3. 提交所选更改',
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
            return state.repository.commits.length >= 2;
        }
    },
    {
        id: 13,
        title: '合并冲突 - 解决分歧',
        description: '学习如何处理合并冲突。\n\n任务：\n1. 在master分支修改README.md\n2. 创建并切换到新分支，修改同一文件的同一部分\n3. 尝试合并两个分支，解决冲突\n4. 完成合并提交',
        initialState: {
            repository: {
                files: {
                    'README.md': '# Git Adventure\n第13关：合并冲突'
                },
                commits: [{
                    id: 'initial-commit',
                    message: '初始提交',
                    changes: {
                        'README.md': '# Git Adventure\n第13关：合并冲突'
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
            return state.repository.branches.length >= 2 && 
                   state.repository.commits.length >= 3;
        }
    },
    {
        id: 14,
        title: '重写历史 - git rebase',
        description: '学习如何使用rebase重写提交历史。\n\n任务：\n1. 创建一个feature分支并添加几个提交\n2. 切换回master分支并添加新的提交\n3. 在feature分支上执行rebase操作\n4. 查看重写后的提交历史',
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
            return state.repository.branches.length >= 2 && 
                   state.repository.commits.length >= 4;
        }
    },
    {
        id: 15,
        title: '储藏更改 - git stash',
        description: '学习如何临时储藏工作区的更改。\n\n任务：\n1. 在当前分支进行一些更改但不提交\n2. 使用git stash储藏这些更改\n3. 切换到另一个分支做一些工作\n4. 切换回来并恢复储藏的更改',
        initialState: {
            repository: {
                files: {
                    'README.md': '# Git Adventure',
                    'file1.txt': 'Content 1'
                },
                commits: [{
                    id: 'initial-commit',
                    message: '初始提交',
                    changes: {
                        'README.md': '# Git Adventure',
                        'file1.txt': 'Content 1'
                    },
                    timestamp: new Date().toISOString()
                }],
                currentBranch: 'master',
                branches: ['master', 'feature'],
                stash: [],
                stagedChanges: {},
                untrackedFiles: {},
                status: {}
            }
        },
        completionCondition: (state) => {
            return state.repository.stash && state.repository.stash.length === 0;
        }
    },
    {
        id: 16,
        title: '交互式变基 - git rebase -i',
        description: '学习如何使用交互式变基编辑提交历史。\n\n任务：\n1. 创建几个连续的提交\n2. 使用git rebase -i合并或修改这些提交\n3. 查看修改后的提交历史',
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
    },
    {
        id: 17,
        title: '查看提交详情 - git show',
        description: '学习如何查看特定提交的详细信息。\n\n任务：\n1. 创建几个不同的提交\n2. 使用git log找到一个提交ID\n3. 使用git show查看该提交的详细信息\n4. 分析提交中修改的文件内容',
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
    },
    {
        id: 18,
        title: '移动和删除文件 - git mv/rm',
        description: '学习如何使用Git命令移动和删除文件。\n\n任务：\n1. 创建一些文件并提交\n2. 使用git mv重命名一个文件\n3. 使用git rm删除一个文件\n4. 提交这些更改',
        initialState: {
            repository: {
                files: {
                    'oldname.txt': 'Content to be renamed',
                    'todelete.txt': 'Content to be deleted'
                },
                commits: [{
                    id: 'initial-commit',
                    message: '添加测试文件',
                    changes: {
                        'oldname.txt': 'Content to be renamed',
                        'todelete.txt': 'Content to be deleted'
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
        id: 19,
        title: '查找贡献者 - git blame',
        description: '学习如何使用git blame查找每行代码的最后修改者。\n\n任务：\n1. 创建一个包含多行内容的文件\n2. 多次修改该文件，模拟多人协作\n3. 使用git blame查看每行的最后修改信息',
        initialState: {
            repository: {
                files: {
                    'collaboration.txt': 'Line 1\nLine 2\nLine 3'
                },
                commits: [{
                    id: 'initial-commit',
                    message: '添加协作文件',
                    changes: {
                        'collaboration.txt': 'Line 1\nLine 2\nLine 3'
                    },
                    timestamp: new Date().toISOString(),
                    author: 'User1'
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
    },
    {
        id: 20,
        title: 'Git工作流综合练习',
        description: '这是一个综合关卡，测试你对Git工作流程的理解。\n\n任务：\n1. 初始化仓库并创建初始文件\n2. 创建feature分支开发新功能\n3. 切换回master分支修复bug\n4. 合并feature分支，解决可能的冲突\n5. 为发布创建标签\n6. 清理不需要的分支',
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
            return state.repository.commits.length >= 5 &&
                   state.repository.branches.length === 1 &&
                   state.repository.tags && state.repository.tags.length > 0;
        }
    }
];

// 导出所有关卡
const allLevels = [...additionalLevels, ...levelTemplates];