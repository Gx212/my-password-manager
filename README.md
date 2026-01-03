# 🔐 MyPasswordManager - 本地密码管理器

[![Expo](https://img.shields.io/badge/Expo-Go-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.7x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

一个基于 **React Native (Expo)** 开发的轻量级、离线优先的密码管理应用。专注于简洁的用户体验和数据隐私，所有数据仅存储在本地设备中。

## ✨ 核心功能 (Features)

### 🏠 账号管理 (Home)

* **增删查改**：轻松添加、查看、修改和删除账号信息。
* **智能排序**：列表自动按网站名称 A-Z (支持中文拼音) 排序，查找更快捷。
* **即时搜索**：支持通过网站名或用户名快速过滤账号。
* **极速复制**：点击用户名或密码即可复制到剪贴板。
  * *交互优化*：复制成功后提供震动反馈 (Haptic Feedback) 及图标变绿的视觉确认，无打扰式弹窗。
* **隐私保护**：密码默认隐藏，点击“小眼睛”图标查看明文。
* **手风琴卡片样式**：编辑按钮折叠在卡片中，美化UI。

### 🛠️ 工具箱 (Tools)

* **强密码生成器**：
  * 自定义长度 (6-32位)。
  * 自定义字符组合 (大写、小写、数字、特殊符号)。
  * 一键生成并复制，支持震动反馈。

### 📂 数据导出与菜单

* **侧边栏菜单**：优雅的透明模态侧滑菜单，集成高级功能入口。
* **PDF 导出**：支持将所有账号数据生成为格式整齐的 PDF 表格。
  * 调用系统原生分享 (Share Sheet)，支持保存到文件或发送至微信/QQ。
* **关于页面**：折叠式关于信息，展示版本与版权。
* **备份数据和恢复数据**：以JSON格式保存有数账号数据，同时支持导入规定格式JSON文件以恢复数据（目前仅直接覆盖）。

---

## 📱 界面预览 (Screenshots)

|                           主页列表                           |                           添加账号                           |                            工具箱                            |                          侧边栏菜单                          |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="D:\Documents\QQ Files\Tencent Files\3052007158\nt_qq\nt_data\Pic\2026-01\Ori\7f773449996c146cd598f2e5f7663182.jpeg" alt="7f773449996c146cd598f2e5f7663182" style="zoom:80%;" /> | <img src="D:\Documents\QQ Files\Tencent Files\3052007158\nt_qq\nt_data\Pic\2026-01\Ori\39e39bc911751ba71d749f367f3d0e94.jpg" alt="39e39bc911751ba71d749f367f3d0e94" style="zoom:80%;" /> | <img src="D:\Documents\QQ Files\Tencent Files\3052007158\nt_qq\nt_data\Pic\2026-01\Ori\021b0aeef6f570e494774687b6ccd94c.jpg" alt="021b0aeef6f570e494774687b6ccd94c" style="zoom:80%;" /> | <img src="D:\Documents\QQ Files\Tencent Files\3052007158\nt_qq\nt_data\Pic\2026-01\Ori\c18a6c1f096f40220a863fd14e81d86d.jpg" alt="c18a6c1f096f40220a863fd14e81d86d" style="zoom:80%;" /> |

---

## 🛠 技术栈 (Tech Stack)

| 类别        | 技术/库                       | 说明                           |
| :---------- | :---------------------------- | :----------------------------- |
| **框架**    | React Native / Expo SDK 50+   | 跨平台开发框架                 |
| **路由**    | Expo Router (File-based)      | 基于文件系统的路由管理         |
| **语言**    | TypeScript                    | 提供严格的类型安全             |
| **存储**    | Async Storage                 | 本地持久化数据存储             |
| **UI 组件** | React Native Core Components  | View, Text, FlatList, Modal 等 |
| **图标**    | Ionicons (@expo/vector-icons) | 矢量图标库                     |
| **功能库**  | expo-clipboard                | 剪贴板操作                     |
| **功能库**  | expo-print & expo-sharing     | PDF 生成与文件分享             |
| **功能库**  | expo-haptics / Vibration      | 震动触觉反馈                   |

---

## 🚀 快速开始 (Getting Started)

### 1. 环境准备

确保你的电脑已安装 [Node.js](https://nodejs.org/) 和 git。

### 2. 克隆项目

```bash
git clone [https://github.com/your-username/my-password-manager.git](https://github.com/your-username/my-password-manager.git)
cd my-password-manager
```

### 3. 安装依赖

```bash
npm install
# 或者
npx expo install
```

### 4. 运行项目

```bash
npx expo start
```

* **Android**: 按 `a` 打开 Android 模拟器，或使用 Expo Go App 扫码。
* **iOS**: 按 `i` 打开 iOS 模拟器 (仅限 Mac)。

---

## 📦 打包与发布 (Build APK)

本项目使用 **EAS Build** 进行云端打包，可直接生成 Android 安装包 (.apk)。

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. 配置构建环境

项目已配置 `eas.json` 用于生成本地安装包 (APK) 而不是上传商店的 AAB。

```bash
# 执行云端构建 (Android APK)
eas build -p android --profile preview
```

> **提示**：如果在中国大陆网络环境下上传失败，请在终端设置代理（例如 `set HTTPS_PROXY=http://127.0.0.1:端口号`）。

### 3. 下载安装

构建完成后，终端会显示下载链接和二维码。下载 `.apk` 文件即可直接在 Android 手机上安装使用。

---

## 🔒 隐私与安全声明 (Privacy)

* **本地存储**：本应用是一个**离线应用**。所有账号数据仅存储在你手机的本地存储空间 (`AsyncStorage`) 中，**不会**上传到任何云端服务器。
* **数据导出**：使用 PDF 导出功能时，请注意生成的文件包含明文密码，请妥善保管导出后的文件。
* **卸载警告**：卸载 App 会清除所有存储的账号数据，请在卸载前进行备份（导出PDF或JSON）。

---

## 📄 许可证 (License)

MIT License © 2026 [Sanjingguo]

