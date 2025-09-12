import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  Users,
  Filter,
  Search,
  Star,
  Target
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo?: string;
  vendor?: {
    name: string;
    contact: string;
    website?: string;
  };
  notes?: string;
}

export const WeddingPlanning: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Book Wedding Venue',
      description: 'Visit and book the perfect venue for our special day',
      category: 'Venue',
      priority: 'high',
      status: 'completed',
      dueDate: '2024-02-15',
      vendor: {
        name: 'Sunset Garden Venue',
        contact: '(555) 123-4567',
        website: 'sunsetgarden.com'
      },
      notes: 'Booked for August 15th, 2024. Deposit paid.'
    },
    {
      id: '2',
      title: 'Hire Wedding Photographer',
      description: 'Find and book a photographer to capture our memories',
      category: 'Photography',
      priority: 'high',
      status: 'completed',
      dueDate: '2024-02-20',
      vendor: {
        name: 'Jessica Williams Photography',
        contact: 'jessica@jwphoto.com',
        website: 'jessicawilliamsphoto.com'
      },
      notes: 'Booked for full day coverage. Engagement shoot included.'
    },
    {
      id: '3',
      title: 'Choose Wedding Caterer',
      description: 'Select catering service and finalize menu',
      category: 'Catering',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-03-25',
      vendor: {
        name: 'Gourmet Catering Co.',
        contact: '(555) 987-6543'
      },
      notes: 'Menu tasting scheduled for March 20th'
    },
    {
      id: '4',
      title: 'Send Save the Dates',
      description: 'Design and send save the date cards to guests',
      category: 'Invitations',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-03-01',
      notes: 'Sent to 150 guests via mail and email'
    },
    {
      id: '5',
      title: 'Order Wedding Flowers',
      description: 'Choose florist and order bridal bouquet and centerpieces',
      category: 'Flowers',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-04-10',
      vendor: {
        name: 'Bella Flora',
        contact: 'info@bellaflora.com'
      }
    },
    {
      id: '6',
      title: 'Book Wedding DJ',
      description: 'Hire DJ for ceremony and reception music',
      category: 'Entertainment',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-03-15',
      vendor: {
        name: 'DJ Mike Entertainment',
        contact: '(555) 456-7890'
      },
      notes: 'Booked for full reception. Playlist meeting scheduled.'
    },
    {
      id: '7',
      title: 'Wedding Dress Shopping',
      description: 'Find and purchase the perfect wedding dress',
      category: 'Attire',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-04-01',
      notes: 'Appointments at 3 bridal shops scheduled'
    },
    {
      id: '8',
      title: 'Wedding Cake Tasting',
      description: 'Visit bakeries and choose wedding cake design',
      category: 'Dessert',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-04-15'
    }
  ]);

  const categories = ['all', 'Venue', 'Photography', 'Catering', 'Invitations', 'Flowers', 'Entertainment', 'Attire', 'Dessert'];
  const priorities = ['all', 'low', 'medium', 'high'];
  const statuses = ['all', 'pending', 'in-progress', 'completed'];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending': return <Circle className="h-5 w-5 text-orange-600" />;
      default: return <Circle className="h-5 w-5 text-gray-600" />;
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionPercentage = (completedTasks / totalTasks) * 100;

  const tasksByCategory = categories.slice(1).map(category => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedCategoryTasks = categoryTasks.filter(task => task.status === 'completed').length;
    return {
      name: category,
      total: categoryTasks.length,
      completed: completedCategoryTasks,
      percentage: categoryTasks.length > 0 ? (completedCategoryTasks / categoryTasks.length) * 100 : 0
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50">
      <CoupleHeader />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Wedding Planning 📋
                </h1>
                <p className="text-lg text-gray-600">
                  Stay organized with your wedding checklist
                </p>
              </div>
              <div className="mt-6 lg:mt-0 flex items-center gap-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">{completedTasks}/{totalTasks} Tasks Complete</span>
                </div>
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{completionPercentage.toFixed(0)}% Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Progress Overview</h2>
                
                {/* Overall Progress */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-rose-600">{completionPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Category Progress */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                  {tasksByCategory.map((category) => (
                    <div key={category.name} className="p-3 rounded-xl bg-white/50 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.completed}/{category.total}</span>
                      </div>
                      {category.total > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {category.percentage === 100 ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-gray-200 rounded-full h-1 mr-2">
                              <div 
                                className={cn(
                                  "h-1 rounded-full transition-all duration-300",
                                  category.percentage === 100 ? "bg-green-500" : "bg-orange-500"
                                )}
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 min-w-0">
                              {category.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="xl:col-span-3">
              {/* Filters */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white/80"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white/80"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>
                          {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white/80"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 flex-shrink-0">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={cn(
                                "text-lg font-semibold",
                                task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                              )}>
                                {task.title}
                              </h3>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getPriorityColor(task.priority)
                              )}>
                                {task.priority}
                              </span>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getStatusColor(task.status)
                              )}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              {task.vendor && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{task.vendor.name}</span>
                                </div>
                              )}
                              {task.category && (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 mr-1" />
                                  <span>{task.category}</span>
                                </div>
                              )}
                            </div>
                            {task.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{task.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors duration-200">
                            Edit
                          </button>
                          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Filter className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No tasks found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


  );
};
