'use client'

import React, { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { BoardProvider } from '@/components/kanban/board-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Kanban, 
  Plus, 
  Users, 
  Calendar, 
  BarChart3,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';
import { boardTemplates } from '@/lib/templates/board-templates';

export default function Home() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // If a board is selected, show the Kanban board
  if (selectedBoardId) {
    return (
      <BoardProvider>
        <div className="h-screen">
          <KanbanBoard boardId={selectedBoardId} />
        </div>
      </BoardProvider>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Kanban className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight lg:text-6xl mb-6">
            Advanced Kanban Board
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A powerful, feature-rich Kanban board built with React and TypeScript. 
            Organize your projects with drag-and-drop functionality, advanced filtering, 
            real-time collaboration, and comprehensive project management tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setSelectedBoardId('demo-board')}
              className="text-lg px-8 py-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Try Demo Board
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-lg px-8 py-6"
            >
              <Target className="h-5 w-5 mr-2" />
              View Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Modern Teams
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Drag & Drop */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit">
                  <Kanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Intuitive Drag & Drop</CardTitle>
                <CardDescription>
                  Seamlessly move cards between columns with smooth animations and visual feedback
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Team Collaboration */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Assign tasks, add comments, mention team members, and track progress together
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Advanced Filtering */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Smart Filtering</CardTitle>
                <CardDescription>
                  Filter by assignee, priority, tags, due dates, and search across all card content
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Due Date Management */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Due Date Tracking</CardTitle>
                <CardDescription>
                  Visual due date indicators with overdue alerts and upcoming deadline notifications
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Analytics */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>
                  Track team velocity, identify bottlenecks, and visualize project progress
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Rich Content */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg w-fit">
                  <MessageSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Rich Content Support</CardTitle>
                <CardDescription>
                  Markdown support, file attachments, checklists, and detailed card descriptions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Board Templates Section */}
      {showTemplates && (
        <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Choose from Pre-built Templates
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.type}</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Columns ({template.columns.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {template.columns.slice(0, 4).map((column, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: column.color,
                                color: column.color 
                              }}
                            >
                              {column.title}
                            </Badge>
                          ))}
                          {template.columns.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.columns.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Default Tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.defaultTags.slice(0, 3).map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                borderColor: `${tag.color}40`,
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4" 
                        onClick={() => setSelectedBoardId(`template-${template.id}`)}
                      >
                        Use This Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technical Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Built with Modern Technologies
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-4">Frontend Excellence</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Next.js 15+ with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• React Beautiful DnD for drag & drop</li>
                <li>• Tailwind CSS + Shadcn/UI components</li>
                <li>• Responsive design with dark mode</li>
                <li>• Optimistic updates for smooth UX</li>
              </ul>
            </div>
            
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-4">Advanced Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Local storage with cloud sync ready</li>
                <li>• Markdown support with syntax highlighting</li>
                <li>• Advanced search and filtering</li>
                <li>• Real-time collaboration preparation</li>
                <li>• Export functionality</li>
                <li>• Comprehensive analytics</li>
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <Button 
              size="lg" 
              onClick={() => setSelectedBoardId('demo-board')}
              className="text-lg px-8 py-6"
            >
              Start Building Your Board
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
