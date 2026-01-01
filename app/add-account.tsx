import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Vibration, // 1. 引入震动
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// 引入存储工具
import { addAccount, Account } from '../utils/storage';

export default function AddAccountScreen() {
  const router = useRouter();

  const [siteName, setSiteName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 状态控制
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 2. 新增成功状态

  const handleSave = async () => {
    if (!siteName || !username || !password) {
      // 错误提示依然保留 Alert，引起注意
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setIsSaving(true);

    try {
      const newAccount: Account = {
        id: Date.now().toString(),
        siteName: siteName.trim(),
        username: username.trim(),
        password: password,
        icon: siteName.trim().charAt(0).toUpperCase() || '?',
      };

      await addAccount(newAccount);

      // --- 3. 成功后的反馈逻辑 ---

      // 震动反馈
      Vibration.vibrate(50);

      // 切换到“成功状态” (按钮变绿)
      setIsSuccess(true);

      // 1.5秒后自动返回上一页
      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
      setIsSaving(false); // 只有失败才需要重置 loading，成功了直接退出了
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>添加新账号</Text>
          <Text style={styles.subtitle}>请填写下方的账号详细信息</Text>

          {/* 网站名称 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>网站/应用名称</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="globe-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="例如：Google, 淘宝"
                value={siteName}
                onChangeText={setSiteName}
                // 如果正在保存或已成功，禁止编辑
                editable={!isSaving && !isSuccess}
              />
            </View>
          </View>

          {/* 用户名 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>用户名/账号</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="例如：user@example.com"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isSaving && !isSuccess}
              />
            </View>
          </View>

          {/* 密码 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>密码</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isSaving && !isSuccess}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- 4. 动态变化的保存按钮 --- */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              // 如果成功，背景变绿；如果正在保存(未成功)，透明度降低
              isSuccess ? styles.successButton : (isSaving && { opacity: 0.7 })
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving || isSuccess} // 防止重复点击
          >
            {isSuccess ? (
              // 成功状态：显示对勾图标和文字
              <View style={styles.buttonInner}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>已保存</Text>
              </View>
            ) : (
              // 正常/加载状态
              <Text style={styles.saveButtonText}>
                {isSaving ? '正在保存...' : '保存账号'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isSaving || isSuccess}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  formContainer: { padding: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 32 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee', paddingHorizontal: 12, height: 56 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

  saveButton: {
    backgroundColor: '#4f46e5', // 默认紫色
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  // 新增：成功状态的绿色按钮样式
  successButton: {
    backgroundColor: '#10b981', // 漂亮的绿色
    shadowColor: '#10b981',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  cancelButtonText: { color: '#666', fontSize: 16 },
});