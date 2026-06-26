import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Layers, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  Building, 
  Plus, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Image,
  Sparkles
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [profession, setProfession] = useState('Student');
  const [organization, setOrganization] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // Holds preset avatar URL OR file
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [fileObject, setFileObject] = useState(null);

  // Avatar presets (modern aesthetic gradients)
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
    setProfilePicture(preset.url);
    setFileObject(null); // clear file upload
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File is too large! Maximum limit is 2MB.');
        return;
      }
      setFileObject(file);
      setSelectedPreset(null);
      setProfilePicture(''); // clear preset selection
      toast.success(`Image uploaded: ${file.name}`);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      // Simple email validation
      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error('Please enter a valid email address.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('profession', profession);
    formData.append('organization', organization);
    formData.append('bio', bio);
    formData.append('skills', JSON.stringify(skills));

    if (fileObject) {
      formData.append('profilePicture', fileObject);
    } else if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      toast.success('Welcome to SprintHub! Let\'s manage projects.');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-dark-400">
      <div className="aurora-bg" />

      {/* Registration Card */}
      <div className="w-full max-w-lg glass-card p-8 relative z-10 shadow-2xl">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Create Account</h2>
              <p className="text-[10px] text-gray-400 font-medium">Step {step} of 2</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <span className={`h-2 w-8 rounded-full transition-colors ${step === 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
          </div>
        </div>

        {/* Step 1: Profile Setup */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Full Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full glass-input pl-10"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Email Address *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full glass-input pl-10"
                  placeholder="e.g. john@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  className="w-full glass-input pl-10"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full glass-input pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full glass-input pl-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl btn-gradient flex items-center justify-center gap-2 mt-4 font-bold text-sm"
            >
              Continue to Profile Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Org details & Bio */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* College/Org & Profession */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Profession *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Briefcase className="w-4.5 h-4.5" />
                  </span>
                  <select
                    className="w-full glass-input pl-10 appearance-none bg-transparent"
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
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  College / Organization
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Building className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    className="w-full glass-input pl-10"
                    placeholder="e.g. Stanford University"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Profile Bio */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Short Biography
              </label>
              <textarea
                className="w-full glass-input h-16 resize-none py-2"
                placeholder="Tell us about yourself (e.g. Full-stack developer eager to learn)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Interactive Skills Tag Compiler */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Skills / Technical tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-grow glass-input"
                  placeholder="e.g. React.js (Press Enter/Add)"
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
              {/* Tags panel */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 rounded-xl bg-gray-100/40 dark:bg-dark-300/40 border border-gray-200/30 dark:border-gray-800/30">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 uppercase tracking-wide border border-primary-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar Preset Selectors */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Choose Profile Avatar Preset
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
                
                {/* File Upload Selector */}
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

            {/* Actions: Prev / Submit */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl btn-gradient-secondary flex items-center justify-center gap-2 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl btn-gradient flex items-center justify-center gap-2 font-bold text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Login redirect link */}
        <div className="text-center mt-6 text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
