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
  Vibration,
  LayoutAnimation, // 1. 引入布局动画
  UIManager,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
// 引入存储工具
import { getAccounts, deleteAccount, Account } from '../../utils/storage';

// 开启 Android 的 LayoutAnimation 支持
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getAccounts();
    data.sort((a, b) => a.siteName.localeCompare(b.siteName));
    setAccounts(data);
  };

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
            loadData();
          }
        }
      ]
    );
  };

  // 跳转编辑页面
  const handleEdit = (item: Account) => {
    router.push({
      pathname: '/add-account',
      params: {
        id: item.id,
        siteName: item.siteName,
        username: item.username,
        password: item.password
      }
    });
  };

  // --- 搜索逻辑 ---
  const filteredAccounts = accounts.filter(item =>
    item.siteName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const startSearch = () => setIsSearchActive(true);

  const stopSearch = () => {
    setIsSearchActive(false);
    setSearchText('');
  };

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

      {/* --- 顶部 Header --- */}
      <View style={styles.headerWrapper}>
        {!isSearchActive ? (
          <View style={styles.normalHeader}>
            <TouchableOpacity onPress={() => router.push('/menu')} style={styles.headerIconButton}>
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>密码管理</Text>
            <TouchableOpacity onPress={startSearch} style={styles.headerIconButton}>
              <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={stopSearch} style={styles.headerIconButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索..."
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
          renderItem={({ item }) => (
            <AccountCard
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
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

      <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- 改造后的 AccountCard 组件 ---
const AccountCard = ({
  item,
  onDelete,
  onEdit
}: {
  item: Account,
  onDelete: (id: string) => void,
  onEdit: (item: Account) => void
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPassCopied, setIsPassCopied] = useState(false);
  const [isUserCopied, setIsUserCopied] = useState(false);

  // 新增：展开状态
  const [expanded, setExpanded] = useState(false);

  // 切换展开/折叠
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 动画效果
    setExpanded(!expanded);
  };

  const copyPassword = async () => {
    await Clipboard.setStringAsync(item.password);
    Vibration.vibrate(50);
    setIsPassCopied(true);
    setTimeout(() => setIsPassCopied(false), 1500);
  };

  const copyUsername = async () => {
    await Clipboard.setStringAsync(item.username);
    Vibration.vibrate(50);
    setIsUserCopied(true);
    setTimeout(() => setIsUserCopied(false), 1500);
  };

  return (
    // 使用 TouchableOpacity 包裹整个卡片，实现点击展开
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={toggleExpand}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.siteName}>{item.siteName}</Text>

          {/* 用户名区域 - 注意：这里需要阻止事件冒泡，否则点复制也会触发折叠 */}
          <TouchableOpacity
            style={styles.usernameRow}
            onPress={copyUsername}
            activeOpacity={0.6}
          >
            <Text style={styles.username}>{item.username}</Text>
            <Ionicons
              name={isUserCopied ? "checkmark-circle" : "copy-outline"}
              size={14}
              color={isUserCopied ? "#10b981" : "#999"}
              style={styles.usernameCopyIcon}
            />
            {isUserCopied && <Text style={styles.copiedTip}>已复制</Text>}
          </TouchableOpacity>
        </View>

        {/* 右侧指示箭头 */}
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#ddd"
          style={{ marginLeft: 8 }}
        />
      </View>

      <View style={styles.divider} />

      {/* 密码行 */}
      <View style={styles.passwordRow}>
        <Text style={styles.passwordLabel}>密码：</Text>
        <Text style={styles.passwordText}>
          {showPassword ? item.password : '••••••••••••'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.actionBtn}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity onPress={copyPassword} style={styles.actionBtn}>
            <Ionicons
              name={isPassCopied ? "checkmark-circle" : "copy-outline"}
              size={22}
              color={isPassCopied ? "#10b981" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 展开的编辑区域 --- */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#4f46e5" style={{ marginRight: 8 }} />
            <Text style={styles.editButtonText}>编辑账号信息</Text>
          </TouchableOpacity>
        </View>
      )}

    </TouchableOpacity>
  );
};

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
    fontFamily: 'Inter-Regular',
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

  // --- 新增样式 ---
  expandedContent: {
    // 展开区域不设高度，由内容撑开
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff', // 浅紫色背景
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  editButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 15,
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