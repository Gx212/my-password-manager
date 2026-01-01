import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Platform,
  Alert,
  ScrollView,
  Vibration, // 1. 引入震动
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function ToolsScreen() {
  // --- 状态管理 ---
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [useUpperCase, setUseUpperCase] = useState(true);
  const [useLowerCase, setUseLowerCase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);

  // 2. 新增：控制复制成功的反馈状态
  const [isCopied, setIsCopied] = useState(false);

  // --- 核心算法：生成密码 ---
  const generatePassword = () => {
    let charset = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (useUpperCase) charset += upper;
    if (useLowerCase) charset += lower;
    if (useNumbers) charset += numbers;
    if (useSymbols) charset += symbols;

    if (charset === '') {
      Alert.alert('提示', '请至少选择一种字符类型');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    setPassword(result);
    // 生成新密码时，重置复制状态
    setIsCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  // --- 3. 修改后的复制功能 ---
  const copyToClipboard = async () => {
    if (!password) return;

    await Clipboard.setStringAsync(password);

    // 震动反馈
    Vibration.vibrate(50);

    // 视觉反馈 (变绿)
    setIsCopied(true);

    // 1.5秒后恢复原状
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const changeLength = (delta: number) => {
    const newLength = length + delta;
    if (newLength >= 6 && newLength <= 32) {
      setLength(newLength);
      // 长度改变时，建议自动重新生成，或者让用户手动点。这里逻辑保持不变，只改长度。
      // 但为了体验，通常改长度后重置复制状态
      setIsCopied(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>工具箱</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >

        {/* --- 结果展示卡片 --- */}
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>生成的强密码</Text>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordText}>{password}</Text>
          </View>

          {/* --- 4. 动态变化的复制按钮 --- */}
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
            activeOpacity={0.6}
          >
            <Ionicons
              name={isCopied ? "checkmark-circle" : "copy-outline"}
              size={20}
              // 成功变绿 (#10b981)，默认紫色 (#4f46e5)
              color={isCopied ? "#10b981" : "#4f46e5"}
            />
            <Text style={[
              styles.copyText,
              // 文字颜色也跟着变
              isCopied && { color: '#10b981' }
            ]}>
              {isCopied ? "密码已复制" : "复制密码"}
            </Text>
          </TouchableOpacity>

        </View>

        {/* --- 参数设置区域 --- */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>密码设置</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>密码长度</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                onPress={() => changeLength(-1)}
                style={styles.counterBtn}
              >
                <Ionicons name="remove" size={24} color="#4f46e5" />
              </TouchableOpacity>

              <Text style={styles.lengthValue}>{length}</Text>

              <TouchableOpacity
                onPress={() => changeLength(1)}
                style={styles.counterBtn}
              >
                <Ionicons name="add" size={24} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>

          <OptionRow
            label="包含大写字母 (A-Z)"
            value={useUpperCase}
            onValueChange={setUseUpperCase}
          />
          <OptionRow
            label="包含小写字母 (a-z)"
            value={useLowerCase}
            onValueChange={setUseLowerCase}
          />
          <OptionRow
            label="包含数字 (0-9)"
            value={useNumbers}
            onValueChange={setUseNumbers}
          />
          <OptionRow
            label="包含特殊符号 (!@#...)"
            value={useSymbols}
            onValueChange={setUseSymbols}
          />
        </View>

        {/* --- 生成按钮 --- */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => {
            generatePassword();
            // 点击生成时，震动一下，增加手感
            Vibration.vibrate(10);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.generateButtonText}>重新生成</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const OptionRow = ({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (v: boolean) => void }) => (
  <View style={styles.optionRow}>
    <Text style={styles.optionLabel}>{label}</Text>
    <Switch
      trackColor={{ false: '#e0e0e0', true: '#a5b4fc' }}
      thumbColor={value ? '#4f46e5' : '#f4f3f4'}
      ios_backgroundColor="#e0e0e0"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    backgroundColor: '#fff',
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  passwordContainer: {
    backgroundColor: '#f5f7ff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    // 增加一点点击区域
    paddingHorizontal: 16,
  },
  copyText: {
    color: '#4f46e5',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  counterBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lengthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionLabel: {
    fontSize: 16,
    color: '#555',
  },
  generateButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});