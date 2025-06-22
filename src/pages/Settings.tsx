
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { TreePine, Settings as SettingsIcon, Moon, Sun, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [theme, setTheme] = useState<string>("light");
  const [language, setLanguage] = useState<string>("zh");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("app-theme") || "light";
    const savedLanguage = localStorage.getItem("app-language") || "zh";
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    
    // Apply theme to document
    applyTheme(savedTheme);
  }, []);

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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">系统设置</h1>
          <p className="text-gray-600 dark:text-gray-300">个性化您的族谱管理体验</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          {/* 语言设置 */}
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

          {/* 系统信息 */}
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

          {/* 关于 */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">关于系统</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">系统名称:</span>
                  <p className="text-gray-600 dark:text-gray-400">赛博族谱管理系统</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">版本:</span>
                  <p className="text-gray-600 dark:text-gray-400">1.0.0</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">构建技术:</span>
                  <p className="text-gray-600 dark:text-gray-400">React + TypeScript + Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
