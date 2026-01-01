import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
  Vibration, // 1. 引入震动组件
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
// 引入存储工具和类型
import { getAccounts, deleteAccount, Account } from '../../utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // 每次页面重新获得焦点时，刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getAccounts();
    // 按网站名称排序 (支持中文拼音和英文)
    data.sort((a, b) => a.siteName.localeCompare(b.siteName));
    setAccounts(data);
  };

  // 处理删除逻辑
  const handleDelete = (id: string) => {
    Alert.alert(
      "确认删除",
      "您确定要删除这个账号吗？此操作无法撤销。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            await deleteAccount(id);
            loadData(); // 删除后刷新列表
          }
        }
      ]
    );
  };

  // 搜索过滤
  const filteredAccounts = accounts.filter(item =>
    item.siteName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const startSearch = () => setIsSearchActive(true);

  const stopSearch = () => {
    setIsSearchActive(false);
    setSearchText('');
  };

  // 安卓物理返回键监听
  useEffect(() => {
    const backAction = () => {
      if (isSearchActive) {
        stopSearch();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isSearchActive]);

  const handleAddPress = () => {
    router.push('/add-account');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- 顶部导航栏 (Header) --- */}
      <View style={styles.headerWrapper}>
        {!isSearchActive ? (
          // --- 状态 A: 正常模式 ---
          <View style={styles.normalHeader}>
            <TouchableOpacity
              onPress={() => router.push('/menu')}
              style={styles.headerIconButton}
            >
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>密码管理</Text>

            <TouchableOpacity onPress={startSearch} style={styles.headerIconButton}>
              <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        ) : (
          // --- 状态 B: 搜索模式 ---
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={stopSearch} style={styles.headerIconButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="search..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.headerIconButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* --- 列表区域 --- */}
      <View style={styles.contentContainer}>
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <AccountCard item={item} onDelete={handleDelete} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {accounts.length === 0 && searchText === '' ? (
                <>
                  <Ionicons name="folder-open-outline" size={64} color="#ddd" />
                  <Text style={styles.emptyText}>还没有账号，点击右下角添加</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search-outline" size={64} color="#ddd" />
                  <Text style={styles.emptyText}>没有找到相关账号</Text>
                </>
              )}
            </View>
          }
        />
      </View>

      {/* --- 悬浮添加按钮 (FAB) --- */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- 子组件：AccountCard ---
const AccountCard = ({ item, onDelete }: { item: Account, onDelete: (id: string) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  // 2. 新增状态：控制复制成功的视觉反馈
  const [isPassCopied, setIsPassCopied] = useState(false);
  const [isUserCopied, setIsUserCopied] = useState(false);

  // 复制密码逻辑 (无弹窗，仅图标变化+震动)
  const copyPassword = async () => {
    await Clipboard.setStringAsync(item.password);
    // 震动 50毫秒
    Vibration.vibrate(50);
    // 切换图标状态
    setIsPassCopied(true);
    // 1.5秒后恢复
    setTimeout(() => setIsPassCopied(false), 1500);
  };

  // 复制用户名逻辑 (无弹窗，仅图标变化+震动)
  const copyUsername = async () => {
    await Clipboard.setStringAsync(item.username);
    Vibration.vibrate(50);
    setIsUserCopied(true);
    setTimeout(() => setIsUserCopied(false), 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.siteName}>{item.siteName}</Text>

          {/* 可点击的用户名行 */}
          <TouchableOpacity
            style={styles.usernameRow}
            onPress={copyUsername}
            activeOpacity={0.6}
          >
            <Text style={styles.username}>{item.username}</Text>
            {/* 动态切换图标：如果复制了显示绿色勾勾，否则显示灰色复制图标 */}
            <Ionicons
              name={isUserCopied ? "checkmark-circle" : "copy-outline"}
              size={14}
              color={isUserCopied ? "#10b981" : "#999"} // #10b981 是好看的绿色
              style={styles.usernameCopyIcon}
            />
            {/* 可选：加个小文字提示 */}
            {isUserCopied && <Text style={styles.copiedTip}>已复制</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.passwordRow}>
        <Text style={styles.passwordLabel}>密码：</Text>
        <Text style={styles.passwordText}>
          {showPassword ? item.password : '••••••••••••'}
        </Text>
        <View style={styles.actions}>
          {/* 切换显示密码 */}
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.actionBtn}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
          </TouchableOpacity>

          {/* 复制密码按钮 - 动态图标 */}
          <TouchableOpacity onPress={copyPassword} style={styles.actionBtn}>
            <Ionicons
              name={isPassCopied ? "checkmark-circle" : "copy-outline"}
              size={22}
              // 复制成功变绿，平时灰色
              color={isPassCopied ? "#10b981" : "#555"}
            />
          </TouchableOpacity>

          {/* 删除按钮 */}
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- 样式定义 ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerWrapper: {
    backgroundColor: '#fff',
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  normalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    marginRight: 10,
    height: '100%',
  },
  headerIconButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  cardInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  usernameCopyIcon: {
    marginLeft: 6,
  },
  copiedTip: {
    fontSize: 10,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordLabel: {
    fontSize: 14,
    color: '#888',
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});