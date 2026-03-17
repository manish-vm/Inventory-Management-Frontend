import React, { useState, useEffect } from "react";
import { 
  BarChart3, Package, ShieldCheck, MessageSquare, ScanLine, Users, 
  Moon, Sun, ArrowRight, CheckCircle2, Zap, TrendingUp, Lock, 
  MessageCircle, ChevronRight, Star, Play, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { publicAPI } from "../api/api";
import AIChatbot from "../components/AIChatbot";

/* ---------------- ANIMATED BACKGROUND ---------------- */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Light theme orbs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-400/30 to-accent-500/30 dark:from-primary-600/20 dark:to-accent-700/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-accent-400/30 to-primary-500/30 dark:from-accent-600/20 dark:to-primary-700/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/20 to-orange-400/20 dark:from-purple-600/10 dark:to-orange-600/10 rounded-full blur-[80px]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}

/* ---------------- KPI COUNTER ---------------- */
function Counter({ value, label, suffix = "+" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = value / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
        {count}{suffix}
      </p>
      <p className="text-sm md:text-base text-surface-600 dark:text-surface-400 mt-2 font-medium">{label}</p>
    </div>
  );
}

/* ---------------- FEATURE CARD ---------------- */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative p-8 rounded-3xl bg-white/80 dark:bg-surface-800/50 backdrop-blur-xl border border-surface-200/50 dark:border-surface-700/50 shadow-lg hover:shadow-2xl dark:shadow-surface-900/50 transition-all duration-300"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-all duration-300 text-white drop-shadow-sm" >
          <Icon className="text-white" size={28} />
        </div>
        
        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
          {desc}
        </p>
      

      {/* Arrow indicator */}
      <motion.div 
        className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300"
        initial={{ x: -10 }}
        whileHover={{ x: 0 }}
      >
        <ArrowRight className="text-primary-600 dark:text-primary-400" size={20} />
      </motion.div>
    </motion.div>
  );
}

