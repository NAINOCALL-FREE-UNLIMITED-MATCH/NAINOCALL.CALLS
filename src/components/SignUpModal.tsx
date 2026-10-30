import React, { useState, useMemo } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, MapPin, Check, Heart, User, Calendar, Flame } from 'lucide-react';
import { UserProfile } from '../types/user';
import { EighteenPlusPolicyModal } from './EighteenPlusPolicyModal';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  defaultCity?: string;
}

const INTERESTS_LIST = [
  '☕ Coffee',
  '🎵 Music',
  '🎬 Movies',
  '✈️ Travel',
  '📸 Photography',
  '🏋️ Fitness',
  '🍕 Foodie',
  '🎨 Art & Design',
  '💻 Tech',
  '📚 Books',
  '🌅 Sunsets',
  '🐶 Pets',
];

const AVATAR_OPTIONS = [
  { id: '1', label: 'Classic Red', bg: 'from-rose-500 to-orange-400' },
  { id: '2', label: 'Electric Violet', bg: 'from-purple-500 to-indigo-600' },
  { id: '3', label: 'Teal Oasis', bg: 'from-teal-400 to-emerald-600' },
  { id: '4', label: 'Sunset Amber', bg: 'from-amber-400 to-rose-500' },
  { id: '5', label: 'Ocean Blue', bg: 'from-blue-500 to-cyan-500' },
];

function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  defaultCity = 'Mumbai, India',
}) => {
  const isEditing = !!initialProfile;

  const [name, setName] = useState(initialProfile?.name || '');
  const [birthDate, setBirthDate] = useState(initialProfile?.birthDate || '2001-05-15');
  const [gender, setGender] = useState<UserProfile['gender']>(initialProfile?.gender || 'female');
  const [lookingFor, setLookingFor] = useState<UserProfile['lookingFor']>(initialProfile?.lookingFor || 'everyone');
  const [bio, setBio] = useState(
    initialProfile?.bio || 'Passionate about live video dates, coffee talks & spontaneous weekend trips.'
  );
  const [city, setCity] = useState(initialProfile?.city || defaultCity.split(',')[0].trim());
  const [country, setCountry] = useState(initialProfile?.country || 'India');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialProfile?.interests || ['☕ Coffee', '🎵 Music', '✈️ Travel']
  );
  const [avatarTheme, setAvatarTheme] = useState(AVATAR_OPTIONS[0].bg);
  const [agreed18Plus, setAgreed18Plus] = useState(initialProfile?.agreedTo18PlusPolicy ?? false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const calculatedAge = useMemo(() => calculateAge(birthDate), [birthDate]);
  const is18OrOlder = calculatedAge >= 18;

  if (!isOpen) return null;

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your display name.');
      return;
    }

    if (!birthDate) {
      setFormError('Please enter your date of birth for 18+ verification.');
      return;
    }

    if (!is18OrOlder) {
      setFormError(`You must be 18 or older to join NAINO CALL. (Calculated age: ${calculatedAge})`);
      return;
    }

    if (!agreed18Plus) {
      setFormError('You must review and agree to the 18+ Safety & Age Policy.');
      return;
    }

    const newProfile: UserProfile = {
      id: initialProfile?.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      age: calculatedAge,
      birthDate,
      gender,
      lookingFor,
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      interests: selectedInterests,
      is18PlusVerified: true,
      agreedTo18PlusPolicy: true,
      policyAgreedAt: Date.now(),
      registeredAt: initialProfile?.registeredAt || Date.now(),
    };

    onSaveProfile(newProfile);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white shrink-0 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 shadow-md">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-none">
                    {isEditing ? 'Edit Profile & Verification' : '18+ Member Sign Up'}
                  </h2>
                  <p className="text-xs text-rose-100 font-medium mt-1">
                    Verified Adult Live Video Dating & Meetups
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 18+ Badge banner */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Strict 18+ Adult Policy Enforced</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Avatar Theme Selection */}
            <div className="flex flex-col items-center justify-center gap-2 pt-1">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-tr ${avatarTheme} p-1 shadow-lg flex items-center justify-center text-white text-2xl font-black`}
              >
                <div className="w-full h-full rounded-full bg-black/10 flex items-center justify-center">
                  {name ? name.slice(0, 2).toUpperCase() : '18+'}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatarTheme(opt.bg)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${opt.bg} transition-transform cursor-pointer ${
                      avatarTheme === opt.bg ? 'ring-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aishwarya or Alex"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Date of Birth & Age Verification Gate */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Date of Birth (18+ Verification)</span>
                </label>
                {birthDate && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      is18OrOlder
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {is18OrOlder ? `Verified: ${calculatedAge} yrs` : `Underage: ${calculatedAge} yrs`}
                  </span>
                )}
              </div>

              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
              />

              {!is18OrOlder && birthDate && (
                <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>You must be at least 18 years old to use NAINO CALL.</span>
                </div>
              )}
            </div>

            {/* Gender & Looking For */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">I am</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as UserProfile['gender'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="female">Woman</option>
                  <option value="male">Man</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Looking to meet</label>
                <select
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value as UserProfile['lookingFor'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="everyone">Everyone</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                </select>
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">About Me (Bio)</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your vibe, hobbies, or what makes you smile..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Interests & Passions</label>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS_LIST.map((item) => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleInterest(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 18+ Mandatory Policy Agreement */}
            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreed18Plus}
                  onChange={(e) => setAgreed18Plus(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-white border-slate-300 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  I certify under penalty of perjury that I am <strong>18 years of age or older</strong>. I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPolicyModal(true);
                    }}
                    className="text-rose-600 font-bold underline hover:text-rose-800 cursor-pointer"
                  >
                    18+ Adult Policy & Community Guidelines
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!is18OrOlder || !agreed18Plus}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isEditing ? 'Save 18+ Verified Profile' : 'Complete 18+ Member Sign Up'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 18+ Policy Modal Viewer */}
      <EighteenPlusPolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        showAgreeButton={!agreed18Plus}
        onAgree={() => setAgreed18Plus(true)}
      />
    </>
  );
};
