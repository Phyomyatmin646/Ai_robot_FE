import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Sun,
  Moon,
  Sparkles,
  Bot,
  Save,
  Check,
  Shield,
  Heart,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const SettingsPage: React.FC = () => {
  const { activeDeviceId } = useSocket();

  const [volume, setVolume] = useState(80);
  const [nightLight, setNightLight] = useState(true);
  const [lightBrightness, setLightBrightness] = useState(70);
  const [voiceTone, setVoiceTone] = useState('warm_female');
  const [quietHours, setQuietHours] = useState(true);
  const [quietStart, setQuietStart] = useState('21:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-neutral-void flex items-center gap-2">
          <span>စက်ရုပ် အသံနှင့် ညအိပ်မီး ထိန်းချုပ်မှု</span>
          <Sliders className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-neutral-slate">
          ကလေးငယ်များ နားထောင်ရာတွင် သင့်လျော်သော အသံအတိုးအကျယ်၊ ညအိပ်မီးရောင်စုံနှင့် စက်ရုပ်၏ စကားပြောသံကို သတ်မှတ်နိုင်ပါသည်။
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sound Volume & Tone */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-void">စက်ရုပ် အသံအတိုး/အကျယ်</h3>
              <p className="text-xs text-neutral-slate">စက်ရုပ်စပီကာမှ ထွက်မည့် အသံပမာဏ</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-slate">Master Volume:</span>
              <span className="font-bold text-primary font-mono text-sm">{volume}%</span>
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

          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1.5">
              စက်ရုပ်၏ အသံစတိုင်လ် (Robot Voice)
            </label>
            <select
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl input-glass text-xs font-medium"
            >
              <option value="warm_female">ချိုသာနွေးထွေးသော အစ်မကြီးအသံ (Aoede - Warm & Gentle)</option>
              <option value="cheerful_kid">ဖော်ရွေသော ကလေးအဖော်သံ (Puck - Energetic & Friendly)</option>
              <option value="calm_storyteller">အေးချမ်းသော ပုံပြင်ပြောဆရာသံ (Charon - Deep & Calming)</option>
            </select>
          </div>
        </div>

        {/* Night Light & LED */}
        <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-void">ညအိပ်မီးရောင် (Night Light)</h3>
              <p className="text-xs text-neutral-slate">စက်ရုပ်ခေါင်း/ကိုယ်ထည် NeoPixel မီးရောင်</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-void">ညအိပ်မီး ဖွင့်ထားမည်</span>
            <input
              type="checkbox"
              checked={nightLight}
              onChange={(e) => setNightLight(e.target.checked)}
              className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-slate">မီးလင်းအား:</span>
              <span className="font-bold text-amber-600 font-mono text-sm">{lightBrightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lightBrightness}
              onChange={(e) => setLightBrightness(Number(e.target.value))}
              disabled={!nightLight}
              className="w-full accent-amber-500 h-2 bg-neutral-border rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Bedtime Quiet Hours */}
        <div className="col-span-full p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-void">
                  ကလေး အိပ်ချိန် အသံတိတ် စနစ် (Quiet Hours)
                </h3>
                <p className="text-xs text-neutral-slate">
                  ဤအချိန်အတွင်း ကလေးနိုးမသွားစေရန် စက်ရုပ်မှ အချက်ပေးသံများ မထွက်အောင် အလိုအလျောက် တိတ်ဆိတ်ပေးပါမည်။
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={quietHours}
              onChange={(e) => setQuietHours(e.target.checked)}
              className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
            />
          </div>

          {quietHours && (
            <div className="grid grid-cols-2 gap-4 pt-2 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  စတင်မည့်အချိန် (ည)
                </label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  ပြီးဆုံးမည့်အချိန် (မနက်)
                </label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>စက်ရုပ်သို့ ချက်ချင်း သတ်မှတ်ပြီးပါပြီ!</span>
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl btn-primary text-sm font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>စက်ရုပ်သို့ သိမ်းဆည်းမည်</span>
        </button>
      </div>
    </div>
  );
};
