import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cpu,
  Plus,
  Trash2,
  Settings,
  Key,
  Copy,
  Check,
  Wifi,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { devicesApi, RegisterDeviceParams } from '../../api/devices.api';
import { useSocket } from '../../context/SocketContext';
import { formatDate } from '../../utils/cn';

export const DevicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { setActiveDeviceId, activeDeviceId, deviceStatuses } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [form, setForm] = useState<RegisterDeviceParams>({
    name: 'ESP32 Voice Companion',
    deviceType: 'esp32-s3',
    macAddress: 'E0:5A:1B:90:3A:42',
    firmwareVersion: '1.0.0',
    hardwareVersion: 'ESP32-S3-WROOM-1',
  });

  const { data: devicesRes, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getDevices(),
    retry: false,
  });
  const devices = devicesRes?.data || [];

  const registerMutation = useMutation({
    mutationFn: (params: RegisterDeviceParams) => devicesApi.registerDevice(params),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if (res.data?.apiKey) {
        setCreatedKey(res.data.apiKey);
      } else {
        setIsModalOpen(false);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => devicesApi.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  useEffect(() => {
    if (devices.length > 0 && !activeDeviceId) {
      setActiveDeviceId(devices[0].id);
    }
  }, [devices, activeDeviceId, setActiveDeviceId]);

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Device Management Hub
          </h1>
          <p className="text-sm text-neutral-slate">
            Provision ESP32-S3 robots, manage secret API keys, and monitor real-time hardware status.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedKey(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Robot</span>
        </button>
      </div>

      {/* Devices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-void">No Devices Registered Yet</h3>
            <p className="text-sm text-neutral-slate max-w-sm mx-auto mt-1">
              Add your ESP32-S3 voice companion to obtain its secret API key for WebSocket authentication.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl btn-primary text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Provision First Robot</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const isSelected = activeDeviceId === device.id;
            return (
              <div
                key={device.id}
                className={`p-6 rounded-3xl glass-card transition-all relative ${
                  isSelected ? 'ring-2 ring-primary border-transparent shadow-glow-violet' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-bold text-neutral-void">
                        {device.name}
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-slate">
                        {device.deviceType}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const liveStatus = deviceStatuses[device.id] || device.status;
                    const isOnline = liveStatus === 'online';
                    return (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-border/60 text-neutral-slate border border-neutral-border'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                        {liveStatus}
                      </span>
                    );
                  })()}
                </div>

                <div className="mt-5 space-y-2 py-3 border-y border-neutral-border/60 text-xs font-mono">
                  <div className="flex justify-between text-neutral-slate">
                    <span>MAC Address:</span>
                    <span className="text-neutral-void font-semibold">{device.macAddress}</span>
                  </div>
                  <div className="flex justify-between text-neutral-slate">
                    <span>Firmware:</span>
                    <span className="text-neutral-void font-semibold">v{device.firmwareVersion}</span>
                  </div>
                  <div className="flex justify-between text-neutral-slate">
                    <span>Registered:</span>
                    <span className="text-neutral-void">{formatDate(device.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveDeviceId(device.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'btn-glass text-neutral-void hover:text-primary'
                    }`}
                  >
                    {isSelected ? 'Active Device' : 'Set as Active'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/devices/${device.id}`}
                      className="p-2 rounded-xl btn-glass text-neutral-slate hover:text-primary"
                      title="Hardware Details & Telemetry"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Unregister robot "${device.name}"?`)) {
                          deleteMutation.mutate(device.id);
                        }
                      }}
                      className="p-2 rounded-xl btn-glass text-neutral-slate hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-5">
            <div>
              <h3 className="text-lg font-display font-bold text-neutral-void">
                {createdKey ? 'Robot Successfully Provisioned!' : 'Register ESP32-S3 Robot'}
              </h3>
              <p className="text-xs text-neutral-slate mt-1">
                {createdKey
                  ? 'Copy this secret API key into your ESP32 firmware config.h file.'
                  : 'Enter hardware parameters to generate a cryptographically secure device API key.'}
              </p>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-canvas-light border border-neutral-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-slate">
                    <span>DEVICE API KEY (SECRET):</span>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1 text-primary hover:underline font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs break-all bg-white p-3 rounded-xl border border-neutral-border text-neutral-void select-all">
                    {createdKey}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  ⚠️ This key will not be displayed again. Make sure to flash it to your ESP32-S3 device.
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl btn-primary text-sm font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  registerMutation.mutate(form);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-neutral-void mb-1">
                    Robot Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                    placeholder="e.g. Living Room Bot"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-void mb-1">
                      Device Type
                    </label>
                    <select
                      value={form.deviceType}
                      onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                    >
                      <option value="esp32-s3">ESP32-S3</option>
                      <option value="simulator">Simulator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-void mb-1">
                      Hardware Model
                    </label>
                    <input
                      type="text"
                      value={form.hardwareVersion}
                      onChange={(e) => setForm({ ...form, hardwareVersion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl input-glass text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-void mb-1">
                      MAC Address
                    </label>
                    <input
                      type="text"
                      required
                      value={form.macAddress}
                      onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl input-glass text-sm font-mono"
                      placeholder="XX:XX:XX:XX:XX:XX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-void mb-1">
                      Firmware Version
                    </label>
                    <input
                      type="text"
                      value={form.firmwareVersion}
                      onChange={(e) => setForm({ ...form, firmwareVersion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl input-glass text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl btn-glass text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="px-5 py-2 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2"
                  >
                    {registerMutation.isPending ? 'Generating...' : 'Provision & Generate Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

