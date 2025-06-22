
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, LogOut, TreePine, Users, Calendar, BarChart, UserPlus, Link, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AddMemberDialog from "@/components/AddMemberDialog";
import EditMemberDialog from "@/components/EditMemberDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface Individual {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string;
  death_date?: string;
  birth_place: string;
  residence?: string;
  biography?: string;
  photo_path?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchIndividuals();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUser(user);
  };

  const fetchIndividuals = async () => {
    try {
      const { data, error } = await supabase
        .from("Individual")
        .select("*")
        .order("full_name");

      if (error) {
        toast({
          title: "获取数据失败",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setIndividuals(data || []);
      }
    } catch (error) {
      toast({
        title: "获取数据失败",
        description: "发生未知错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEdit = (individual: Individual) => {
    setSelectedIndividual(individual);
    setShowEditDialog(true);
  };

  const handleDelete = (individual: Individual) => {
    setSelectedIndividual(individual);
    setShowDeleteDialog(true);
  };

  const handleView = (individual: Individual) => {
    navigate(`/member/${individual.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">赛博族谱</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate("/branches")}>
                家族分支
              </Button>
              <Button variant="ghost" onClick={() => navigate("/tree")}>
                族谱图
              </Button>
              <Button variant="ghost" onClick={() => navigate("/stats")}>
                统计分析
              </Button>
              <Button
                onClick={() => {
                  supabase.auth.signOut();
                  navigate("/");
                }}
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到您的数字族谱
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            管理家族成员信息，探索家族关系，传承家族文化
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                家族成员总数
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individuals.length}</div>
              <p className="text-xs text-muted-foreground">
                已录入的家族成员
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                家族关系数量
              </CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                已建立的关系连接
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                在世成员
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.filter(person => !person.death_date).length}
              </div>
              <p className="text-xs text-muted-foreground">
                当前健在的家族成员
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快速访问功能 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate("/branches")}>
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>家族分支浏览器</CardTitle>
              <CardDescription>
                按姓氏浏览家族成员，查看各个分支的详细信息
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/tree")}>
            <CardHeader>
              <TreePine className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>互动族谱图</CardTitle>
              <CardDescription>
                可视化的家族关系图，探索家族成员之间的关系网络
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/stats")}>
            <CardHeader>
              <BarChart className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>统计分析</CardTitle>
              <CardDescription>
                深入了解家族数据，查看各种统计图表和分析报告
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setShowAddDialog(true)}>
            <CardHeader>
              <UserPlus className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>添加家族成员</CardTitle>
              <CardDescription>
                录入新的家族成员信息，扩展您的族谱记录
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Link className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>建立关系</CardTitle>
              <CardDescription>
                为家族成员建立亲属关系，完善家族关系网
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-12 w-12 text-gray-600 mb-4" />
              <CardTitle>系统设置</CardTitle>
              <CardDescription>
                管理系统设置，个性化您的族谱管理体验
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 最近添加的成员 */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>最近添加的成员</CardTitle>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="ml-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              添加成员
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead>出生日期</TableHead>
                  <TableHead>出生地</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individuals.map((individual) => (
                  <TableRow key={individual.id}>
                    <TableCell className="font-medium">
                      {individual.full_name}
                    </TableCell>
                    <TableCell>{individual.gender}</TableCell>
                    <TableCell>{formatDate(individual.birth_date)}</TableCell>
                    <TableCell>{individual.birth_place}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(individual)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(individual)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(individual)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* 对话框 */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchIndividuals}
      />

      <EditMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        individual={selectedIndividual}
        onSuccess={fetchIndividuals}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        individual={selectedIndividual}
        onSuccess={fetchIndividuals}
      />
    </div>
  );
};

export default Dashboard;
