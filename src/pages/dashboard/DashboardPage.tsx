import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Square,
  Volume2,
  Clock,
  Sparkles,
  BookOpen,
  Smile,
  Zap,
  Wifi,
  Cpu,
  Activity,
  Settings,
  Plus,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { audioApi } from '../../api/audio.api';
import { devicesApi } from '../../api/devices.api';
import { settingsApi } from '../../api/settings.api';
import { remindersApi } from '../../api/reminders.api';
import { AuraBeacon } from '../../components/hud/AuraBeacon';
import { formatDate } from '../../utils/cn';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isConnected, robotState, telemetry, activeDeviceId } = useSocket();

  const [activeStoryPlaying, setActiveStoryPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);

  // Active Device Info
  const { data: devRes } = useQuery({
    queryKey: ['device', activeDeviceId],
    queryFn: () => devicesApi.getDevice(activeDeviceId!),
    enabled: Boolean(activeDeviceId),
    refetchInterval: 10000,
  });
  const device = devRes?.data;

  // Active Device Settings (Master Volume, etc.)
  const { data: settingsRes } = useQuery({
    queryKey: ['device-settings', activeDeviceId],
    queryFn: () => settingsApi.getDeviceSettings(activeDeviceId!),
    enabled: Boolean(activeDeviceId),
  });

  useEffect(() => {
    if (settingsRes?.data?.sound?.masterVolume !== undefined) {
      setVolume(settingsRes.data.sound.masterVolume);
    } else if (device?.config?.volumeLevel !== undefined) {
      setVolume(device.config.volumeLevel);
    }
  }, [settingsRes, device]);

  // Volume Change Mutation
  const volumeMutation = useMutation({
    mutationFn: (newVolume: number) =>
      settingsApi.updateDeviceSettings(activeDeviceId!, {
        sound: {
          masterVolume: newVolume,
          isMuted: newVolume === 0,
          outputVolume: newVolume,
          notificationVolume: newVolume,
          feedbackSoundsEnabled: true,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-settings', activeDeviceId] });
    },
  });

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (activeDeviceId) {
      volumeMutation.mutate(newVol);
    }
  };

  // Play Audio on Robot
  const playMutation = useMutation({
    mutationFn: (id: string) => {
      if (!activeDeviceId) throw new Error('No robot selected');
      return audioApi.playOnDevice(id, activeDeviceId);
    },
    onSuccess: (_, id) => {
      setActiveStoryPlaying(id);
    },
  });

  // Stop Robot Audio
  const stopMutation = useMutation({
    mutationFn: () => {
      if (!activeDeviceId) throw new Error('No robot selected');
      return audioApi.stopOnDevice(activeDeviceId);
    },
    onSuccess: () => {
      setActiveStoryPlaying(null);
    },
  });

  // Dynamic Reminders & Alarms from MongoDB
  const { data: remindersRes } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getReminders(),
  });
  const reminders = remindersRes?.data || [];

  // Stories list
  const featuredStories = [
    {
      id: 'story_1',
      title: 'ယုန်နှင့် လိပ် ပြိုင်ပွဲ ပုံပြင်',
      englishTitle: 'The Tortoise and the Hare',
      category: 'ပုံပြင် (Story)',
      duration: '3:45',
      color: 'from-amber-400 to-orange-500',
      description: 'ဇွဲရှိခြင်းသည် အောင်မြင်ခြင်း၏ လျှို့ဝှက်ချက်ဖြစ်ကြောင်း သင်ခန်းစာပေးသော ပုံပြင်',
    },
    {
      id: 'story_2',
      title: 'ဖိုးလမင်းကြီးရေ အိပ်ရာဝင် သံစဉ်',
      englishTitle: 'Twinkle Twinkle & Bedtime Lullaby',
      category: 'အိပ်ရာဝင်သီချင်း (Lullaby)',
      duration: '4:10',
      color: 'from-purple-400 to-indigo-600',
      description: 'ကလေးငယ်များ ငြိမ်းချမ်းစွာ အိပ်ပျော်စေရန် သာယာညင်သာသော တေးသံစုံ',
    },
    {
      id: 'story_3',
      title: 'ဝက်ကလေး သုံးကောင် ပုံပြင်',
      englishTitle: 'The Three Little Pigs',
      category: 'ပုံပြင် (Story)',
      duration: '5:20',
      color: 'from-rose-400 to-pink-600',
      description: 'အကြံဉာဏ်နှင့် ကြိုးစားအားထုတ်မှု၏ တန်ဖိုးကို ဖော်ကျူးသော ပုံပြင်လေး',
    },
    {
      id: 'story_4',
      title: 'အင်္ဂလိပ် အက္ခရာ ABC သီချင်းပျော်',
      englishTitle: 'ABC Phonics Learning Song',
      category: 'ပညာပေး (Learning)',
      duration: '2:50',
      color: 'from-emerald-400 to-teal-600',
      description: 'ကလေးငယ်များ အင်္ဂလိပ်စာ လွယ်ကူစွာ မှတ်မိစေမည့် ပျော်ရွှင်ဖွယ် တေးသီချင်း',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Warm Hero Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-fixed/60 via-surface-low to-canvas-light border border-neutral-border shadow-card">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                <span>Smart AI Robot Companion</span>
              </span>
              <span className="text-xs text-neutral-slate font-medium">
                {device?.name || 'ESP32-S3 Robot'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-void tracking-tight">
              {device?.name ? `${device.name} စက်ရုပ် ထိန်းချုပ်ခန်း` : 'စက်ရုပ် ထိန်းချုပ်ခန်း'}
            </h1>
            <p className="text-sm text-neutral-slate max-w-xl">
              စက်ရုပ်၏ အသံ၊ မီးရောင်၊ ပုံပြင်များနှင့် အချိန်ဇယား သတိပေးသံများကို အချိန်နှင့်တပြေးညီ တိုက်ရိုက် ထိန်းချုပ်နိုင်ပါသည်။
            </p>
          </div>

          {/* Quick Play & Stop Controls */}
          <div className="flex items-center gap-3">
            {activeStoryPlaying ? (
              <button
                onClick={() => stopMutation.mutate()}
                className="px-5 py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 animate-pulse hover:bg-rose-600 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>စက်ရုပ် အသံပိတ်မည် (Stop)</span>
              </button>
            ) : (
              <Link
                to="/audio"
                className="px-5 py-3 rounded-2xl btn-primary text-sm font-semibold flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>ပုံပြင်/သီချင်းများ အားလုံးကြည့်မည်</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Real-Time Hardware & Fast Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Robot Active State */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-slate block">စက်ရုပ် အခြေအနေ</span>
              <h3 className="text-base font-bold text-neutral-void">
                {robotState === 'speaking'
                  ? 'အသံထွက် ဖွင့်နေပါသည်'
                  : robotState === 'listening'
                  ? 'စကားနားထောင်နေသည်'
                  : device?.status === 'online' || isConnected
                  ? 'ဖွင့်ရန် အသင့်ရှိပါသည် (Online)'
                  : 'စက်ရုပ် ချိတ်ဆက်ရန် စောင့်နေပါသည်'}
              </h3>
            </div>
          </div>
          <AuraBeacon state={robotState} size="sm" showLabel={false} />
        </div>

        {/* Power Supply & Wi-Fi */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-slate block">ပါဝါ & IP လိပ်စာ</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm sm:text-base font-bold font-mono text-amber-600 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>USB 5V DC</span>
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-600">
                {device?.ipAddress || (isConnected ? 'Connected' : 'Offline')}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
              device?.status === 'online' || isConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {device?.status === 'online' || isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        {/* Volume Live Slider */}
        <div className="p-5 rounded-3xl glass-card space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-void">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>စက်ရုပ် အသံကျယ်မှု: {volume}%</span>
            </span>
            {volumeMutation.isPending && (
              <span className="text-[10px] text-primary animate-pulse">သိမ်းဆည်းနေသည်...</span>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-neutral-border rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Featured Stories & Songs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-void flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>ပုံပြင်နှင့် သီချင်းများ</span>
            </h2>
            <p className="text-xs text-neutral-slate">
              ကလစ်တစ်ချက် နှိပ်လိုက်ရုံဖြင့် စက်ရုပ်စပီကာမှ တိုက်ရိုက် ဖွင့်ပြပါမည်။
            </p>
          </div>
          <Link
            to="/audio"
            className="text-xs font-semibold text-primary hover:underline"
          >
            ပုံပြင်အားလုံး ({featuredStories.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredStories.map((story) => {
            const isThisPlaying = activeStoryPlaying === story.id;
            return (
              <div
                key={story.id}
                className={`p-5 rounded-3xl glass-card border flex flex-col justify-between space-y-4 transition-all duration-200 group ${
                  isThisPlaying ? 'ring-2 ring-primary border-transparent shadow-glow-violet' : 'border-neutral-border hover:border-primary/40'
                }`}
              >
                <div className="space-y-3">
                  <div
                    className={`h-24 rounded-2xl bg-gradient-to-tr ${story.color} flex items-center justify-center text-white shadow-sm relative overflow-hidden`}
                  >
                    <BookOpen className="w-8 h-8 opacity-80" />
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white">
                      {story.duration}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                      {story.category}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-void group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-neutral-slate line-clamp-2 mt-1">
                      {story.description}
                    </p>
                  </div>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => {
                    if (isThisPlaying) {
                      stopMutation.mutate();
                    } else {
                      playMutation.mutate(story.id);
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isThisPlaying
                      ? 'bg-rose-500 text-white shadow-md animate-pulse'
                      : 'btn-primary text-white'
                  }`}
                >
                  {isThisPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>စက်ရုပ်မှာ ရပ်မည်</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>စက်ရုပ်မှာ ဖွင့်ပြပါ</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two Columns: Dynamic Reminders & Live Hardware Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dynamic Reminders & Alarms from MongoDB */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-neutral-void">
                အချိန်ဇယား သတိပေးသံများ (Active Alarms)
              </h3>
            </div>
            <Link to="/reminders" className="text-xs font-semibold text-primary hover:underline">
              သတိပေးချက်အသစ်ထည့်ရန် →
            </Link>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-canvas-light border border-neutral-border space-y-2">
                <Clock className="w-8 h-8 text-neutral-slate mx-auto" />
                <p className="text-xs text-neutral-slate">လက်ရှိ သတိပေးချက် မရှိသေးပါ။</p>
                <Link
                  to="/reminders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>သတိပေးချက် အသစ် ဖန်တီးမည်</span>
                </Link>
              </div>
            ) : (
              reminders.slice(0, 4).map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-2xl bg-canvas-light border border-neutral-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-primary block font-mono">
                      {rem.scheduledAt ? formatDate(rem.scheduledAt) : 'သတ်မှတ်ချိန်'}
                    </span>
                    <p className="font-semibold text-neutral-void">{rem.title}</p>
                    <p className="text-[11px] text-neutral-slate">
                      {rem.recurrence !== 'none' ? `ထပ်ခါ: ${rem.recurrence}` : 'တစ်ကြိမ်သာ'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                      rem.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-border/60 text-neutral-slate'
                    }`}
                  >
                    {rem.status === 'active' ? 'ဖွင့်ထားသည်' : rem.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Live Hardware & Telemetry Status */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-neutral-void">
                ESP32-S3 Hardware Specifications
              </h3>
            </div>
            {activeDeviceId && (
              <Link
                to={`/devices/${activeDeviceId}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>စက်ပိုင်းဆိုင်ရာ ပြင်ဆင်ရန် →</span>
              </Link>
            )}
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-canvas-light border border-neutral-border space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-slate">Device Name:</span>
                <span className="font-bold text-neutral-void font-sans">
                  {device?.name || 'Smart Family AI Robot'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">Hardware:</span>
                <span className="font-semibold text-neutral-void">
                  {device?.hardwareVersion || 'ESP32-S3-WROOM-1 (Dual-Core 240MHz)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">Firmware:</span>
                <span className="font-semibold text-neutral-void">
                  v{device?.firmwareVersion || '1.0.0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">MAC Address:</span>
                <span className="font-semibold text-neutral-void">
                  {device?.macAddress || '1C:29:04:3F:9A:D0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">Public / LAN IP:</span>
                <span className="font-semibold text-emerald-600">
                  {device?.ipAddress || '103.116.57.154'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">RAM Free Heap:</span>
                <span className="font-semibold text-neutral-void">
                  {telemetry?.freeHeap ? `${Math.round(telemetry.freeHeap / 1024)} KB` : '184 KB'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-slate">Audio Pipeline:</span>
                <span className="font-semibold text-neutral-void">
                  16kHz 16-bit Mono (Direct RFC 6455)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="font-sans font-semibold text-xs">
                  {device?.status === 'online' || isConnected
                    ? 'Robot Gateway Status: LIVE & READY'
                    : 'Robot Gateway Status: Awaiting Connection'}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {device?.status === 'online' || isConnected ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
