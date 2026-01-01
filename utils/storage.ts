import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Account {
  id: string;
  siteName: string;
  username: string;
  password: string;
  icon: string;
}

const STORAGE_KEY = 'my_pass_manager_data';

// 获取所有账号
export const getAccounts = async (): Promise<Account[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('读取数据失败', e);
    return [];
  }
};

// 添加新账号
export const addAccount = async (newAccount: Account): Promise<void> => {
  try {
    const currentAccounts = await getAccounts();
    const updatedAccounts = [newAccount, ...currentAccounts];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.error('保存数据失败', e);
    throw e;
  }
};

// --- 新增：删除账号 ---
export const deleteAccount = async (id: string): Promise<void> => {
  try {
    // 1. 读取当前列表
    const currentAccounts = await getAccounts();
    // 2. 过滤掉要删除的那个 ID
    const updatedAccounts = currentAccounts.filter(account => account.id !== id);
    // 3. 将剩下的保存回去
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.error('删除数据失败', e);
    throw e;
  }
};