'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Activity, Server, Database, Globe, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// Mock data for infrastructure monitoring
const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 62, network: 28, disk: 35 },
  { time: '02:00', cpu: 38, memory: 58, network: 32, disk: 38 },
  { time: '04:00', cpu: 42, memory: 65, network: 25, disk: 40 },
  { time: '06:00', cpu: 55, memory: 72, network: 45, disk: 45 },
  { time: '08:00', cpu: 68, memory: 78, network: 58, disk: 52 },
  { time: '10:00', cpu: 72, memory: 82, network: 65, disk: 58 },
  { time: '12:00', cpu: 75, memory: 85, network: 70, disk: 62 },
  { time: '14:00', cpu: 78, memory: 88, network: 75, disk: 65 },
  { time: '16:00', cpu: 82, memory: 90, network: 80, disk: 68 },
  { time: '18:00', cpu: 75, memory: 85, network: 70, disk: 62 },
  { time: '20:00', cpu: 68, memory: 78, network: 58, disk: 55 },
  { time: '22:00', cpu: 55, memory: 70, network: 45, disk: 48 },
]

const serviceStatus = [
  { name: 'Data Pipeline', status: 'healthy', uptime: '99.99%', responseTime: '45ms', icon: Activity },
  { name: 'API Gateway', status: 'warning', uptime: '99.85%', responseTime: '120ms', icon: Globe },
  { name: 'Primary Database', status: 'healthy', uptime: '99.98%', responseTime: '12ms', icon: Database },
  { name: 'Cache Layer', status: 'healthy', uptime: '99.97%', responseTime: '8ms', icon: HardDrive },
  { name: 'Load Balancer', status: 'healthy', uptime: '99.99%', responseTime: '5ms', icon: Server },
  { name: 'Monitoring System', status: 'healthy', uptime: '99.99%', responseTime: '15ms', icon: Cpu },
  { name: 'Message Queue', status: 'healthy', uptime: '99.95%', responseTime: '25ms', icon: Wifi },
  { name: 'File Storage', status: 'healthy', uptime: '99.98%', responseTime: '35ms', icon: HardDrive },
]

const alerts = [
  { id: 1, severity: 'warning', message: 'API Gateway response time increased to 120ms', time: '2 minutes ago', service: 'API Gateway' },
  { id: 2, severity: 'info', message: 'Scheduled maintenance completed successfully', time: '1 hour ago', service: 'System' },
  { id: 3, severity: 'info', message: 'Database backup completed', time: '3 hours ago', service: 'Database' },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-400" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    case 'error':
      return <XCircle className="h-5 w-5 text-red-400" />
    default:
      return <CheckCircle className="h-5 w-5 text-green-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'status-success'
    case 'warning':
      return 'status-warning'
    case 'error':
      return 'status-danger'
    default:
      return 'status-success'
  }
}

