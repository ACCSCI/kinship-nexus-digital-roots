
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { TreePine } from "lucide-react";

interface GlobalHeaderProps {
  secondaryNav?: React.ReactNode;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ secondaryNav }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <TreePine className="h-8 w-8 text-indigo-600" />
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              赛博族谱
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {/* Primary Navigation - Always Visible */}
            <div className="flex space-x-1 mr-4">
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"} 
                onClick={() => navigate("/dashboard")}
                size="sm"
              >
                仪表板
              </Button>
              <Button 
                variant={isActive("/tree") ? "default" : "ghost"} 
                onClick={() => navigate("/tree")}
                size="sm"
              >
                族谱图
              </Button>
              <Button 
                variant={isActive("/stats") ? "default" : "ghost"} 
                onClick={() => navigate("/stats")}
                size="sm"
              >
                统计分析
              </Button>
              <Button 
                variant={isActive("/branches") ? "default" : "ghost"} 
                onClick={() => navigate("/branches")}
                size="sm"
              >
                家族分支
              </Button>
              <Button 
                variant={isActive("/relationships") ? "default" : "ghost"} 
                onClick={() => navigate("/relationships")}
                size="sm"
              >
                关系管理
              </Button>
              <Button 
                variant={isActive("/events") ? "default" : "ghost"} 
                onClick={() => navigate("/events")}
                size="sm"
              >
                事件记录
              </Button>
              <Button 
                variant={isActive("/settings") ? "default" : "ghost"} 
                onClick={() => navigate("/settings")}
                size="sm"
              >
                设置
              </Button>
            </div>

            {/* Secondary Navigation - Page-Specific */}
            {secondaryNav && (
              <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
                {secondaryNav}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
