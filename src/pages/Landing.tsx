import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Gauge,
  Zap,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Layout,
  Palette,
  Download,
  Share2,
  Eye,
  Grid3X3,
  MousePointer2,
  Layers3,
  Brain,
  Upload,
  Wand2,
  Code,
  Clock,
  Target,
  Check,
  X,
  Rocket,
  Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const valueProps = [
    {
      icon: <MousePointer2 className="h-6 w-6" />,
      title: "Drag & Drop Interface",
      description: "Intuitive canvas to design professional dashboards in minutes - no technical skills required"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "50+ Chart Components",
      description: "From basic to advanced - all with realistic sample data built-in for instant mockups"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "AI Design Assistant",
      description: "Get smart suggestions for layouts, colors, and chart combinations that look professional"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Export Ready Mockups",
      description: "PNG, PDF, or interactive HTML - perfect for client presentations and pitches"
    }
  ];

  const workflowSteps = [
    { icon: <Layout className="h-8 w-8" />, title: "Choose a Template", description: "Start from scratch or use pre-made layouts" },
    { icon: <MousePointer2 className="h-8 w-8" />, title: "Drag Components", description: "Add charts, KPIs, tables - all with sample data" },
    { icon: <Palette className="h-8 w-8" />, title: "Style & Customize", description: "Colors, fonts, spacing - make it yours" },
    { icon: <Download className="h-8 w-8" />, title: "Export & Present", description: "High-res images or interactive prototypes" }
  ];

  const comparison = {
    traditional: [
      { feature: "Time to Create Mockup", value: "Hours of manual work", has: false },
      { feature: "Chart Variety", value: "Basic shapes only", has: false },
      { feature: "Realistic Look", value: "Requires design skills", has: false },
      { feature: "Export Options", value: "Static images only", has: false },
      { feature: "Templates", value: "Start from scratch", has: false },
    ],
    ours: [
      { feature: "Time to Create Mockup", value: "Minutes with templates", has: true },
      { feature: "Chart Variety", value: "50+ professional components", has: true },
      { feature: "Realistic Look", value: "Looks like real dashboards", has: true },
      { feature: "Export Options", value: "PNG, PDF, HTML, embeds", has: true },
      { feature: "Templates", value: "Industry-specific starters", has: true },
    ]
  };

  const performanceMetrics = [
    { value: "90%", label: "Faster Than Figma", icon: <Rocket className="h-6 w-6" /> },
    { value: "15min", label: "Average Creation", icon: <Clock className="h-6 w-6" /> },
    { value: "50+", label: "Components", icon: <Layers3 className="h-6 w-6" /> },
    { value: "Zero", label: "Data Required", icon: <Sparkles className="h-6 w-6" /> }
  ];

  const companyLogos = [
    "TechCorp", "DataFlow", "CloudViz", "InsightLabs", 
    "AnalyticsPro", "DashMaster", "ChartHub", "MetricAI"
  ];

  const stats = [
    { number: "5K+", label: "Designers Trust Us" },
    { number: "50+", label: "Visual Components" },
    { number: "15min", label: "Average Creation" },
    { number: "Zero", label: "Data Required" }
  ];

  const testimonials = [
    {
      name: "Alex Morgan",
      role: "Product Designer",
      company: "TechFlow Design",
      quote: "Best tool for creating dashboard mockups. Clients love how professional they look - they think it's the real thing!",
      avatar: "AM"
    },
    {
      name: "Jordan Lee",
      role: "UX/UI Designer",
      company: "StartupHub",
      quote: "I used to spend hours in Figma creating dashboard mockups. Now it takes 10 minutes. Game changer for my workflow.",
      avatar: "JL"
    },
    {
      name: "Sam Rivera",
      role: "Product Manager",
      company: "DataViz Inc",
      quote: "Perfect for pitching dashboard ideas to stakeholders. The exports look so realistic, they approved the budget immediately.",
      avatar: "SR"
    }
  ];

  const chartCategories = [
    { 
      name: "Basic Charts",
      charts: [
        { icon: <BarChart3 className="h-6 w-6" />, name: "Column 2D", preview: true },
        { icon: <BarChart3 className="h-6 w-6" />, name: "Bar 2D", preview: true },
        { icon: <LineChart className="h-6 w-6" />, name: "Line 2D", preview: true },
        { icon: <PieChart className="h-6 w-6" />, name: "Pie 2D", preview: true },
      ]
    },
    { 
      name: "Multi-Series",
      charts: [
        { icon: <TrendingUp className="h-6 w-6" />, name: "Combo Chart", preview: true },
        { icon: <LineChart className="h-6 w-6" />, name: "Multi-Line", preview: true },
        { icon: <BarChart3 className="h-6 w-6" />, name: "Stacked Bar", preview: true },
        { icon: <BarChart3 className="h-6 w-6" />, name: "Multi-Area", preview: true },
      ]
    },
    { 
      name: "Advanced",
      charts: [
        { icon: <TrendingUp className="h-6 w-6" />, name: "Waterfall", preview: true },
        { icon: <Gauge className="h-6 w-6" />, name: "Bullet", preview: true },
        { icon: <Layout className="h-6 w-6" />, name: "Gantt", preview: true },
        { icon: <Grid3X3 className="h-6 w-6" />, name: "Sankey", preview: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-elegant">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-heading font-bold text-primary">Dashboard Builder</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/auth">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-dot-pattern opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>No Code. No Data. Just Beautiful Mockups.</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-[1.1]">
              Create Stunning Dashboard
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Mockups in Minutes
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional dashboard prototypes without code or data. Just drag, drop, and export 
              stunning mockups for presentations, pitches, and client demos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-base px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-lg font-semibold">
                  Start Designing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-lg font-semibold">
                  <Eye className="mr-2 h-5 w-5" />
                  See Examples
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              What We Offer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to design professional dashboard mockups in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {valueProps.map((prop, index) => (
              <Card key={index} className="group p-6 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{prop.title}</h3>
                    <p className="text-sm text-muted-foreground">{prop.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From idea to stunning mockup in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-elegant">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {index + 1}</div>
                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We're Better */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Why We're Better
            </h2>
            <p className="text-lg text-muted-foreground">
              See how we compare to traditional design tools
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-10">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div></div>
              <div className="text-center font-semibold text-muted-foreground">Traditional Design Tools</div>
              <div className="text-center font-semibold text-primary">Our Platform</div>
            </div>
            {comparison.traditional.map((item, index) => (
              <Card key={index} className="mb-2 overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-4 items-center">
                  <div className="font-medium text-sm">{item.feature}</div>
                  <div className="text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-destructive" />
                    <span>{comparison.traditional[index].value}</span>
                  </div>
                  <div className="text-center flex items-center justify-center gap-2 text-sm bg-primary/5 py-2 rounded-lg">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{comparison.ours[index].value}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-elegant transition-all">
                <div className="text-primary mb-2 flex justify-center">{metric.icon}</div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Component Library Showcase */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              50+ Professional Visualizations
            </h2>
            <p className="text-lg text-muted-foreground">
              From basic charts to advanced analytics — all fully customizable
            </p>
          </div>
          
          <div className="space-y-6">
            {chartCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {category.charts.map((chart, index) => (
                    <Card key={index} className="group p-4 hover:shadow-card transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                          {chart.icon}
                        </div>
                        <p className="font-semibold text-sm">{chart.name}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="font-semibold">
                View All 50+ Components
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Company Logos */}
          <div className="mb-12">
            <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wide font-medium">
              Used by Design Teams At
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {companyLogos.map((company, index) => (
                <div key={index} className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 flex items-center justify-center hover:border-primary/50 transition-all">
                  <span className="text-xs font-semibold text-muted-foreground">{company}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Loved by Thousands
            </h2>
            <p className="text-lg text-muted-foreground">
              Real feedback from real users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 text-sm leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Create Your First Mockup?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join 5,000+ designers who create stunning dashboard prototypes in minutes, not hours.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>No data needed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Export-ready mockups</span>
                </div>
              </div>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-base px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all rounded-lg font-semibold">
                  Start Designing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
                <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">AI-Powered</div>
                        <div className="text-sm text-muted-foreground">Smart suggestions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Lightning Fast</div>
                        <div className="text-sm text-muted-foreground">Build in minutes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Pixel Perfect</div>
                        <div className="text-sm text-muted-foreground">Professional quality</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-card/60 backdrop-blur-sm border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-heading font-bold text-primary">Dashboard Builder</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered dashboards for modern teams
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-3">Get the latest updates and tips</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Dashboard Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>

          {/* Mini CTA */}
          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Ready to get started?</p>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="sm" className="font-semibold">
                Sign up free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;