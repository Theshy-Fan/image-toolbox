#!/bin/bash

# ImageToolbox 代码推送脚本
# 用法: ./push.sh "提交信息"

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}错误: 当前目录不是 Git 仓库${NC}"
  exit 1
fi

# 获取提交信息
if [ -z "$1" ]; then
  echo -e "${YELLOW}请输入提交信息:${NC}"
  read -r COMMIT_MSG
  if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}错误: 提交信息不能为空${NC}"
    exit 1
  fi
else
  COMMIT_MSG="$1"
fi

# 显示当前状态
echo -e "\n${GREEN}=== ImageToolbox 代码推送 ===${NC}\n"
echo -e "${YELLOW}当前分支:${NC} $(git branch --show-current)"
echo -e "${YELLOW}提交信息:${NC} $COMMIT_MSG\n"

# 添加所有文件
echo -e "${GREEN}[1/3] 添加文件...${NC}"
git add -A

# 检查是否有更改
if git diff --cached --quiet; then
  echo -e "${YELLOW}没有需要提交的更改${NC}"
  exit 0
fi

# 显示更改文件
echo -e "\n${YELLOW}更改的文件:${NC}"
git diff --cached --name-only
echo ""

# 提交
echo -e "${GREEN}[2/3] 提交更改...${NC}"
git commit -m "$COMMIT_MSG"

# 推送
echo -e "\n${GREEN}[3/3] 推送到远程仓库...${NC}"
git push

echo -e "\n${GREEN}✓ 推送完成！${NC}"
