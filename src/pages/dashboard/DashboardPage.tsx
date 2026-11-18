import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Bot,
  Play,
  Pause,
  Square,
  Volume2,
  Moon,
  Sun,
  Clock,
  Sparkles,
  BookOpen,
  Music,
  Heart,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { audioApi } from '../../api/audio.api';
import { settingsApi } from '../../api/settings.api';
import { remindersApi } from '../../api/reminders.api';
import { AuraBeacon } from '../../components/hud/AuraBeacon';
import { WaveformVisualizer } from '../../components/hud/WaveformVisualizer';
import { formatDuration } from '../../utils/cn';

export const DashboardPage: React.FC = () => {
  const { isConnected, robotState, telemetry, activeDeviceId } = useSocket();

  const [activeStoryPlaying, setActiveStoryPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [nightLight, setNightLight] = useState(true);

  // Play on Robot Mutation
  const playMutation = useMutation({
    mutationFn: (id: string) => audioApi.playOnDevice(id, activeDeviceId || 'esp32_demo_1'),
    onSuccess: (_, id) => {
      setActiveStoryPlaying(id);
    },
  });

  // Stop Robot Mutation
  const stopMutation = useMutation({
    mutationFn: () => audioApi.stopOnDevice(activeDeviceId || 'esp32_demo_1'),
    onSuccess: () => {
      setActiveStoryPlaying(null);
    },
  });

  // Featured Stories & Rhymes list for Kids
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

  // Kids Recent Voice Queries
  const recentKidsChats = [
    {
      question: 'မေမေရေ... ကောင်းကင်ကြီးက ဘာလို့ ပြာတာလဲဟင်?',
      robotAnswer: 'နေရောင်ခြည်ထဲက အပြာရောင်အလင်းတန်းလေးတွေက လေထုထဲမှာ ပြန့်လွင့်သွားလို့ ကောင်းကင်ကြီး ပြာနေတာပါ ကလေးလေးရေ...',
      time: '၁၀ မိနစ်ခန့်က',
    },
    {
      question: 'ငှက်ကလေးတွေ ဘယ်လို ပျံသန်းကြတာလဲ?',
      robotAnswer: 'ငှက်ကလေးတွေမှာ အလွန်ပေါ့ပါးတဲ့ အရိုးတွေနဲ့ အတောင်ပံတွေရှိလို့ လေထဲကို ဟပ်ပြီး လှပစွာ ပျံသန်းနိုင်ကြတာ ဖြစ်ပါတယ်!',
      time: '၁ နာရီခန့်က',
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
                <span>Kids AI Robot Companion</span>
              </span>
              <span className="text-xs text-neutral-slate font-medium">
                Parent Controller
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-void tracking-tight">
              ကလေးတို့ရဲ့ အဖော်မွန် စက်ရုပ်လေး
            </h1>
            <p className="text-sm text-neutral-slate max-w-xl">
              ကလေးများအတွက် အိပ်ရာဝင်ပုံပြင်၊ ပျော်ရွှင်ဖွယ် ကလေးတေးသီချင်းများနှင့် မေးခွန်းများကို စက်ရုပ်မှ တိုက်ရိုက် အသံထွက် ဖွင့်ပြနိုင်ပါသည်။
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
                <span>ပုံပြင်များ အားလုံးကြည့်မည်</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Robot Status & Fast Control Bar */}
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
                {robotState === 'speaking' ? 'ပုံပြင် ဖွင့်နေပါသည်' : robotState === 'listening' ? 'ကလေး စကားနားထောင်နေသည်' : 'ဖွင့်ရန် အသင့်ရှိပါသည်'}
              </h3>
            </div>
          </div>
          <AuraBeacon state={robotState} size="sm" showLabel={false} />
        </div>

        {/* Power Supply & Wi-Fi */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-slate block">ပါဝါ & Wi-Fi လိုင်း</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-amber-600 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>USB 5V DC</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                ● {telemetry?.wifiRSSI ? `${telemetry.wifiRSSI} dBm` : 'Wi-Fi ချိတ်ဆက်ပြီး'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            ONLINE
          </div>
        </div>

        {/* Volume & Night Light Quick Sliders */}
        <div className="p-5 rounded-3xl glass-card space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-void">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>စက်ရုပ် အသံကျယ်မှု: {volume}%</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-neutral-border rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Featured Stories & Songs for Kids */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-void flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>ကလေးများအတွက် ပုံပြင်နှင့် သီချင်းများ</span>
            </h2>
            <p className="text-xs text-neutral-slate">
              ကလစ်တစ်ချက် နှိပ်လိုက်ရုံဖြင့် စက်ရုပ်စပီကာမှ ကလေးငယ်များအတွက် တိုက်ရိုက် ဖွင့်ပြပါမည်။
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

      {/* 4. Two Columns: Daily Kid Routine & Questions Asked by Child */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Daily Routine & Chime Alarms */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-neutral-void">
                ကလေး နေ့စဉ်အချိန်ဇယား သတိပေးသံများ
              </h3>
            </div>
            <Link to="/reminders" className="text-xs font-semibold text-primary hover:underline">
              အချိန်ပြင်ရန် →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                time: 'ည ၈:၃၀',
                label: 'အိပ်ရာဝင်ချိန် သတိပေးသံ (Bedtime)',
                detail: 'စက်ရုပ်မှ ငြိမ်းချမ်းသော အိပ်ရာဝင် သံစဉ် တီးပေးမည်',
                active: true,
              },
              {
                time: 'မနက် ၇:၀၀',
                label: 'မနက်နိုးချိန် သတိပေးသံ (Wake Up)',
                detail: 'ဖော်ရွေသော မနက်ခင်း တေးသံဖြင့် နှိုးပေးမည်',
                active: true,
              },
              {
                time: 'ညနေ ၅:၀၀',
                label: 'စာဖတ်ချိန် / ပုံပြင်နားထောင်ချိန်',
                detail: 'ပုံပြင်အသစ် နားထောင်ရန် သတိပေးမည်',
                active: true,
              },
            ].map((routine, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-canvas-light border border-neutral-border flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-primary block">{routine.time}</span>
                  <p className="font-semibold text-neutral-void">{routine.label}</p>
                  <p className="text-[11px] text-neutral-slate">{routine.detail}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  ဖွင့်ထားသည်
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: What Child Asked the Robot */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h3 className="text-base font-bold text-neutral-void">
                ကလေး မေးထားသော မေးခွန်းများ
              </h3>
            </div>
            <Link to="/conversations" className="text-xs font-semibold text-primary hover:underline">
              စကားပြောမှတ်တမ်း အကုန်ကြည့်ရန် →
            </Link>
          </div>

          <div className="space-y-3">
            {recentKidsChats.map((chat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-canvas-light border border-neutral-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-slate text-[10px]">
                  <span>ကလေး မေးခွန်း:</span>
                  <span>{chat.time}</span>
                </div>
                <p className="font-bold text-neutral-void">"{chat.question}"</p>
                <div className="p-2.5 rounded-xl bg-white border border-neutral-border text-neutral-slate mt-1 text-[11px] leading-relaxed">
                  <span className="font-semibold text-primary">စက်ရုပ် ဖြေကြားချက်: </span>
                  {chat.robotAnswer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
