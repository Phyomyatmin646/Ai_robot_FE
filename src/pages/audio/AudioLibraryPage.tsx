import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Volume2,
  Square,
  Trash2,
  Clock,
  BookOpen,
  Sparkles,
  Heart,
  Upload,
  Music,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { audioApi } from '../../api/audio.api';
import { useSocket } from '../../context/SocketContext';
import { formatDuration } from '../../utils/cn';
import {
  saveAudioTrack,
  getCustomAudioTracks,
  getAudioBlobUrl,
  deleteAudioTrack,
  type CustomAudioTrack,
} from '../../utils/audioStorage';

interface DisplayAudioTrack {
  id: string;
  fileName: string;
  englishName?: string;
  category: string;
  duration: number;
  fileSize: number;
  description: string;
  audioType: string;
  isCustom?: boolean;
}

export const AudioLibraryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeDeviceId, socket } = useSocket();

  const [currentBrowserAudio, setCurrentBrowserAudio] = useState<string | null>(null);
  const [isPlayingBrowser, setIsPlayingBrowser] = useState(false);
  const [playingOnRobotId, setPlayingOnRobotId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form states for upload modal
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('stories');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDuration, setUploadDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default children stories & audio tracks
  const defaultChildrenAudios: DisplayAudioTrack[] = [
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

  // Load custom/uploaded tracks from IndexedDB
  const { data: customTracks = [], refetch: refetchCustomTracks } = useQuery({
    queryKey: ['custom-audio-tracks'],
    queryFn: getCustomAudioTracks,
  });

  // Query server audio files
  const { data: serverAudiosRes } = useQuery({
    queryKey: ['server-audios'],
    queryFn: () => audioApi.getAudioList().catch(() => null),
    retry: false,
  });

  const serverTracks: DisplayAudioTrack[] = (serverAudiosRes?.data || []).map((item) => ({
    id: item.id,
    fileName: item.fileName,
    category: (item.audioType as string) || 'stories',
    duration: item.duration || 120,
    fileSize: item.fileSize || 1024000,
    description: 'Cloud Backend Audio Track',
    audioType: item.audioType,
    isCustom: true,
  }));

  // Combine custom tracks, server tracks, and default tracks
  const allTracks: DisplayAudioTrack[] = [
    ...customTracks.map((t) => ({ ...t, isCustom: true })),
    ...serverTracks.filter((st) => !customTracks.some((ct) => ct.id === st.id)),
    ...defaultChildrenAudios,
  ];

  // Play on Robot Mutation
  const playOnRobotMutation = useMutation({
    mutationFn: async (id: string) => {
      const targetDevice = activeDeviceId || 'esp32_demo_1';
      // Attempt backend API call
      try {
        await audioApi.playOnDevice(id, targetDevice);
      } catch (err) {
        console.warn('Backend API playOnDevice unreachable, emitting direct socket command:', err);
      }
      // Also emit via Socket.IO if connected
      if (socket?.connected) {
        socket.emit('device:play_audio', {
          deviceId: targetDevice,
          audioId: id,
          streamUrl: audioApi.getStreamUrl(id),
        });
      }
      return id;
    },
    onSuccess: (id) => {
      setPlayingOnRobotId(id);
    },
  });

  // Stop Robot Playback Mutation
  const stopOnRobotMutation = useMutation({
    mutationFn: async () => {
      const targetDevice = activeDeviceId || 'esp32_demo_1';
      try {
        await audioApi.stopOnDevice(targetDevice);
      } catch (err) {
        console.warn('Backend API stopOnDevice unreachable:', err);
      }
      if (socket?.connected) {
        socket.emit('device:stop_audio', { deviceId: targetDevice });
      }
    },
    onSuccess: () => {
      setPlayingOnRobotId(null);
    },
  });

  // Handle in-browser audio preview
  const handleToggleBrowserPlay = async (audioId: string) => {
    if (currentBrowserAudio === audioId && isPlayingBrowser) {
      audioRef.current?.pause();
      setIsPlayingBrowser(false);
      return;
    }

    setCurrentBrowserAudio(audioId);

    if (audioRef.current) {
      // 1. Try local IndexedDB blob URL first
      const localUrl = await getAudioBlobUrl(audioId);
      if (localUrl) {
        audioRef.current.src = localUrl;
        audioRef.current.play().catch((err) => {
          console.warn('Audio play failed:', err);
          setIsPlayingBrowser(false);
        });
        setIsPlayingBrowser(true);
        return;
      }

      // 2. Fallback to server stream URL
      const streamUrl = audioApi.getStreamUrl(audioId);
      audioRef.current.src = streamUrl;
      audioRef.current
        .play()
        .then(() => setIsPlayingBrowser(true))
        .catch(() => {
          console.log('Server stream preview unavailable for:', audioId);
          setIsPlayingBrowser(false);
        });
    }
  };

  // Handle file selection and read duration
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    if (!uploadTitle) {
      // Auto-populate title from filename without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setUploadTitle(nameWithoutExt);
    }

    // Determine audio duration via browser Audio object
    const tempUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(tempUrl);
    tempAudio.onloadedmetadata = () => {
      setUploadDuration(Math.round(tempAudio.duration));
      URL.revokeObjectURL(tempUrl);
    };
    tempAudio.onerror = () => {
      URL.revokeObjectURL(tempUrl);
    };
  };

  // Submit audio upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('ကျေးဇူးပြု၍ Audio ဖိုင်တစ်ခု ရွေးချယ်ပေးပါ');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('ကျေးဇူးပြု၍ အသံဖိုင် / ပုံပြင်အမည် ထည့်ပေးပါ');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    const trackId = `custom_audio_${Date.now()}`;
    const newTrack: CustomAudioTrack = {
      id: trackId,
      fileName: uploadTitle.trim(),
      englishName: uploadFile.name,
      category: uploadCategory,
      duration: uploadDuration || 120,
      fileSize: uploadFile.size,
      description: uploadDesc.trim() || 'အသုံးပြုသူ ကိုယ်တိုင် တင်သွင်းထားသော အသံဖိုင်',
      audioType: uploadCategory,
      createdAt: Date.now(),
      isCustom: true,
    };

    try {
      // 1. Save track and blob in client's IndexedDB for persistence
      await saveAudioTrack(newTrack, uploadFile);

      // 2. Attempt uploading to backend API if reachable
      try {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', uploadTitle);
        formData.append('category', uploadCategory);
        formData.append('duration', String(uploadDuration || 0));
        await audioApi.uploadAudio(formData);
      } catch (backendErr) {
        console.warn('Backend upload skipped (will use client-stored copy):', backendErr);
      }

      setUploadSuccess(true);
      await refetchCustomTracks();

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDesc('');
        setUploadDuration(0);
      }, 1000);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'အသံဖိုင် သိမ်းဆည်းရာတွင် အမှားဖြစ်သွားပါသည်');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete custom audio track
  const handleDeleteCustomAudio = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('ဤအသံဖိုင်ကို စာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား?')) {
      if (currentBrowserAudio === id) {
        audioRef.current?.pause();
        setIsPlayingBrowser(false);
        setCurrentBrowserAudio(null);
      }
      await deleteAudioTrack(id);
      try {
        await audioApi.deleteAudio(id);
      } catch {}
      await refetchCustomTracks();
      queryClient.invalidateQueries({ queryKey: ['server-audios'] });
    }
  };

  const filteredAudios = allTracks.filter((a) => {
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
            <span>ကလေးပုံပြင်များနှင့် သီချင်းများ (Audio Library)</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-sm text-neutral-slate">
            "စက်ရုပ်မှာ ဖွင့်ပါ" ခလုတ်ကို နှိပ်လိုက်ရုံဖြင့် စက်ရုပ်၏ စပီကာမှ တိုက်ရိုက် အသံထွက် ဖွင့်ပြပေးပါမည်။
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
            onClick={() => {
              setUploadError(null);
              setUploadSuccess(false);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>အသံဖိုင် / ပုံပြင်အသစ် တင်မည်</span>
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
          { id: 'parent_voice', label: 'မိဘအသံ (Parent Voice)' },
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
                isRobotPlaying
                  ? 'ring-2 ring-primary border-transparent shadow-glow-violet'
                  : 'border-neutral-border hover:border-primary/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
                      {audio.category === 'lullaby' ? (
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                      ) : audio.category === 'parent_voice' ? (
                        <Heart className="w-6 h-6 text-rose-500" />
                      ) : audio.category === 'learning' ? (
                        <Music className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    {audio.isCustom && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-neutral-slate flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(audio.duration)}</span>
                    </span>

                    {audio.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustomAudio(audio.id, e)}
                        className="p-1 text-neutral-slate hover:text-rose-500 transition-colors rounded-lg"
                        title="ဖျက်မည်"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-void">
                    {audio.fileName}
                  </h3>
                  {audio.englishName && (
                    <span className="text-[11px] font-mono text-neutral-slate block mt-0.5">
                      {audio.englishName}
                    </span>
                  )}
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
                  disabled={playOnRobotMutation.isPending && playOnRobotMutation.variables === audio.id}
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
                  className={`p-2.5 rounded-xl btn-glass transition-colors ${
                    isBrowserPlaying ? 'text-primary bg-primary/10' : 'text-neutral-slate hover:text-primary'
                  }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-neutral-void">
                ပုံပြင် သို့မဟုတ် သီချင်းအသစ် တင်မည်
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-neutral-slate hover:text-neutral-void text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-slate">
              မိဘကိုယ်တိုင် အသံသွင်းထားသော အိပ်ရာဝင်ပုံပြင် သို့မဟုတ် MP3/WAV ဖိုင်များကို ထည့်သွင်းနိုင်ပါသည်။ ထည့်သွင်းပြီးပါက Website တွင် ချက်ချင်းပေါ်လာပြီး စက်ရုပ်မှာ ဖွင့်နိုင်ပါမည်။
            </p>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>အသံဖိုင် အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ!</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  ပုံပြင် / သီချင်း အမည် <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="ဥပမာ - မေမေ ပြောပြသော ပုံပြင်လေး"
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  အမျိုးအစား (Category)
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                >
                  <option value="stories">ပုံပြင် (Stories)</option>
                  <option value="lullaby">အိပ်ရာဝင် သံစဉ် (Lullabies)</option>
                  <option value="learning">ပညာပေး သီချင်း (Learning)</option>
                  <option value="parent_voice">မိဘအသံ (Parent Voice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  ဖော်ပြချက် / အညွှန်း (Description)
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="ဥပမာ - ညအိပ်ရာဝင်ချိန် သာယာငြိမ့်ညောင်းစွာ နားဆင်ရန်"
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Audio ဖိုင် ရွေးချယ်ပါ (.mp3 / .wav / .ogg / .m4a) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="w-full p-2.5 rounded-xl bg-canvas-light border border-neutral-border text-xs cursor-pointer"
                />
                {uploadFile && (
                  <p className="text-[11px] text-primary font-mono mt-1">
                    ရွေးချယ်ထားသောဖိုင်: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    {uploadDuration > 0 ? ` • ${formatDuration(uploadDuration)}` : ''})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl btn-glass text-xs"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>တင်နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>တင်မည်</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
