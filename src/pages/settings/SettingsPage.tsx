import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Volume2,
  Sun,
  Moon,
  Sparkles,
  Bot,
  Save,
  Check,
  Send,
  MessageSquare,
  Unlink,
  Link2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { settingsApi } from '../../api/settings.api';

export const SettingsPage: React.FC = () => {
  const { activeDeviceId } = useSocket();
  const { user, updateUser } = useAuth();

  const [volume, setVolume] = useState(80);
  const [nightLight, setNightLight] = useState(true);
  const [lightBrightness, setLightBrightness] = useState(70);
  const [voiceTone, setVoiceTone] = useState('warm_female');
  const [quietHours, setQuietHours] = useState(true);
  const [quietStart, setQuietStart] = useState('21:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Telegram Linking State
  const [telegramInput, setTelegramInput] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);

  // Sync initial settings from active device if available
  useEffect(() => {
    if (!activeDeviceId) return;
    settingsApi
      .getDeviceSettings(activeDeviceId)
      .then((res) => {
        if (res.data) {
          if (res.data.sound?.masterVolume !== undefined) setVolume(res.data.sound.masterVolume);
          if (res.data.display?.brightness !== undefined) {
            setLightBrightness(res.data.display.brightness);
            setNightLight(res.data.display.brightness > 0);
          }
        }
      })
      .catch(() => {});
  }, [activeDeviceId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeDeviceId) {
        await settingsApi.updateDeviceSettings(activeDeviceId, {
          sound: {
            masterVolume: volume,
            isMuted: volume === 0,
            outputVolume: volume,
            notificationVolume: volume,
            feedbackSoundsEnabled: true,
          },
          display: {
            brightness: nightLight ? lightBrightness : 0,
            isOn: nightLight && lightBrightness > 0,
            sleepTimeoutSeconds: 300,
            theme: 'dark',
          },
        });
      }

      await settingsApi.updateUserSettings({
        notifications: {
          quietHoursEnabled: quietHours,
          quietHoursStart: quietStart,
          quietHoursEnd: quietEnd,
          telegramEnabled: Boolean(user?.telegramChatId),
          emailEnabled: false,
          reminderNotifications: true,
          todoNotifications: true,
          deviceAlerts: true,
          dailySummary: false,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!telegramInput.trim()) {
      setTelegramError('ကျေးဇူးပြု၍ Telegram Chat ID ထည့်သွင်းပါ');
      return;
    }
    setTelegramLoading(true);
    setTelegramError(null);
    setTelegramSuccess(null);
    try {
      await authApi.linkTelegram(telegramInput.trim());
      updateUser({ telegramChatId: telegramInput.trim() });
      setTelegramSuccess('Telegram Bot သို့ အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ!');
      setTelegramInput('');
    } catch (err: any) {
      setTelegramError(err?.response?.data?.message || 'Telegram ချိတ်ဆက်မှု မအောင်မြင်ပါ။ Chat ID မှန်ကန်မှု ရှိမရှိ စစ်ဆေးပါ။');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!confirm('Telegram Bot ချိတ်ဆက်မှုကို ဖြုတ်ရန် သေချာပါသလား?')) return;
    setTelegramLoading(true);
    setTelegramError(null);
    setTelegramSuccess(null);
    try {
      await authApi.unlinkTelegram();
      updateUser({ telegramChatId: undefined });
      setTelegramSuccess('Telegram ချိတ်ဆက်မှုကို ဖယ်ရှားပြီးပါပြီ');
    } catch (err: any) {
      setTelegramError(err?.response?.data?.message || 'Telegram ဖြုတ်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်');
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-neutral-void flex items-center gap-2">
          <span>စက်ရုပ် အသံ၊ မီးရောင် နှင့် အသိပေးချက် ထိန်းချုပ်မှု</span>
          <Sliders className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-neutral-slate">
          စက်ရုပ်၏ အသံအတိုးအကျယ်၊ ညအိပ်မီးရောင်စုံ၊ အသံစတိုင်လ်နှင့် Telegram Bot အချက်ပေးစနစ်များကို ဤနေရာတွင် စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်။
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

        {/* Telegram Bot Integration Card */}
        <div className="col-span-full p-6 rounded-3xl glass-card border border-neutral-border space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-void flex items-center gap-2">
                  <span>Telegram Bot အသိပေးချက် စနစ်</span>
                  {user?.telegramChatId ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ချိတ်ဆက်ထားပြီး (Linked)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-border/60 text-neutral-slate">
                      မချိတ်ဆက်ရသေးပါ
                    </span>
                  )}
                </h3>
                <p className="text-xs text-neutral-slate">
                  Todo List များနှင့် Reminders အချိန်ရောက်တိုင်း သင့်ဖုန်း Telegram Bot ထံသို့ အသိပေးချက်များ တိုက်ရိုက် ရောက်ရှိစေမည်။
                </p>
              </div>
            </div>
          </div>

          {telegramSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{telegramSuccess}</span>
            </div>
          )}

          {telegramError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{telegramError}</span>
            </div>
          )}

          {user?.telegramChatId ? (
            <div className="p-4 rounded-2xl bg-canvas-light border border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-slate uppercase tracking-wider">
                  ချိတ်ဆက်ထားသော Telegram Chat ID:
                </span>
                <p className="text-sm font-mono font-bold text-neutral-void">
                  {user.telegramChatId}
                </p>
              </div>
              <button
                onClick={handleUnlinkTelegram}
                disabled={telegramLoading}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                <Unlink className="w-4 h-4" />
                <span>{telegramLoading ? 'ဖြုတ်နေသည်...' : 'Telegram ဖြုတ်မည်'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="ဥပမာ: 1234567890 (Telegram Chat ID ထည့်ပါ)"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl input-glass text-xs font-mono"
                />
                <button
                  onClick={handleLinkTelegram}
                  disabled={telegramLoading}
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{telegramLoading ? 'ချိတ်ဆက်နေသည်...' : 'Telegram Bot ချိတ်ဆက်မည်'}</span>
                </button>
              </div>

              {/* Instructions in Myanmar */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs space-y-2 text-neutral-void">
                <p className="font-semibold flex items-center gap-1.5 text-sky-900">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>မိမိ၏ Telegram Chat ID ရှာဖွေနည်း -</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-slate text-[11px] pl-1">
                  <li>Telegram app ကိုဖွင့်ပြီး <code className="px-1.5 py-0.5 bg-white rounded border border-sky-200 text-sky-700 font-mono">@userinfobot</code> သို့ သွားပါ။</li>
                  <li>ထို bot ထံသို့ <code className="px-1.5 py-0.5 bg-white rounded border border-sky-200 text-sky-700 font-mono">/start</code> ပေးပို့ပါ။</li>
                  <li>ပြန်ပို့လာသော <strong className="text-neutral-void">Id:</strong> အောက်ရှိ ဂဏန်းများ (ဥပမာ: <span className="font-mono">712345678</span>) ကို ကူးယူပါ။</li>
                  <li>အထက်ပါအကွက်တွင် ထည့်သွင်းပြီး <strong>"Telegram Bot ချိတ်ဆက်မည်"</strong> ကို နှိပ်ပါ။</li>
                </ol>
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
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl btn-primary text-sm font-semibold flex items-center gap-2"
        >
          {isSaving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'သိမ်းဆည်းနေသည်...' : 'စက်ရုပ်သို့ သိမ်းဆည်းမည်'}</span>
        </button>
      </div>
    </div>
  );
};
