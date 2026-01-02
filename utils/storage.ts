import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Account {
  id: string;
  siteName: string;
  username: string;
  password: string;
  icon: string;
}

const STORAGE_KEY = 'my_password_manager_data';

// 获取所有数据
export const getAccounts = async (): Promise<Account[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load accounts', e);
    return [];
  }
};

// 添加新账号
export const addAccount = async (newAccount: Account) => {
  try {
    const currentAccounts = await getAccounts();
    const updatedAccounts = [...currentAccounts, newAccount];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.error('Failed to save account', e);
    throw e;
  }
};

// 更新账号
export const updateAccount = async (updatedAccount: Account) => {
  try {
    const currentAccounts = await getAccounts();
    const newAccounts = currentAccounts.map(account =>
      account.id === updatedAccount.id ? updatedAccount : account
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
  } catch (e) {
    console.error('Failed to update account', e);
    throw e;
  }
};

// 删除账号
export const deleteAccount = async (id: string) => {
  try {
    const currentAccounts = await getAccounts();
    const updatedAccounts = currentAccounts.filter(account => account.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.error('Failed to delete account', e);
    throw e;
  }
};

// --- 新增：导出数据 (获取纯 JSON 字符串) ---
export const exportDataRaw = async (): Promise<string> => {
  const accounts = await getAccounts();
  const backupObject = {
    appName: "MyPasswordManager",
    version: "1.0",
    timestamp: Date.now(),
    data: accounts
  };
  return JSON.stringify(backupObject, null, 2); // 格式化美观一点
};

// --- 新增：导入数据 (覆盖模式) ---
export const importData = async (jsonString: string) => {
  try {
    // 1. 尝试解析 JSON
    const parsed = JSON.parse(jsonString);

    // 2. 格式校验 (简单的“鸭子类型”检查)
    // 必须包含 'data' 字段，且 'data' 必须是数组
    if (!parsed || !parsed.data || !Array.isArray(parsed.data)) {
      throw new Error("无效的备份文件格式");
    }

    // 3. 检查数组里的第一项是否长得像账号数据 (如果有数据的话)
    if (parsed.data.length > 0) {
      const firstItem = parsed.data[0];
      if (!firstItem.siteName || !firstItem.password) {
        throw new Error("文件内容不兼容：缺少必要字段");
      }
    }

    // 4. 覆盖写入
    // 注意：这里我们只取 'data' 里的数组存进去
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    return true;

  } catch (e) {
    console.error('Import failed', e);
    throw e; // 把错误抛出去给 UI 层处理
  }
};