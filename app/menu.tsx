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
  LayoutAnimation,
  UIManager,
  ScrollView,
  Linking, // 【新增】引入 Linking 用于打开外部链接
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- 引入文件操作相关库 ---
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';

import { getAccounts, exportDataRaw, importData } from '../utils/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MenuScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleAbout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAbout(!showAbout);
  };

  const closeMenu = () => router.back();

  // --- 新增：打开 GitHub 链接 ---
  const openGitHub = () => {
    Linking.openURL('https://github.com/Gx212/my-password-manager');
  };

  // 辅助函数：生成带时间的文件名
  const generateFileName = (extension: string) => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = (now.getMonth() + 1).toString().padStart(2, '0');
    const DD = now.getDate().toString().padStart(2, '0');
    const HH = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `密码备份_${YYYY}${MM}${DD}_${HH}${mm}.${extension}`;
  };

  // 导出 PDF
  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      const accounts = await getAccounts();
      if (accounts.length === 0) { Alert.alert('提示', '没有数据可导出'); return; }

      const htmlContent = `
        <html><head><style>body{font-family:'Helvetica';padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:12px;text-align:left}th{background:#f2f2f2}</style></head>
        <body><h1>密码管理器导出</h1><table><thead><tr><th>网站</th><th>用户名</th><th>密码</th></tr></thead>
        <tbody>${accounts.map(i => `<tr><td>${i.siteName}</td><td>${i.username}</td><td>${i.password}</td></tr>`).join('')}</tbody></table></body></html>`;

      const { uri: tmpUri } = await Print.printToFileAsync({ html: htmlContent });
      const fileName = generateFileName('pdf');
      const newUri = (FileSystem.cacheDirectory || "") + fileName;
      await FileSystem.moveAsync({ from: tmpUri, to: newUri });
      await Sharing.shareAsync(newUri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '导出 PDF 失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 备份数据 (JSON)
  const handleBackup = async () => {
    try {
      setIsLoading(true);
      const accounts = await getAccounts();
      if (accounts.length === 0) { Alert.alert('提示', '没有数据可备份'); return; }
      const jsonString = await exportDataRaw();
      const fileName = generateFileName('json');
      const fileUri = (FileSystem.cacheDirectory || "") + fileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      Alert.alert(
        "安全警告",
        "即将导出的备份文件包含【明文密码】。请务必妥善保管，切勿发送给不可信的人。",
        [
          { text: "取消", style: "cancel" },
          {
            text: "继续导出",
            onPress: async () => {
              await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: '备份密码数据' });
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 恢复数据
  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const fileUri = result.assets[0].uri;
      setIsLoading(true);
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      Alert.alert(
        "确认恢复备份？",
        "此操作将【清空并覆盖】当前 App 内的所有账号数据，且无法撤销！",
        [
          { text: "取消", style: "cancel" },
          {
            text: "确定覆盖",
            style: "destructive",
            onPress: async () => {
              try {
                await importData(fileContent);
                Alert.alert("成功", "数据已恢复，即将重启列表", [{ text: "好的", onPress: () => { router.dismissAll(); router.replace('/(tabs)'); } }]);
              } catch (importError) {
                Alert.alert("导入失败", "文件格式不正确或已损坏");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '读取文件失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={closeMenu} />
      <View style={styles.drawer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>菜单</Text>
            <TouchableOpacity onPress={closeMenu}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView contentContainerStyle={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handleExportPDF} disabled={isLoading}>
              <View style={styles.iconBox}><Ionicons name="document-text-outline" size={24} color="#4f46e5" /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>导出为 PDF 表格</Text>
                <Text style={styles.menuSubText}>可视化的打印格式</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleBackup} disabled={isLoading}>
              <View style={styles.iconBox}><Ionicons name="cloud-upload-outline" size={24} color="#0ea5e9" /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>备份数据 (JSON)</Text>
                <Text style={styles.menuSubText}>生成数据备份文件</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRestore} disabled={isLoading}>
              <View style={styles.iconBox}><Ionicons name="cloud-download-outline" size={24} color="#f59e0b" /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>恢复备份</Text>
                <Text style={styles.menuSubText}>从 JSON 文件导入数据</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={toggleAbout} activeOpacity={0.7}>
              <View style={styles.iconBox}><Ionicons name="information-circle-outline" size={24} color="#666" /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>关于软件</Text>
                <Text style={styles.menuSubText}>版本信息与版权声明</Text>
              </View>
              <Ionicons name={showAbout ? "chevron-up" : "chevron-down"} size={20} color="#ccc" />
            </TouchableOpacity>

            {showAbout && (
              <View style={styles.aboutContent}>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>软件版本</Text>
                  <Text style={styles.aboutValue}>v1.1.0</Text>
                </View>

                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>开发者</Text>
                  <Text style={styles.aboutValue}>MyPassword Team</Text>
                </View>

                {/* --- 新增：GitHub 地址 --- */}
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>GitHub</Text>
                  <TouchableOpacity onPress={openGitHub}>
                    <Text style={[styles.aboutValue, { color: '#4f46e5', textDecorationLine: 'underline' }]}>
                      Gx212/my-password-manager
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.logSection}>
                  <Text style={styles.logSectionTitle}>版本更新日志</Text>
                  <View style={styles.logItem}>
                    <Text style={styles.logVersion}>v1.1.0 (2026-01-02)</Text>
                    <Text style={styles.logDesc}>• 新增数据备份与恢复功能 (JSON)</Text>
                    <Text style={styles.logDesc}>• 导出文件名称增加时间戳</Text>
                    <Text style={styles.logDesc}>• 新增编辑功能，手风琴折叠卡片UI</Text>
                  </View>
                  <View style={styles.logItem}>
                    <Text style={styles.logVersion}>v1.0.0 (2026-01-01)</Text>
                    <Text style={styles.logDesc}>• 首次发布：账号管理、PDF导出</Text>
                    <Text style={styles.logDesc}>• 工具：强密码生成</Text>
                  </View>
                </View>
              </View>
            )}

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={{ marginTop: 10, color: '#666' }}>处理中...</Text>
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { width: '85%', height: '100%', backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, elevation: 5 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 20 },
  menuItems: { padding: 20, paddingBottom: 50 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTextContainer: { flex: 1 },
  menuText: { fontSize: 16, fontWeight: '600', color: '#333' },
  menuSubText: { fontSize: 12, color: '#999', marginTop: 2 },
  aboutContent: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 8 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' }, // 增加了 alignItems: center
  aboutLabel: { fontSize: 14, color: '#666' },
  aboutValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  logSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  logSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  logItem: { marginBottom: 12 },
  logVersion: { fontSize: 13, fontWeight: '600', color: '#4f46e5', marginBottom: 4 },
  logDesc: { fontSize: 12, color: '#666', lineHeight: 18, paddingLeft: 4 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 99 },
});