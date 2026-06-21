import { Monitor, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import type { Device } from '../types'

interface DeviceFleetProps {
  devices: Device[]
}

export function DeviceFleet({ devices }: DeviceFleetProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900">Fleet Management</h1>
        <p className="mt-1 text-slate-600">
          Overview of 50 managed endpoint devices
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Device Name & ID</th>
                <th scope="col" className="px-6 py-4 font-medium">OS & Type</th>
                <th scope="col" className="px-6 py-4 font-medium">Assigned User & Dept</th>
                <th scope="col" className="px-6 py-4 font-medium">Patch Compliance</th>
                <th scope="col" className="px-6 py-4 font-medium">Antivirus Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.slice(0, 50).map((device) => {
                const patchPct = Math.round(device.patch_compliance_pct * 100)
                const isPatchWarning = patchPct < 70

                return (
                  <tr key={device.device_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-slate-100 p-2 text-slate-500">
                          <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{device.device_name}</p>
                          <p className="text-xs text-slate-500">{device.device_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{device.os}</p>
                      <p className="text-xs capitalize text-slate-500">{device.fleet_segment} Segment</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{device.assigned_user}</p>
                      <p className="text-xs text-slate-500">{device.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isPatchWarning ? 'text-red-600' : 'text-slate-700'}`}>
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
