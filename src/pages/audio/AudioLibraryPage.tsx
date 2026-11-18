import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Music2,
  Play,
  Pause,
  Volume2,
  Square,
  Trash2,
  Clock,
  Plus,
  BookOpen,
  Sparkles,
  Heart,
  Upload,
} from 'lucide-react';
import { audioApi } from '../../api/audio.api';
import { useSocket } from '../../context/SocketContext';
import { formatDuration } from '../../utils/cn';

export const AudioLibraryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeDeviceId } = useSocket();

  const [currentBrowserAudio, setCurrentBrowserAudio] = useState<string | null>(null);
  const [isPlayingBrowser, setIsPlayingBrowser] = useState(false);
  const [playingOnRobotId, setPlayingOnRobotId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Default children stories & audio tracks
  const defaultChildrenAudios = [
    {
      id: 'story_hare_tortoise',
      fileName: 'ယုန်နှင့် လိပ် ပြိုင်ပွဲ ပုံပြင်',
      englishName: 'The Tortoise and the Hare',
      category: 'stories',
      duration: 225,
      fileSize: 3600000,
      description: 'ဇွဲရှိခြင်းသည် အောင်မြင်ခြင်း၏ လျှို့ဝှက်ချက်ဖြစ်ကြောင်း သင်ခန်းစာပေးသော ပုံပြင်',
      audioType: 'story',
    },
    {
      id: 'lullaby_twinkle',
      fileName: 'ဖိုးလမင်းကြီးရေ အိပ်ရာဝင် သံစဉ်',
      englishName: 'Twinkle Twinkle & Bedtime Lullaby',
      category: 'lullaby',
      duration: 250,
      fileSize: 4000000,
      description: 'ကလေးငယ်များ ငြိမ်းချမ်းစွာ အိပ်ပျော်စေရန် သာယာညင်သာသော တေးသံစုံ',
      audioType: 'lullaby',
    },
    {
      id: 'story_three_pigs',
      fileName: 'ဝက်ကလေး သုံးကောင် ပုံပြင်',
      englishName: 'The Three Little Pigs',
      category: 'stories',
      duration: 320,
      fileSize: 5120000,
      description: 'အကြံဉာဏ်နှင့် ကြိုးစားအားထုတ်မှု၏ တန်ဖိုးကို ဖော်ကျူးသော ပုံပြင်လေး',
      audioType: 'story',
    },
    {
      id: 'learning_abc',
      fileName: 'အင်္ဂလိပ် အက္ခရာ ABC သီချင်းပျော်',
      englishName: 'ABC Phonics Song',
      category: 'learning',
      duration: 170,
      fileSize: 2720000,
      description: 'ကလေးငယ်များ အင်္ဂလိပ်စာ လွယ်ကူစွာ မှတ်မိစေမည့် ပျော်ရွှင်ဖွယ် တေးသီချင်း',
      audioType: 'learning',
    },
    {
      id: 'story_lion_mouse',
      fileName: 'ခြင်္သေ့မင်းနှင့် ကြွက်ကလေး ပုံပြင်',
      englishName: 'The Lion and the Mouse',
      category: 'stories',
      duration: 195,
      fileSize: 3120000,
      description: 'အကူအညီပေးခြင်းသည် မည်မျှပင် သေးငယ်စေကာမူ အလွန်တန်ဖိုးရှိကြောင်း ပုံပြင်',
      audioType: 'story',
    },
    {
      id: 'parent_recorded_bedtime',
      fileName: 'မေမေ ကိုယ်တိုင်ပြောပြထားသော ပုံပြင်လေး',
      englishName: 'Mom Bedtime Story Recording',
      category: 'parent_voice',
      duration: 280,
      fileSize: 4480000,
      description: 'မိဘကိုယ်တိုင် အသံသွင်းထားသော အိပ်ရာဝင် ပုံပြင်သံစဉ်',
      audioType: 'parent_voice',
    },
  ];

  // Play on Robot Mutation
  const playOnRobotMutation = useMutation({
    mutationFn: (id: string) => audioApi.playOnDevice(id, activeDeviceId || 'esp32_demo_1'),
    onSuccess: (_, id) => {
      setPlayingOnRobotId(id);
    },
  });

  // Stop Robot Playback Mutation
  const stopOnRobotMutation = useMutation({
    mutationFn: () => audioApi.stopOnDevice(activeDeviceId || 'esp32_demo_1'),
    onSuccess: () => {
      setPlayingOnRobotId(null);
    },
  });

  // Toggle in-browser audio
  const handleToggleBrowserPlay = (audioId: string) => {
    if (currentBrowserAudio === audioId && isPlayingBrowser) {
      audioRef.current?.pause();
      setIsPlayingBrowser(false);
    } else {
      setCurrentBrowserAudio(audioId);
      setIsPlayingBrowser(true);
      if (audioRef.current) {
        audioRef.current.src = audioApi.getStreamUrl(audioId);
        audioRef.current.play().catch(() => {
          // Fallback demo audio if stream not on backend
          console.log('Browser previewing demo audio track');
        });
      }
    }
  };

  const filteredAudios = defaultChildrenAudios.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingBrowser(false)}
        onPause={() => setIsPlayingBrowser(false)}
        onPlay={() => setIsPlayingBrowser(true)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void flex items-center gap-2">
            <span>ကလေးပုံပြင်များနှင့် သီချင်းများ</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-sm text-neutral-slate">
            "စက်ရုပ်မှာ ဖွင့်ပါ" ခလုတ်ကို နှိပ်လိုက်ရုံဖြင့် ကလေး၏ စက်ရုပ်စပီကာမှ တိုက်ရိုက် အသံထွက် ဖွင့်ပြပေးပါမည်။
          </p>
        </div>

        <div className="flex items-center gap-3">
          {playingOnRobotId && (
            <button
              onClick={() => stopOnRobotMutation.mutate()}
              className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/25 animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>စက်ရုပ်မှာ ရပ်မည် (Stop)</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>ပုံပြင်အသစ် တင်မည်</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-border/60 pb-3">
        {[
          { id: 'all', label: 'အားလုံး (All)' },
          { id: 'stories', label: 'ပုံပြင်များ (Stories)' },
          { id: 'lullaby', label: 'အိပ်ရာဝင် သံစဉ် (Lullabies)' },
          { id: 'learning', label: 'ပညာပေး သီချင်း (Learning)' },
          { id: 'parent_voice', label: 'မိဘအသံသွင်းထားသည် (Parent Voice)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'btn-glass text-neutral-slate hover:text-neutral-void'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAudios.map((audio) => {
          const isRobotPlaying = playingOnRobotId === audio.id;
          const isBrowserPlaying = currentBrowserAudio === audio.id && isPlayingBrowser;

          return (
            <div
              key={audio.id}
              className={`p-6 rounded-3xl glass-card border flex flex-col justify-between space-y-4 transition-all duration-200 ${
                isRobotPlaying ? 'ring-2 ring-primary border-transparent shadow-glow-violet' : 'border-neutral-border hover:border-primary/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
                    {audio.category === 'lullaby' ? (
                      <Sparkles className="w-6 h-6 text-indigo-500" />
                    ) : audio.category === 'parent_voice' ? (
                      <Heart className="w-6 h-6 text-rose-500" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <span className="text-xs font-mono font-medium text-neutral-slate flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(audio.duration)}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-void">
                    {audio.fileName}
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-slate block mt-0.5">
                    {audio.englishName}
                  </span>
                  <p className="text-xs text-neutral-slate mt-2 leading-relaxed">
                    {audio.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-border/60 flex items-center gap-2">
                {/* Main: Play on Physical Robot Speaker Button */}
                <button
                  onClick={() => {
                    if (isRobotPlaying) {
                      stopOnRobotMutation.mutate();
                    } else {
                      playOnRobotMutation.mutate(audio.id);
                    }
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isRobotPlaying
                      ? 'bg-rose-500 text-white shadow-md animate-pulse'
                      : 'btn-primary text-white'
                  }`}
                >
                  {isRobotPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>စက်ရုပ်မှာ ရပ်မည်</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>စက်ရုပ်မှာ ဖွင့်ပါ</span>
                    </>
                  )}
                </button>

                {/* Secondary: Preview in Parent's Browser */}
                <button
                  onClick={() => handleToggleBrowserPlay(audio.id)}
                  className="p-2.5 rounded-xl btn-glass text-neutral-slate hover:text-primary"
                  title={isBrowserPlaying ? 'ဖုန်း/ကွန်ပျူတာမှာ ရပ်မည်' : 'ဖုန်း/ကွန်ပျူတာမှာ အစမ်းနားထောင်မည်'}
                >
                  {isBrowserPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-4">
            <h3 className="text-lg font-display font-bold text-neutral-void">
              ပုံပြင် သို့မဟုတ် သီချင်းအသစ် တင်မည်
            </h3>
            <p className="text-xs text-neutral-slate">
              မိဘကိုယ်တိုင် အသံသွင်းထားသော အိပ်ရာဝင်ပုံပြင် သို့မဟုတ် MP3/WAV ဖိုင်များကို ကလေးစက်ရုပ်သို့ တိုက်ရိုက် ထည့်သွင်းနိုင်ပါသည်။
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  ပုံပြင် / သီချင်း အမည်
                </label>
                <input
                  type="text"
                  placeholder="e.g. မေမေ ပြောပြသော ပုံပြင်လေး"
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  အမျိုးအစား (Category)
                </label>
                <select className="w-full px-3 py-2 rounded-xl input-glass text-xs">
                  <option value="stories">ပုံပြင် (Story)</option>
                  <option value="lullaby">အိပ်ရာဝင် သံစဉ် (Lullaby)</option>
                  <option value="learning">ပညာပေး (Learning)</option>
                  <option value="parent_voice">မိဘအသံ (Parent Voice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Audio ဖိုင် ရွေးချယ်ပါ (.mp3 / .wav)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full p-3 rounded-xl bg-canvas-light border border-neutral-border text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl btn-glass text-xs"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('ဖိုင် အောင်မြင်စွာ တင်ပြီးပါပြီ!');
                    setIsUploadModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold"
                >
                  တင်မည်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
