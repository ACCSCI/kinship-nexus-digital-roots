
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, LogOut, TreePine } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">赛博族谱</h1>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">家族成员管理</h1>
            <p className="text-gray-600 mt-2">管理您的家族成员信息和关系</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加新成员
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总成员数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individuals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">男性成员</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.filter(i => i.gender === '男').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">女性成员</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {individuals.filter(i => i.gender === '女').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 成员列表 */}
        <Card>
          <CardHeader>
            <CardTitle>家族成员列表</CardTitle>
          </CardHeader>
          <CardContent>
            {individuals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">还没有添加任何家族成员</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个成员
                </Button>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

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
