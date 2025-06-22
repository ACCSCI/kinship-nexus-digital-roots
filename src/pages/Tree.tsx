
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TreePine, Users, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Match the actual database schema
interface Individual {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string;
  birth_place: string;
  death_date: string | null;
  residence: string | null;
  biography: string | null;
  photo_path: string | null;
  created_at: string;
}

interface Relationship {
  id: number;
  person1_id: number;
  person2_id: number;
  type: string;
  created_at: string;
}

const Tree = () => {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedNodeData, setSelectedNodeData] = useState<Individual | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [familyNames, setFamilyNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (individuals.length > 0) {
      generateFamilyTree();
    }
  }, [individuals, relationships, familyFilter]);

  const fetchData = async () => {
    try {
      // Fetch individuals
      const { data: individualsData, error: individualsError } = await supabase
        .from("Individual")
        .select("*")
        .order("full_name");

      if (individualsError) {
        toast({
          title: "获取个人数据失败",
          description: individualsError.message,
          variant: "destructive"
        });
        return;
      }

      // Fetch relationships
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from("Relationship")
        .select("*");

      if (relationshipsError) {
        toast({
          title: "获取关系数据失败",
          description: relationshipsError.message,
          variant: "destructive"
        });
        return;
      }

      setIndividuals(individualsData || []);
      setRelationships(relationshipsData || []);

      // Extract unique family names
      const families = new Set<string>();
      individualsData?.forEach(person => {
        if (person.full_name) {
          const familyName = person.full_name.charAt(0);
          families.add(familyName);
        }
      });
      setFamilyNames(Array.from(families).sort());

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

  const generateFamilyTree = () => {
    // Filter individuals based on selected family
    const filteredIndividuals = familyFilter === "all" 
      ? individuals 
      : individuals.filter(person => person.full_name.startsWith(familyFilter));

    // Create nodes for filtered individuals
    const newNodes: Node[] = filteredIndividuals.map((person, index) => ({
      id: person.id.toString(),
      type: 'default',
      position: { 
        x: (index % 4) * 250, 
        y: Math.floor(index / 4) * 150 
      },
      data: { 
        label: (
          <div className="p-2 text-center">
            <div className="font-semibold">{person.full_name}</div>
            <div className="text-xs text-gray-500">{person.gender === 'male' ? '男' : '女'}</div>
            <div className="text-xs text-gray-400">
              {new Date(person.birth_date).getFullYear()}
              {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
            </div>
          </div>
        ),
        person: person
      },
      style: {
        background: person.gender === 'male' ? '#dbeafe' : '#fef3f2',
        border: '2px solid #cbd5e1',
        borderRadius: '8px',
        width: 180,
      }
    }));

    // Create edges for relationships between filtered individuals
    const filteredPersonIds = new Set(filteredIndividuals.map(p => p.id));
    const newEdges: Edge[] = relationships
      .filter(rel => 
        filteredPersonIds.has(rel.person1_id) && 
        filteredPersonIds.has(rel.person2_id)
      )
      .map(rel => ({
        id: `${rel.person1_id}-${rel.person2_id}`,
        source: rel.person1_id.toString(),
        target: rel.person2_id.toString(),
        label: rel.type === 'parent' ? '父母' : rel.type === 'spouse' ? '配偶' : rel.type,
        type: 'smoothstep',
        style: { 
          stroke: rel.type === 'parent' ? '#10b981' : '#f59e0b',
          strokeWidth: 2
        },
        labelStyle: { 
          fontSize: 12,
          fontWeight: 'bold'
        }
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data.person as Individual);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
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
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                仪表板
              </Button>
              <Button variant="ghost" onClick={() => navigate("/branches")}>
                家族分支
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
              <Button variant="ghost" onClick={() => navigate("/settings")}>
                设置
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左侧控制面板 */}
        <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">互动族谱图</h2>
            
            {/* 家族筛选 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                筛选家族
              </label>
              <Select value={familyFilter} onValueChange={setFamilyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择家族" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部家族</SelectItem>
                  {familyNames.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}氏家族
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 统计信息 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">当前显示</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>成员数量:</span>
                  <span>{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>关系连接:</span>
                  <span>{edges.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 选中节点详情 */}
          {selectedNodeData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">成员详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>姓名:</strong> {selectedNodeData.full_name}</div>
                  <div><strong>性别:</strong> {selectedNodeData.gender === 'male' ? '男' : '女'}</div>
                  <div><strong>出生日期:</strong> {new Date(selectedNodeData.birth_date).toLocaleDateString('zh-CN')}</div>
                  <div><strong>出生地:</strong> {selectedNodeData.birth_place}</div>
                  {selectedNodeData.death_date && (
                    <div><strong>逝世日期:</strong> {new Date(selectedNodeData.death_date).toLocaleDateString('zh-CN')}</div>
                  )}
                  {selectedNodeData.residence && (
                    <div><strong>居住地:</strong> {selectedNodeData.residence}</div>
                  )}
                </div>
                <Button 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate(`/member/${selectedNodeData.id}`)}
                >
                  查看完整档案
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧族谱图 */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
          >
            <Background />
            <MiniMap 
              nodeColor={(node) => (node.style?.background as string) || '#ddd'}
              className="bg-white"
            />
            <Controls />
            <Panel position="top-right" className="bg-white p-2 rounded shadow">
              <div className="text-xs text-gray-600">
                点击节点查看详情 | 拖拽移动视图 | 滚轮缩放
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default Tree;
