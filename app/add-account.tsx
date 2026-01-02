import React, { useState, useEffect } from 'react';
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
  Vibration,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// 引入 updateAccount
import { addAccount, updateAccount, Account } from '../utils/storage';

export default function AddAccountScreen() {
  const router = useRouter();
  // 1. 获取传入的参数
  const params = useLocalSearchParams();

  const [siteName, setSiteName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 判断是否为编辑模式
  const isEditMode = !!params.id;

  // 2. 初始化回显数据 (核心修复点)
  useEffect(() => {
    if (params.id) {
      setSiteName(params.siteName as string || '');
      setUsername(params.username as string || '');
      setPassword(params.password as string || '');
    }
    // 【重要修复】这里必须是空数组 []，否则每输入一个字都会重置回原值
  }, []);

  const handleSave = async () => {
    if (!siteName || !username || !password) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setIsSaving(true);

    try {
      const iconChar = siteName.trim().charAt(0).toUpperCase() || '?';

      if (isEditMode) {
        // --- A. 编辑模式：更新 ---
        const updatedAccount: Account = {
          id: params.id as string,
          siteName: siteName.trim(),
          username: username.trim(),
          password: password,
          icon: iconChar,
        };
        await updateAccount(updatedAccount);
      } else {
        // --- B. 添加模式：新增 ---
        const newAccount: Account = {
          id: Date.now().toString(),
          siteName: siteName.trim(),
          username: username.trim(),
          password: password,
          icon: iconChar,
        };
        await addAccount(newAccount);
      }

      // --- 成功反馈 ---
      Vibration.vibrate(50);
      setIsSuccess(true);

      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
      setIsSaving(false);
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
          <Text style={styles.title}>
            {isEditMode ? '编辑账号' : '添加新账号'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode ? '修改下方的账号详细信息' : '请填写下方的账号详细信息'}
          </Text>

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
                placeholder="输入密码"
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

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSuccess ? styles.successButton : (isSaving && { opacity: 0.7 })
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving || isSuccess}
          >
            {isSuccess ? (
              <View style={styles.buttonInner}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>
                  {isEditMode ? '已更新' : '已保存'}
                </Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isSaving ? '正在保存...' : (isEditMode ? '更新账号' : '保存账号')}
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
  input: {
    flex: 1, fontSize: 16, color: '#333', height: '100%',
  },

  saveButton: {
    backgroundColor: '#4f46e5',
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
  successButton: {
    backgroundColor: '#10b981',
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