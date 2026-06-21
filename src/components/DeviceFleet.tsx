import { useState, useMemo } from 'react'
import { Monitor, ShieldCheck, ShieldAlert, AlertTriangle, Search, Filter, ArrowUpDown } from 'lucide-react'
import type { Device } from '../types'

interface DeviceFleetProps {
  devices: Device[]
}

export function DeviceFleet({ devices }: DeviceFleetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOS, setFilterOS] = useState('ALL')
  const [sortBy, setSortBy] = useState<'Name' | 'Compliance'>('Name')

  const filteredAndSortedDevices = useMemo(() => {
    return devices
      .filter(device => {
        const matchesSearch = device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              device.assigned_user.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterOS === 'ALL' || device.os === filterOS
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        if (sortBy === 'Compliance') {
          return a.patch_compliance_pct - b.patch_compliance_pct
        }
        return a.device_name.localeCompare(b.device_name)
      })
  }, [devices, searchQuery, filterOS, sortBy])

  const uniqueOS = useMemo(() => Array.from(new Set(devices.map(d => d.os))), [devices])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Fleet Management</h1>
          <p className="mt-2 text-slate-400 font-medium">
            Overview of {filteredAndSortedDevices.length} managed endpoint devices
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#101010]/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterOS}
              onChange={(e) => setFilterOS(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none"
            >
              <option value="ALL">All OS</option>
              {uniqueOS.map(os => (
                <option key={os} value={os}>{os}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'Name' | 'Compliance')}
              className="bg-transparent text-sm text-slate-300 focus:outline-none"
            >
              <option value="Name">Sort by Name</option>
              <option value="Compliance">Sort by Compliance</option>
            </select>
          </div>
        </div>
      </header>

      <div className="glass-panel">
        <div className="glass-surface overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="border-b border-white/10 bg-[#171427]/50 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Device Name & ID</th>
                <th scope="col" className="px-6 py-4 font-medium">OS & Type</th>
                <th scope="col" className="px-6 py-4 font-medium">Assigned User & Dept</th>
                <th scope="col" className="px-6 py-4 font-medium">Patch Compliance</th>
                <th scope="col" className="px-6 py-4 font-medium">Antivirus Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedDevices.map((device) => {
                const patchPct = Math.round(device.patch_compliance_pct * 100)
                const isPatchWarning = patchPct < 70

                return (
                  <tr key={device.device_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-white/10 p-2 text-slate-300">
                          <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{device.device_name}</p>
                          <p className="text-xs text-slate-500">{device.device_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-300">{device.os}</p>
                      <p className="text-xs capitalize text-slate-500">{device.fleet_segment} Segment</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-300">{device.assigned_user}</p>
                      <p className="text-xs text-slate-500">{device.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isPatchWarning ? 'text-[#F87171]' : 'text-slate-300'}`}>
                        {patchPct}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {device.antivirus_status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : device.antivirus_status === 'outdated' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Outdated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Missing
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