/* ---------------- PRICING CARD ---------------- */
function PricingCard({ plan, price, features, popular, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative p-8 rounded-3xl ${
        popular 
          ? "bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 text-white shadow-2xl scale-105 z-10" 
          : "bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-yellow-500 text-yellow-900 text-sm font-bold rounded-full flex items-center gap-1">
            <Star size={14} className="fill-current" /> Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className={`text-xl font-bold mb-2 ${popular ? "text-white" : "text-slate-900 dark:text-white"}`}>
          {plan}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-5xl font-bold ${popular ? "text-white" : "text-slate-900 dark:text-white"}`}>
            {price}
          </span>
          {price !== "Custom" && <span className={popular ? "text-white/70" : "text-slate-500 dark:text-slate-400"}>/month</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 
              size={20} 
              className={popular ? "text-white" : "text-blue-600 dark:text-blue-400 flex-shrink-0"} 
            />
            <span className={popular ? "text-white/90" : "text-slate-600 dark:text-slate-300"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 rounded-xl font-semibold transition-all ${
          popular
            ? "bg-white text-blue-600 hover:bg-slate-100"
            : "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white hover:shadow-lg"
        }`}
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}

/* ---------------- TESTIMONIAL CARD ---------------- */
function TestimonialCard({ text, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
        "{text}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- STATS SECTION ---------------- */
function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter value={10000} label="Products Managed" />
          <Counter value={5000} label="Invoices Generated" />
          <Counter value={300} label="Active Businesses" />
          <Counter value={99} label="% Uptime" suffix="%" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- NAVBAR ---------------- */
function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm py-4" 
        : "bg-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Package className="text-white" size={22} />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">InventoryPro</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Testimonials</a>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- HERO SECTION ---------------- */
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 mb-6"
          >
            <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Inventory Management</span>
          </motion.div> */}

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Smart Inventory{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              & Billing
            </span>{" "}
            Platform
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl">
            Automate inventory tracking, billing, analytics, and team communication 
            from a single AI-ready dashboard. Scale your business effortlessly.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Play size={20} className="fill-current" />
              Watch Demo
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>14-day free trial</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image Slider */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <ImageSlider />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES SECTION ---------------- */
function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Inventory Tracking",
      desc: "Manage products, categories, and stock levels in real-time with powerful inventory management tools."
    },
    {
      icon: ScanLine,
      title: "Barcode Billing",
      desc: "Scan products and generate invoices instantly with our advanced barcode scanning system."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      desc: "Monitor revenue, sales trends, and inventory insights with comprehensive analytics dashboards."
    },
    {
      icon: Users,
      title: "User Management",
      desc: "Admins can manage employees, roles, and permissions with granular access control."
    },
    {
      icon: ShieldCheck,
      title: "Secure Access",
      desc: "Role-based authentication and enterprise-grade security to protect your data."
    },
    {
      icon: MessageSquare,
      title: "Internal Messaging",
      desc: "Super admin to admin communication system for seamless team collaboration."
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Powerful features to streamline your inventory management and billing operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- AI SECTION ---------------- */
function AISection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4">
            <Zap className="inline mr-2" size={16} />
            AI-Powered
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Smart Insights
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Leverage artificial intelligence to predict stock shortages, detect sales trends, 
            and automate inventory decisions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden shadow-2xl md:h-[500px] w-[1000px] align-self-center mx-auto"
        >
          <img
            src="https://www.techugo.com/wordpress/wp-content/uploads/2025/04/AI-in-Inventory-Management_-The-Future-of-Smarter-Stock-Control.jpg"
            alt="AI Analytics"
            className="w-full h-full"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
          
          {/* AI floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-6 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Prediction</p>
                <p className="font-semibold text-slate-900 dark:text-white">Restock Recommended</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- PRICING SECTION ---------------- */
function PricingSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await publicAPI.getPlans();
      setPlans(response.data || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the plan that best fits your business needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-slate-500">Loading plans...</div>
          ) : plans.length > 0 ? (
            plans.filter(p => p.status === 'active').map((plan, index) => (
              <PricingCard 
                key={index} 
                plan={plan.planName} 
                price={plan.price === 0 ? 'Free' : `${plan.price}`} 
                features={plan.features || []} 
                delay={index * 0.1} 
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-slate-500">No plans available</div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS SECTION ---------------- */
function TestimonialsSection() {
  const testimonials = [
    {
      text: "InventoryPro transformed how we track products and billing. Our efficiency increased by 40% in just two months.",
      name: "Sarah Johnson",
      role: "Retail Store Owner"
    },
    {
      text: "The analytics dashboard gives clear visibility of sales and inventory. Best investment we've made for our business.",
      name: "Michael Chen",
      role: "Electronics Store Manager"
    },
    {
      text: "Barcode billing reduced checkout time dramatically. Our customers love the quick service!",
      name: "Emily Rodriguez",
      role: "Supermarket Chain Director"
    }
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Trusted by Businesses
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See what our customers have to say about their experience with InventoryPro.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA SECTION ---------------- */
function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Managing Inventory Smarter
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of businesses already using InventoryPro to streamline 
            their operations and boost productivity.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all flex items-center gap-2"
            >
              Contact Sales
              <MessageCircle size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Analytics", "Integrations"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Security", "GDPR"]
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Package className="text-white" size={22} />
              </div>
              <span className="font-bold text-xl">InventoryPro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The complete inventory management and billing platform for modern businesses.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 InventoryPro. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <MessageCircle size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Lock size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- IMAGE SLIDER COMPONENT ---------------- */
function ImageSlider() {
  const images = [
    'https://github.com/manish-vm/Inventory-Management-Frontend/blob/main/banner-1.png?raw=true',
    'https://github.com/manish-vm/Inventory-Management-Frontend/blob/main/banner-2.png?raw=true',
    'https://github.com/manish-vm/Inventory-Management-Frontend/blob/main/inventory.png?raw=true'
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 dark:border-slate-700/50  md:h-[350px] w-[600px] bg-slate-200 dark:bg-slate-800">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-fit"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Floating cards (positioned over slider) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-6 -left-6 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="flex items-center gap-3 mb-4 ml-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revenue Growth</p>
            <p className="font-bold text-slate-900 dark:text-white">+127%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -top-6 -right-6 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
      />

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-6 scale-110' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- MAIN HOMEPAGE ---------------- */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AISection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <AIChatbot />
    </div>
  );
}
