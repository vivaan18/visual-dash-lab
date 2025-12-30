import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  PieChart, 
  TrendingUp, 
  LayoutDashboard,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
  };

  const features = [
    { icon: LayoutDashboard, text: 'Drag & drop dashboard builder' },
    { icon: Sparkles, text: 'AI-powered template generation' },
    { icon: TrendingUp, text: '50+ chart types & visualizations' },
  ];

  const stats = [
    { value: '50+', label: 'Chart Types' },
    { value: '5K+', label: 'Users' },
    { value: '10K+', label: 'Dashboards' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-primary via-primary/90 to-purple-700 relative overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-white/90 hover:text-white transition-colors">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <BarChart3 className="h-7 w-7" />
            </div>
            <span className="text-xl font-bold">Dashboard Builder</span>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Build stunning dashboards in minutes
            </h2>
            <p className="text-lg text-white/80 mb-10">
              Create beautiful, interactive dashboards with our intuitive drag-and-drop builder and AI-powered suggestions.
            </p>

            {/* Features Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-4 text-white"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-2 bg-white/20 rounded-lg">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-8 mt-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Icons */}
          <div className="absolute top-1/4 right-12 animate-pulse">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <PieChart className="h-10 w-10 text-white/80" />
            </div>
          </div>
          <div className="absolute bottom-1/3 right-24 animate-pulse" style={{ animationDelay: '500ms' }}>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </div>
          <div className="absolute top-1/2 right-8 animate-pulse" style={{ animationDelay: '1000ms' }}>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Zap className="h-6 w-6 text-white/80" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <Users className="h-4 w-4" />
            <span>Trusted by thousands of data professionals</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 bg-gradient-to-r from-primary to-purple-600">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <BarChart3 className="h-6 w-6" />
            <span className="text-lg font-bold">Dashboard Builder</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Start building amazing dashboards today' 
                : 'Sign in to continue to your dashboard'
              }
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted rounded-lg mb-8">
            <button
              onClick={() => !isSignUp || toggleMode()}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                !isSignUp 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => isSignUp || toggleMode()}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                isSignUp 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="h-12 px-4 bg-muted/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-12 px-4 bg-muted/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-12 px-4 pr-12 bg-muted/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="h-12 px-4 bg-muted/50 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
