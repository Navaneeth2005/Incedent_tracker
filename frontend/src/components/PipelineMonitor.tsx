import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Shield, Globe, Cpu } from 'lucide-react';

interface Service {
  name: string;
  status: 'healthy' | 'elevated' | 'degraded' | 'down';
  latency?: string;
}

const serviceIcons: Record<string, typeof Activity> = {
  'API Gateway': Globe,
  'Database': Database,
  'Auth Service': Shield,
  'Cache': Server,
  'Compute': Cpu,
};

function generateServices(): Service[] {
  const services: Service[] = [
    { name: 'API Gateway', status: 'healthy', latency: '45ms' },
    { name: 'Database', status: 'elevated', latency: '230ms' },
    { name: 'Auth Service', status: 'degraded', latency: '890ms' },
    { name: 'Cache Layer', status: 'healthy', latency: '12ms' },
    { name: 'Compute Cluster', status: 'healthy', latency: '28ms' },
  ];
  
  const idx = Math.floor(Math.random() * services.length);
  const statuses: Service['status'][] = ['healthy', 'healthy', 'elevated', 'degraded'];
  services[idx].status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return services;
}

const statusColors = {
  healthy: 'bg-emerald-500',
  elevated: 'bg-amber-500',
  degraded: 'bg-orange-500',
  down: 'bg-red-500'
};

const statusLabels = {
  healthy: 'Normal',
  elevated: 'Elevated',
  degraded: 'Degraded',
  down: 'Down'
};

export default function PipelineMonitor() {
  const [services, setServices] = useState<Service[]>(generateServices);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(generateServices());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const overallStatus = services.some(s => s.status === 'down') ? 'critical' 
    : services.some(s => s.status === 'degraded') ? 'warning' 
    : 'healthy';

  return (
    <div className="bg-black/50 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-white/40" />
          <h2 className="text-sm font-medium text-white/80">Pipeline</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ 
              boxShadow: overallStatus === 'critical' 
                ? ['0 0 0 rgba(239,68,68,0)', '0 0 8px rgba(239,68,68,0.5)', '0 0 0 rgba(239,68,68,0)']
                : overallStatus === 'warning'
                ? ['0 0 0 rgba(245,158,11,0)', '0 0 8px rgba(245,158,11,0.5)', '0 0 0 rgba(245,158,11,0)']
                : 'none'
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${overallStatus === 'critical' ? 'bg-red-500' : overallStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
          />
          <span className="text-xs text-white/30">
            {healthyCount}/{services.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {services.map((service, idx) => {
          const Icon = serviceIcons[service.name] || Activity;
          
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5"
            >
              <div className={`p-1.5 rounded-md ${service.status === 'healthy' ? 'bg-emerald-500/10' : service.status === 'elevated' ? 'bg-amber-500/10' : service.status === 'degraded' ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                <Icon size={14} className={
                  service.status === 'healthy' ? 'text-emerald-400/80' 
                  : service.status === 'elevated' ? 'text-amber-400/80'
                  : service.status === 'degraded' ? 'text-orange-400/80'
                  : 'text-red-400/80'
                } />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/60 truncate">{service.name}</p>
                <p className="text-[10px] text-white/30">{statusLabels[service.status]}</p>
              </div>
              
              <div className="text-right">
                <p className={`text-xs font-mono ${
                  service.status === 'healthy' ? 'text-emerald-400/80' 
                  : service.status === 'elevated' ? 'text-amber-400/80'
                  : service.status === 'degraded' ? 'text-orange-400/80'
                  : 'text-red-400/80'
                }`}>
                  {service.latency}
                </p>
                <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${statusColors[service.status]}`}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: service.status === 'healthy' ? '100%' 
                        : service.status === 'elevated' ? '70%'
                        : service.status === 'degraded' ? '40%'
                        : '10%'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>Last updated</span>
          <span className="font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}