export default function InfrastructurePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dynamicSystemMetrics, setDynamicSystemMetrics] = useState(systemMetrics)
  const [dynamicServiceStatus, setDynamicServiceStatus] = useState(serviceStatus)

  // Generate dynamic system metrics
  const generateDynamicMetrics = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0')
      return {
        time: `${hour}:00`,
        cpu: Math.round(30 + Math.random() * 50 + Math.sin(i * 0.5) * 10),
        memory: Math.round(50 + Math.random() * 40 + Math.sin(i * 0.3) * 15),
        network: Math.round(20 + Math.random() * 60 + Math.sin(i * 0.7) * 20),
        disk: Math.round(25 + Math.random() * 45 + Math.sin(i * 0.4) * 12)
      }
    })
    return hours
  }, [currentTime])

  // Update system metrics every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setDynamicSystemMetrics(generateDynamicMetrics)
      
      // Simulate occasional service status changes
      setDynamicServiceStatus(prev => prev.map(service => {
        if (Math.random() < 0.05) { // 5% chance of status change
          const statuses = ['healthy', 'warning', 'error']
          const currentIndex = statuses.indexOf(service.status)
          const newStatus = statuses[(currentIndex + 1) % statuses.length]
          
          return {
            ...service,
            status: newStatus,
            responseTime: newStatus === 'healthy' ? 
              `${Math.round(5 + Math.random() * 50)}ms` :
              newStatus === 'warning' ? 
              `${Math.round(100 + Math.random() * 200)}ms` :
              `${Math.round(500 + Math.random() * 1000)}ms`
          }
        }
        return service
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(timer)
  }, [generateDynamicMetrics])

  // Calculate dynamic system health
  const systemHealth = useMemo(() => {
    const healthyServices = dynamicServiceStatus.filter(s => s.status === 'healthy').length
    const totalServices = dynamicServiceStatus.length
    return Math.round((healthyServices / totalServices) * 100)
  }, [dynamicServiceStatus])

  const avgResponseTime = useMemo(() => {
    const totalResponseTime = dynamicServiceStatus.reduce((sum, service) => {
      const responseTime = parseInt(service.responseTime.replace('ms', ''))
      return sum + responseTime
    }, 0)
    return Math.round(totalResponseTime / dynamicServiceStatus.length)
  }, [dynamicServiceStatus])

  const uptime = useMemo(() => {
    return (99.5 + Math.random() * 0.5).toFixed(2) + '%'
  }, [currentTime])

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Infrastructure Monitoring</h1>
          <p className="mt-2 text-white opacity-90 drop-shadow-md">
            System health and performance monitoring
          </p>
          <p className="mt-1 text-sm text-white opacity-70">
            Last updated: {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-80">System Health</p>
                <p className={`text-2xl font-bold ${
                  systemHealth >= 95 ? 'text-green-400' : 
                  systemHealth >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {systemHealth}%
                </p>
                <p className="text-xs text-white opacity-70 mt-1">
                  {systemHealth >= 95 ? 'All systems operational' : 
                   systemHealth >= 80 ? 'Minor issues detected' : 'Critical issues detected'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                systemHealth >= 95 ? 'bg-green-500/20 text-green-400' : 
                systemHealth >= 80 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-80">Active Services</p>
                <p className="text-2xl font-bold text-white">
                  {dynamicServiceStatus.filter(s => s.status === 'healthy').length}/{dynamicServiceStatus.length}
                </p>
                <p className="text-xs text-white opacity-70 mt-1">
                  {dynamicServiceStatus.filter(s => s.status === 'warning').length} warnings, {' '}
                  {dynamicServiceStatus.filter(s => s.status === 'error').length} errors
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <Server className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-80">Avg Response Time</p>
                <p className={`text-2xl font-bold ${
                  avgResponseTime < 100 ? 'text-green-400' : 
                  avgResponseTime < 500 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {avgResponseTime}ms
                </p>
                <p className="text-xs text-white opacity-70 mt-1">
                  {avgResponseTime < 100 ? 'Excellent performance' : 
                   avgResponseTime < 500 ? 'Acceptable performance' : 'Performance degraded'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-600/20 text-slate-300">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white opacity-80">Uptime</p>
                <p className="text-2xl font-bold text-green-400">{uptime}</p>
                <p className="text-xs text-white opacity-70 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-600/20 text-slate-300">
                <Cpu className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* System Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CPU and Memory Usage */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">System Resources (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicSystemMetrics}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Usage']}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" fill="url(#colorCpu)" name="CPU" />
                  <Area type="monotone" dataKey="memory" stroke="#22c55e" fill="url(#colorMemory)" name="Memory" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network and Disk Usage */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Network & Disk (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicSystemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Usage']}
                  />
                  <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={2} name="Network" />
                  <Line type="monotone" dataKey="disk" stroke="#ef4444" strokeWidth={2} name="Disk" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="mb-8">
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicServiceStatus.map((service) => (
                <div key={service.name} className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-600/40">
                      <service.icon className="h-5 w-5 text-slate-300" />
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <h4 className="font-medium text-white mb-2">{service.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Status:</span>
                      <span className={`status-indicator ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Uptime:</span>
                      <span className="text-white">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Response:</span>
                      <span className="text-white">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-md">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/20">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'error' ? 'bg-red-500' : 
                    alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{alert.message}</p>
                    <p className="text-sm text-slate-300">{alert.service} • {alert.time}</p>
                  </div>
                </div>
                <span className={`status-indicator ${
                  alert.severity === 'error' ? 'status-danger' : 
                  alert.severity === 'warning' ? 'status-warning' : 'status-info'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

