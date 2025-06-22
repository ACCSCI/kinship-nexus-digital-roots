
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TreePine, Search } from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Individual {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string | null;
  birth_place: string | null;
  death_date: string | null;
  death_place: string | null;
  occupation: string | null;
  education: string | null;
  notes: string | null;
  biography: string | null;
  photo_path: string | null;
  residence: string | null;
  created_at: string;
}

interface Relationship {
  id: number;
  person1_id: number;
  person2_id: number;
  type: string;
}

const Tree = () => {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Individual | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeData, setSelectedNodeData] = useState<Individual | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [individualsResult, relationshipsResult] = await Promise.all([
        supabase.from("Individual").select("*"),
        supabase.from("Relationship").select("*")
      ]);

      if (individualsResult.error) {
        toast({
          title: "获取个人数据失败",
          description: individualsResult.error.message,
          variant: "destructive"
        });
      } else {
        setIndividuals(individualsResult.data || []);
      }

      if (relationshipsResult.error) {
        toast({
          title: "获取关系数据失败",
          description: relationshipsResult.error.message,
          variant: "destructive"
        });
      } else {
        setRelationships(relationshipsResult.data || []);
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

  const buildFamilyTree = useCallback((rootPerson: Individual) => {
    const individualsMap = new Map<number, Individual>();
    individuals.forEach(person => individualsMap.set(person.id, person));

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const processedIds = new Set<number>();

    const addPersonNode = (person: Individual, x: number, y: number, level: number) => {
      if (processedIds.has(person.id)) return;
      
      processedIds.add(person.id);
      
      const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : '未知';
      
      newNodes.push({
        id: person.id.toString(),
        type: 'default',
        position: { x, y },
        data: { 
          label: `${person.full_name}\n(${birthYear})`,
          person: person
        },
        style: {
          background: person.gender === 'male' ? '#dbeafe' : '#fce7f3',
          border: '2px solid #6366f1',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          textAlign: 'center',
        },
      });
    };

    // Add root person
    addPersonNode(rootPerson, 400, 300, 0);

    // Find and add parents
    const parentRelations = relationships.filter(rel => 
      rel.type === 'parent' && rel.person2_id === rootPerson.id
    );
    
    parentRelations.forEach((rel, index) => {
      const parent = individualsMap.get(rel.person1_id);
      if (parent) {
        addPersonNode(parent, 300 + (index * 200), 150, -1);
        newEdges.push({
          id: `parent-${rel.id}`,
          source: parent.id.toString(),
          target: rootPerson.id.toString(),
          type: 'smoothstep',
          label: '父母',
          style: { stroke: '#6366f1' },
        });
      }
    });

    // Find and add children
    const childRelations = relationships.filter(rel => 
      rel.type === 'parent' && rel.person1_id === rootPerson.id
    );
    
    childRelations.forEach((rel, index) => {
      const child = individualsMap.get(rel.person2_id);
      if (child) {
        addPersonNode(child, 300 + (index * 150), 450, 1);
        newEdges.push({
          id: `child-${rel.id}`,
          source: rootPerson.id.toString(),
          target: child.id.toString(),
          type: 'smoothstep',
          label: '子女',
          style: { stroke: '#10b981' },
        });
      }
    });

    // Find and add spouse
    const spouseRelations = relationships.filter(rel => 
      rel.type === 'spouse' && (rel.person1_id === rootPerson.id || rel.person2_id === rootPerson.id)
    );
    
    spouseRelations.forEach((rel, index) => {
      const spouseId = rel.person1_id === rootPerson.id ? rel.person2_id : rel.person1_id;
      const spouse = individualsMap.get(spouseId);
      if (spouse) {
        addPersonNode(spouse, 600, 300, 0);
        newEdges.push({
          id: `spouse-${rel.id}`,
          source: rootPerson.id.toString(),
          target: spouse.id.toString(),
          type: 'straight',
          label: '配偶',
          style: { stroke: '#f59e0b' },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [individuals, relationships, setNodes, setEdges]);

  const handlePersonSelect = (person: Individual) => {
    setSelectedPerson(person);
    buildFamilyTree(person);
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data.person as Individual);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const filteredIndividuals = individuals.filter(person =>
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">互动族谱图</h1>
          <p className="text-gray-600">搜索并选择根节点来探索家族关系</p>
        </div>

        {/* 搜索区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>选择根节点</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                placeholder="搜索家族成员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              {searchTerm && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredIndividuals.slice(0, 10).map((person) => (
                    <div
                      key={person.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handlePersonSelect(person)}
                    >
                      <div className="font-medium">{person.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {person.birth_date ? new Date(person.birth_date).getFullYear() : '未知年份'}
                        {person.birth_place && ` • ${person.birth_place}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 族谱图 */}
        <Card>
          <CardContent className="p-0">
            <div style={{ width: '100%', height: '600px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                fitView
                attributionPosition="top-right"
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* 详情面板 */}
        {selectedNodeData && (
          <Sheet open={!!selectedNodeData} onOpenChange={() => setSelectedNodeData(null)}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{selectedNodeData.full_name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">基本信息</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div><span className="font-medium">性别:</span> {selectedNodeData.gender === 'male' ? '男' : '女'}</div>
                    <div>
                      <span className="font-medium">出生:</span> 
                      {selectedNodeData.birth_date ? new Date(selectedNodeData.birth_date).toLocaleDateString('zh-CN') : '未知'}
                      {selectedNodeData.birth_place && ` (${selectedNodeData.birth_place})`}
                    </div>
                    {selectedNodeData.death_date && (
                      <div>
                        <span className="font-medium">逝世:</span> 
                        {new Date(selectedNodeData.death_date).toLocaleDateString('zh-CN')}
                        {selectedNodeData.death_place && ` (${selectedNodeData.death_place})`}
                      </div>
                    )}
                    {selectedNodeData.occupation && (
                      <div><span className="font-medium">职业:</span> {selectedNodeData.occupation}</div>
                    )}
                    {selectedNodeData.education && (
                      <div><span className="font-medium">教育:</span> {selectedNodeData.education}</div>
                    )}
                  </div>
                </div>
                {selectedNodeData.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">备注</h4>
                    <p className="mt-2 text-sm text-gray-600">{selectedNodeData.notes}</p>
                  </div>
                )}
                <Button 
                  onClick={() => navigate(`/member/${selectedNodeData.id}`)}
                  className="w-full"
                >
                  查看详细信息
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default Tree;
