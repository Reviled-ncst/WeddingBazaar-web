import React, { useState } from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { 
  AlertTriangle, 
  Shield, 
  Phone,
  Mail,
  Database,
  Server,
  Users,
  Lock,
  RefreshCcw,
  Power,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface EmergencyProcedure {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  icon: any;
  steps: string[];
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  email: string;
  available: string;
}

export const AdminEmergency: React.FC = () => {
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: 'John Smith',
      role: 'System Administrator',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@weddingbazaar.com',
      available: '24/7'
    },
    {
      name: 'Sarah Wilson',
      role: 'Security Lead',
      phone: '+1 (555) 234-5678',
      email: 'sarah.wilson@weddingbazaar.com',
      available: 'Business Hours'
    },
    {
      name: 'Mike Johnson',
      role: 'Database Administrator',
      phone: '+1 (555) 345-6789',
      email: 'mike.johnson@weddingbazaar.com',
      available: 'On-Call'
    },
    {
      name: 'Emergency Hotline',
      role: 'Critical Issues',
      phone: '+1 (555) 911-HELP',
      email: 'emergency@weddingbazaar.com',
      available: '24/7'
    }
  ];

  const emergencyProcedures: EmergencyProcedure[] = [
    {
      id: 'data-breach',
      title: 'Data Breach Response',
      description: 'Immediate steps to contain and respond to a data security breach',
      severity: 'critical',
      icon: Shield,
      steps: [
        '1. Immediately isolate affected systems',
        '2. Contact the Security Lead and System Administrator',
        '3. Document the breach details and timeline',
        '4. Assess the scope and impact of the breach',
        '5. Notify relevant authorities and stakeholders',
        '6. Implement containment measures',
        '7. Begin forensic investigation',
        '8. Prepare public communications if necessary'
      ]
    },
    {
      id: 'system-outage',
      title: 'Complete System Outage',
      description: 'Response protocol for total platform unavailability',
      severity: 'critical',
      icon: Server,
      steps: [
        '1. Verify the outage scope and affected services',
        '2. Contact System Administrator immediately',
        '3. Check infrastructure status (servers, database, network)',
        '4. Implement emergency backup systems if available',
        '5. Update status page and notify users',
        '6. Begin systematic restoration process',
        '7. Monitor recovery progress',
        '8. Conduct post-incident review'
      ]
    },
    {
      id: 'database-corruption',
      title: 'Database Corruption',
      description: 'Emergency response for database integrity issues',
      severity: 'critical',
      icon: Database,
      steps: [
        '1. Stop all write operations to the database',
        '2. Contact Database Administrator immediately',
        '3. Assess the extent of corruption',
        '4. Restore from the most recent backup',
        '5. Verify data integrity after restoration',
        '6. Resume operations gradually',
        '7. Implement additional monitoring',
        '8. Update backup procedures if necessary'
      ]
    },
    {
      id: 'payment-system-failure',
      title: 'Payment System Failure',
      description: 'Response for payment processing interruptions',
      severity: 'high',
      icon: Lock,
      steps: [
        '1. Disable payment processing immediately',
        '2. Contact payment gateway support',
        '3. Notify financial operations team',
        '4. Inform affected vendors and users',
        '5. Implement alternative payment methods if available',
        '6. Monitor for transaction discrepancies',
        '7. Resume processing once systems are verified',
        '8. Reconcile any pending transactions'
      ]
    },
    {
      id: 'mass-user-complaints',
      title: 'Mass User Complaints',
      description: 'Protocol for handling widespread user issues',
      severity: 'medium',
      icon: Users,
      steps: [
        '1. Assess the nature and scope of complaints',
        '2. Check system logs for related issues',
        '3. Prepare standardized response communications',
        '4. Escalate to appropriate technical teams',
        '5. Update status page with known issues',
        '6. Monitor social media and support channels',
        '7. Implement fixes and communicate resolution',
        '8. Follow up with affected users'
      ]
    }
  ];

  const getSeverityColor = (severity: EmergencyProcedure['severity']) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-pink-500';
      case 'high': return 'from-orange-500 to-red-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
    }
  };

  const getSeverityBadgeColor = (severity: EmergencyProcedure['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-orange-50/20 to-yellow-50/10">
      <AdminHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Emergency Procedures
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">
                  Critical response protocols for system emergencies and security incidents
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Hotline
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Alert */}
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Response Guidelines</h3>
                <p className="text-red-800 mb-3">
                  In case of a critical system emergency, remain calm and follow the appropriate procedure. 
                  Contact emergency personnel immediately for critical security or system failures.
                </p>
                <div className="text-sm text-red-700">
                  <strong>Emergency Hotline:</strong> +1 (555) 911-HELP | 
                  <strong> Email:</strong> emergency@weddingbazaar.com
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Emergency Procedures */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Emergency Response Procedures</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {emergencyProcedures.map((procedure) => (
                    <div key={procedure.id} className="p-6">
                      <div 
                        className="cursor-pointer"
                        onClick={() => setSelectedProcedure(
                          selectedProcedure === procedure.id ? null : procedure.id
                        )}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className={cn(
                            "p-3 rounded-xl bg-gradient-to-r",
                            getSeverityColor(procedure.severity)
                          )}>
                            <procedure.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{procedure.title}</h3>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getSeverityBadgeColor(procedure.severity)
                              )}>
                                {procedure.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600">{procedure.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedProcedure === procedure.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-bold text-gray-900 mb-3">Response Steps:</h4>
                          <div className="space-y-2">
                            {procedure.steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                                  {index + 1}
                                </div>
                                <p className="text-gray-700 flex-1">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Emergency Contacts */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Emergency Contacts</h3>
                </div>
                <div className="p-6 space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="font-bold text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{contact.role}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-700">
                            {contact.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700">
                            {contact.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{contact.available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Power className="h-4 w-4" />
                    Emergency Shutdown
                  </button>
                  <button className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Maintenance Mode
                  </button>
                  <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    System Restart
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    Incident Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
