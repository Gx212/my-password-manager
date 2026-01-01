import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Platform,
  LayoutAnimation, // 可选：用于简单的布局动画
  UIManager
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// 引入打印和分享库
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// 引入数据读取
import { getAccounts } from '../utils/storage';

// 开启 Android 的 LayoutAnimation 支持
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MenuScreen() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  // --- 新增状态：控制“关于”折叠/展开 ---
  const [showAbout, setShowAbout] = useState(false);

  // 切换关于显示
  const toggleAbout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 添加平滑动画
    setShowAbout(!showAbout);
  };

  // --- 核心逻辑：生成 PDF ---
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const accounts = await getAccounts();
      if (accounts.length === 0) {
        Alert.alert('提示', '没有数据可导出');
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; color: #333; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .warning { color: red; text-align: center; font-size: 12px; margin-top: 5px; }
            </style>
          </head>
          <body>
            <h1>密码管理器 - 账号导出</h1>
            <p class="warning">⚠️ 警告：此文件包含明文密码，请妥善保管！</p>
            <table>
              <thead>
                <tr>
                  <th>网站/应用</th>
                  <th>用户名</th>
                  <th>密码</th>
                </tr>
              </thead>
              <tbody>
                ${accounts.map(item => `
                  <tr>
                    <td>${item.siteName}</td>
                    <td>${item.username}</td>
                    <td>${item.password}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      // 修正了之前的类型错误，使用正确的 iOS 标识符
      await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });

    } catch (error) {
      console.error(error);
      Alert.alert('错误', '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const closeMenu = () => {
    router.back();
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={closeMenu} />

      <View style={styles.drawer}>
        <SafeAreaView style={styles.safeArea}>
          {/* 菜单头部 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>菜单</Text>
            <TouchableOpacity onPress={closeMenu}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 菜单项列表 */}
          <View style={styles.menuItems}>

            {/* 1. 导出 PDF 按钮 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExportPDF}
              disabled={isExporting}
            >
              <View style={styles.iconBox}>
                {isExporting ? (
                  <ActivityIndicator color="#4f46e5" size="small" />
                ) : (
                  <Ionicons name="document-text-outline" size={24} color="#4f46e5" />
                )}
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>导出账号数据 (PDF)</Text>
                <Text style={styles.menuSubText}>生成包含所有密码的表格文件</Text>
              </View>
            </TouchableOpacity>

            {/* 2. 新增：关于 (点击展开) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleAbout}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <Ionicons name="information-circle-outline" size={24} color="#4f46e5" />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>关于软件</Text>
                <Text style={styles.menuSubText}>版本信息与版权声明</Text>
              </View>

              {/* 右侧箭头，根据展开状态改变方向 */}
              <Ionicons
                name={showAbout ? "chevron-up" : "chevron-down"}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>

            {/* --- 展开的详细内容区域 --- */}
            {showAbout && (
              <View style={styles.aboutContent}>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>软件版本</Text>
                  <Text style={styles.aboutValue}>v1.0.0</Text>
                </View>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>更新时间</Text>
                  <Text style={styles.aboutValue}>2026-01-01</Text>
                </View>
                <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.aboutLabel}>版权所有</Text>
                  <Text style={styles.aboutValue}>© 2026 Sanjingguo</Text>
                </View>
                <Text style={styles.aboutFooter}>
                  本软件用于简单管理你的账号和密码。
                </Text>
              </View>
            )}

          </View>

          {/* 底部保留简洁的版本号或者移除 */}
          {!showAbout && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.2</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '80%', //稍微加宽一点，让显示内容更从容
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  menuItems: {
    padding: 20,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1, // 加个淡分割线，让每个选项更分明
    borderBottomColor: '#f9f9f9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  // 新增：文字容器占满剩余空间，把箭头挤到右边
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // --- 关于内容样式 ---
  aboutContent: {
    backgroundColor: '#f9fafb', // 浅灰色背景
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  aboutFooter: {
    marginTop: 12,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#ccc',
    fontSize: 14,
  },
});