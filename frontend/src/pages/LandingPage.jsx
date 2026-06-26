import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  Trello, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      title: 'Interactive Kanban Board',
      desc: 'Drag and drop tasks between columns (Pending, In Progress, Completed) to dynamically update statuses.',
      icon: Trello,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Deadline Calendar',
      desc: 'Visualize project milestones and task deadlines on a monthly calendar grid to prevent overdue submissions.',
      icon: Calendar,
      color: 'text-cyan-500 bg-cyan-500/10'
    },
    {
      title: 'Analytics & Export Reports',
      desc: 'Track team statistics and download official summary logs instantly to Excel spreadsheets or formatted PDF documents.',
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'JWT Authentication',
      desc: 'Rest easy with secure hashed credentials, token session authorization, and strict user private router guards.',
      icon: ShieldCheck,
      color: 'text-indigo-500 bg-indigo-500/10'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-50 dark:bg-dark-400">
      {/* Decorative floating background blobs */}
      <div className="aurora-bg" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto h-20 px-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SprintHub</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">B.Tech Project Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-xl text-sm font-semibold btn-gradient"
            >
              Go to Workspace
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl text-sm font-semibold btn-gradient"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-6 py-12 md:py-24 z-10">
        {/* Project Tag */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 animate-bounce">
          <TrendingUp className="w-4 h-4" /> B.Tech Computer Science Final Year Project
        </div>
        
        {/* Main Heading */}
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-950 dark:text-white max-w-4xl leading-tight">
          Accelerate Project Delivery with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400">
            SprintHub
          </span>
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mt-6 text-base md:text-lg max-w-2xl leading-relaxed">
          The ultimate task and milestone manager designed to keep developers and academic teams in sync. Organize tasks, inspect milestones, drag Kanban cards, and build stunning PDF reports.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={handleCTA}
            className="px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 btn-gradient text-base"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 btn-gradient-secondary text-base"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* Features Overview */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 z-10 border-t border-gray-200/50 dark:border-gray-800/40">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h3 className="text-2xl md:text-3.5xl font-bold text-gray-900 dark:text-white">
            Everything you need for successful project milestones
          </h3>
          <p className="text-gray-500 mt-3 text-sm">
            Fully featured, responsive workspace designed to support students and professional developer teams alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card p-6 flex flex-col items-start hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`p-3 rounded-xl mb-5 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{feat.title}</h4>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto h-20 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto border-t border-gray-200/20 dark:border-gray-800/20 z-10">
        <span>© 2026 SprintHub. Designed for Academic Mini/Major Project Showcase.</span>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:underline">Documentation</a>
          <a href="#" className="hover:underline">Repository API</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
