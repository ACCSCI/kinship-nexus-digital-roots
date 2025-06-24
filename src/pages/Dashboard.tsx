import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Calendar, Settings, BarChart } from "lucide-react";
import AddMemberDialog from "@/components/AddMemberDialog";
import { GlobalHeader } from "@/components/GlobalHeader";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";

interface Individual {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 添加性别判断辅助函数
  const isMale = (gender: string) => gender === 'male' || gender === '男';
  const isFemale = (gender: string) => gender === 'female' || gender === '女';

  useEffect(() => {
    fetchIndividuals();
    
    // Log user visit to dashboard
    logAuditEvent(AUDIT_ACTIONS.USER_LOGIN, { 
      page: 'dashboard',
      timestamp: new Date().toISOString()
    });
  }, []);

  const fetchIndividuals = async () => {
    try {
      console.log('仪表盘：开始获取个人数据...');
      setLoading(true);
      
      console.log('查询 Individual 表...');
      const { data: individualData, error: individualError } = await supabase
        .from("Individual")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('Individual表查询结果:', { data: individualData, error: individualError });

      if (individualError) {
        console.error('仪表盘：数据库查询错误:', individualError);
        toast({
          title: "获取数据失败",
          description: `数据库错误: ${individualError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('仪表盘：成功获取数据，条数:', individualData?.length || 0);
        console.log('仪表盘：数据详情:', individualData);
        setIndividuals(individualData || []);
        
        if (!individualData || individualData.length === 0) {
          console.warn('仪表盘：数据库中没有找到任何记录');
          toast({
            title: "暂无数据",
            description: "数据库中暂无家族成员记录，请先添加成员",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('仪表盘：获取数据时发生异常:', error);
      toast({
        title: "获取数据失败",
        description: "发生未知错误，请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = () => {
    fetchIndividuals();
    setShowAddDialog(false);
    
    // Audit logging is handled in the AddMemberDialog component
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <GlobalHeader onRefresh={fetchIndividuals} showRefresh={true} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GlobalHeader onRefresh={fetchIndividuals} showRefresh={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">家族仪表板</h1>
              <p className="text-gray-600">管理和查看您的家族信息</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加成员
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">数据调试信息:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>总成员数: {individuals.length}</p>
            <p>男性成员数: {individuals.filter(p => isMale(p.gender)).length}</p>
            <p>女性成员数: {individuals.filter(p => isFemale(p.gender)).length}</p>
            <p>数据加载状态: {loading ? '加载中' : '已完成'}</p>
            <p>最近一次查询时间: {new Date().toLocaleString()}</p>
            <div className="mt-2">
              <p className="font-medium">性别分布详情:</p>
              {individuals.slice(0, 5).map(person => (
                <p key={person.id} className="ml-2">
                  {person.full_name}: "{person.gender}" ({isMale(person.gender) ? '识别为男性' : isFemale(person.gender) ? '识别为女性' : '未识别'})
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总成员数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individuals.length}</div>
              <p className="text-xs text-muted-foreground">
                记录在册的家族成员
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">在世成员</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.filter(p => !p.death_date).length}
              </div>
              <p className="text-xs text-muted-foreground">
                目前仍在世的成员
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最新添加</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.length > 0 ? new Date(individuals[0].created_at).toLocaleDateString() : '无'}
              </div>
              <p className="text-xs text-muted-foreground">
                最近添加成员的日期
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">数据完整性</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.length > 0 ? Math.round((individuals.filter(p => p.birth_date && p.full_name).length / individuals.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                信息完整度评分
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>最近添加的成员</CardTitle>
              <CardDescription>查看最新录入的家族成员信息</CardDescription>
            </CardHeader>
            <CardContent>
              {individuals.length > 0 ? (
                <div className="space-y-4">
                  {individuals.slice(0, 5).map((person) => (
                    <div key={person.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Avatar>
                        <AvatarFallback>
                          {person.full_name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{person.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {person.birth_date ? new Date(person.birth_date).toLocaleDateString() : '出生日期未知'}
                        </p>
                      </div>
                      <Badge variant={isMale(person.gender) ? 'default' : 'secondary'}>
                        {person.gender}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/member/${person.id}`)}
                      >
                        查看详情
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无家族成员记录</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowAddDialog(true)}
                  >
                    添加第一个成员
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用功能快速入口</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/tree")}
              >
                <Users className="h-4 w-4 mr-2" />
                查看族谱图
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/stats")}
              >
                <BarChart className="h-4 w-4 mr-2" />
                统计分析
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/relationships")}
              >
                <Users className="h-4 w-4 mr-2" />
                关系管理
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/events")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                事件记录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddMemberDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleMemberAdded}
      />
    </div>
  );
};

export default Dashboard;
