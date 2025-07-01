
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TreePine, Settings as SettingsIcon, Moon, Sun, Globe, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [theme, setTheme] = useState<string>("light");
  const [language, setLanguage] = useState<string>("zh");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isAdmin, refreshProfile } = useUser();

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("app-theme") || "light";
    const savedLanguage = localStorage.getItem("app-language") || "zh";
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    
    // Apply theme to document
    applyTheme(savedTheme);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Settings - Current user:', user?.id);
    console.log('Settings - Current profile:', profile);
    console.log('Settings - Is admin:', isAdmin);
  }, [user, profile, isAdmin]);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    applyTheme(newTheme);
    
    toast({
      title: "主题已更新",
      description: `已切换到${newTheme === "dark" ? "深色" : "浅色"}模式`
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem("app-language", newLanguage);
    
    toast({
      title: "语言设置已保存",
      description: `已设置为${newLanguage === "zh" ? "中文" : "English"}`
    });
  };

  const handleRoleChange = async (newRole: 'USER' | 'ADMIN') => {
    if (!user || !profile) {
      console.log('No user or profile found, cannot change role');
      return;
    }

    if (profile.role === newRole) {
      console.log('Role is already', newRole, 'no change needed');
      return;
    }

    setIsUpdatingRole(true);
    console.log('Attempting to change role from', profile.role, 'to', newRole, 'for user', user.id);

    try {
      console.log('Updating role in database...');
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id)
        .select();

      console.log('Update result:', { data: updateData, error: updateError });

      if (updateError) {
        console.error('Database update error:', updateError);
        toast({
          title: "权限更新失败",
          description: `数据库错误: ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.error('No data returned from update');
        toast({
          title: "权限更新失败",
          description: "数据库更新未返回数据",
          variant: "destructive"
        });
        return;
      }

      console.log('Database update successful, refreshing profile...');
      
      // 刷新用户配置文件
      await refreshProfile();
      
      console.log('Profile refresh completed');
      
      toast({
        title: "权限更新成功",
        description: `已切换到${newRole === 'ADMIN' ? '管理员' : '普通用户'}权限`
      });

    } catch (error) {
      console.error('Role change error:', error);
      toast({
        title: "权限更新失败",
        description: "发生未知错误",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const resetSettings = () => {
    localStorage.removeItem("app-theme");
    localStorage.removeItem("app-language");
    setTheme("light");
    setLanguage("zh");
    applyTheme("light");
    
    toast({
      title: "设置已重置",
      description: "所有设置已恢复为默认值"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">赛博族谱</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                仪表板
              </Button>
              <Button variant="ghost" onClick={() => navigate("/branches")}>
                家族分支
              </Button>
              <Button variant="ghost" onClick={() => navigate("/tree")}>
                族谱图
              </Button>
              <Button variant="ghost" onClick={() => navigate("/stats")}>
                统计分析
              </Button>
              <Button variant="ghost" onClick={() => navigate("/relationships")}>
                关系管理
              </Button>
              <Button variant="ghost" onClick={() => navigate("/events")}>
                事件管理
              </Button>
              {isAdmin && (
                <Button variant="ghost" onClick={() => navigate("/admin/users")}>
                  <Shield className="h-4 w-4 mr-2" />
                  管理面板
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">系统设置</h1>
          <p className="text-gray-600 dark:text-gray-300">个性化您的族谱管理体验</p>
        </div>

        {/* Debug信息 */}
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">调试信息</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <p>用户ID: {user?.id}</p>
            <p>当前角色: {profile?.role || '未获取'}</p>
            <p>是否管理员: {isAdmin ? '是' : '否'}</p>
            <p>Profile更新时间: {profile?.updated_at}</p>
            <p>更新状态: {isUpdatingRole ? '更新中...' : '空闲'}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 用户权限设置 */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Shield className="h-5 w-5" />
                <span>用户权限</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  当前权限级别
                </label>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant={isAdmin ? 'destructive' : 'default'} className="text-sm">
                    {isAdmin ? '管理员' : '普通用户'}
                  </Badge>
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-red-500" />
                  ) : (
                    <User className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                
                <Select 
                  value={profile?.role || 'USER'} 
                  onValueChange={(value: 'USER' | 'ADMIN') => handleRoleChange(value)}
                  disabled={isUpdatingRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择权限级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                  </SelectContent>
                </Select>
                
                {isUpdatingRole && (
                  <p className="text-sm text-blue-600 mt-2">正在更新权限...</p>
                )}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p><strong>普通用户:</strong> 只能查看族谱信息，无法修改数据</p>
                <p><strong>管理员:</strong> 可以添加、修改、删除族谱数据，管理其他用户</p>
              </div>
            </CardContent>
          </Card>

          {/* 主题设置 */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>主题设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择主题
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className="flex items-center space-x-2 justify-start h-12"
                  >
                    <Sun className="h-4 w-4" />
                    <span>浅色模式</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className="flex items-center space-x-2 justify-start h-12"
                  >
                    <Moon className="h-4 w-4" />
                    <span>深色模式</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                选择您喜欢的界面主题，设置会自动保存到您的浏览器中。
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Globe className="h-5 w-5" />
                <span>语言设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择语言
                </label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                选择您偏好的界面语言。注意：当前版本仅为演示，实际翻译功能尚未实现。
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <SettingsIcon className="h-5 w-5" />
                <span>系统信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">当前主题:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {theme === "dark" ? "深色模式" : "浅色模式"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">当前语言:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === "zh" ? "中文" : "English"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">用户权限:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isAdmin ? "管理员" : "普通用户"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">用户ID:</span>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {user?.id?.substring(0, 8)}...
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={resetSettings}
                className="w-full"
              >
                重置所有设置
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
