import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Lock, 
  X, 
  Plus, 
  Image, 
  Sparkles,
  Save,
  KeyRound
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // General profile form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profession, setProfession] = useState(user?.profession || 'Student');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  
  // File uploads or preset selection state
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePicture || '');

  // Password reset form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar presets
  const avatarPresets = [
    { name: 'Grape', url: 'https://api.dicebear.com/7.x/initials/svg?seed=Grape&backgroundColor=7c3aed' },
    { name: 'Ocean', url: 'https://api.dicebear.com/7.x/initials/svg?seed=Ocean&backgroundColor=06b6d4' },
    { name: 'Peach', url: 'https://api.dicebear.com/7.x/initials/svg?seed=Peach&backgroundColor=f97316' },
    { name: 'Mint', url: 'https://api.dicebear.com/7.x/initials/svg?seed=Mint&backgroundColor=10b981' },
    { name: 'Rose', url: 'https://api.dicebear.com/7.x/initials/svg?seed=Rose&backgroundColor=f43f5e' }
  ];

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.name);
    setProfilePictureUrl(preset.url);
    setFileObject(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File exceeds 2MB limit!');
        return;
      }
      setFileObject(file);
      setSelectedPreset(null);
      setProfilePictureUrl('');
      toast.success(`Image selected: ${file.name}`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('profession', profession);
    formData.append('organization', organization);
    formData.append('bio', bio);
    formData.append('skills', JSON.stringify(skills));

    if (fileObject) {
      formData.append('profilePicture', fileObject);
    } else if (profilePictureUrl) {
      formData.append('profilePicture', profilePictureUrl);
    }

    const res = await updateProfile(formData);
    setSavingProfile(false);

    if (res.success) {
      toast.success('Profile updated successfully!');
      // reset file selection triggers
      setFileObject(null);
      setSelectedPreset(null);
    } else {
      toast.error(res.message || 'Failed to update profile.');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const getAvatarUrl = (pictureField) => {
    if (pictureField) {
      return pictureField;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=8b5cf6&color=fff&bold=true`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* ── LEFT PANEL: PROFILE PREVIEW CARD ── */}
      <div className="flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col items-center text-center shadow-xl border-t-4 border-primary-500">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md ring-4 ring-primary-500/10 mb-4.5">
            <img
              src={getAvatarUrl(user?.profilePicture)}
              alt={user?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=8b5cf6&color=fff&bold=true`;
              }}
            />
          </div>

          <h3 className="text-lg font-bold text-gray-950 dark:text-white">
            {user?.name}
          </h3>
          <span className="px-3 py-0.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
            {user?.profession || 'Student'}
          </span>

          <p className="text-xs text-gray-500 mt-4 leading-relaxed max-w-xs">
            {user?.bio || 'Add a bio to tell colleagues about your work.'}
          </p>

          <div className="w-full border-t border-gray-100 dark:border-gray-800/40 my-5" />

          {/* User Details */}
          <div className="w-full text-left space-y-3.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-gray-400" />
                <span>{user?.phone}</span>
              </div>
            )}
            {user?.organization && (
              <div className="flex items-center gap-2.5">
                <Building className="w-4.5 h-4.5 text-gray-400" />
                <span>{user?.organization}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Board */}
        <div className="glass-card p-6 flex flex-col">
          <h4 className="text-sm font-extrabold text-gray-950 dark:text-white uppercase tracking-wider mb-4">
            My Skills Taglist
          </h4>
          {user?.skills && user.skills.length === 0 ? (
            <span className="text-xs text-gray-400 italic">No skills listed. Edit profile to add.</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {(user?.skills || []).map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wide border border-primary-500/25"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: PROFILE EDIT & SECURITY ── */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Profile Form */}
        <div className="glass-card p-6 md:p-8 flex flex-col shadow-xl">
          <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2.5 mb-1.5">
            <User className="w-5.5 h-5.5 text-primary-500" /> Account Settings
          </h3>
          <p className="text-xs text-gray-500 mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">Update your workspace credentials and skills</p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full glass-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Profession & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Profession *
                </label>
                <select
                  className="w-full glass-input bg-transparent"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Startup Founder">Startup Founder</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  College / Organization
                </label>
                <input
                  type="text"
                  className="w-full glass-input"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
            </div>

            {/* Biography */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Biography
              </label>
              <textarea
                className="w-full glass-input h-20 resize-none py-2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Skills tag editor */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Skills / Technical tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-grow glass-input"
                  placeholder="e.g. Node.js (Press Enter/Add)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 rounded-xl btn-gradient flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 p-2.5 rounded-xl bg-gray-100/40 dark:bg-dark-300/40 border border-gray-200/20 dark:border-gray-800/20">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 uppercase tracking-wide border border-primary-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar chooser / File upload */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                Change Profile Avatar
              </label>
              <div className="flex items-center gap-3">
                {avatarPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden ring-2 transition-all ${
                      selectedPreset === preset.name
                        ? 'ring-primary-500 scale-105'
                        : 'ring-transparent hover:scale-105'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {selectedPreset === preset.name && (
                      <div className="absolute inset-0 bg-primary-600/30 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
                      </div>
                    )}
                  </button>
                ))}
                
                <label className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 text-gray-400 hover:text-primary-500 transition-colors">
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {fileObject && (
                <span className="text-[10px] text-emerald-500 font-semibold mt-1">
                  ✓ Custom upload selected: {fileObject.name}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl btn-gradient flex items-center justify-center gap-2 font-bold text-xs shadow-md shadow-primary-500/10 ml-auto"
            >
              {savingProfile ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card p-6 md:p-8 flex flex-col shadow-xl">
          <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2.5 mb-1.5">
            <KeyRound className="w-5.5 h-5.5 text-primary-500" /> Security Settings
          </h3>
          <p className="text-xs text-gray-500 mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">Update your password security logs</p>

          <form onSubmit={handleSavePassword} className="space-y-4">
            
            {/* Current Password */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Current Password *
              </label>
              <input
                type="password"
                required
                className="w-full glass-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* New Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  className="w-full glass-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  className="w-full glass-input"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 rounded-xl btn-gradient flex items-center justify-center gap-2 font-bold text-xs shadow-md shadow-primary-500/10 ml-auto"
            >
              {savingPassword ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
