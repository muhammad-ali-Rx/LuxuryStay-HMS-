import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Upload, 
  ArrowLeft,
  Shield,
  Building,
  Star,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

export default function HMSRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    name: "",
    address: "",
    profileImage: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);

  useEffect(() => {
    if (step === 2 && otpTimeRemaining > 0) {
      const interval = setInterval(() => {
        setOtpTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpTimeRemaining]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackClick = () => {
    navigate("/");
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email) {
        setError("Please enter your email");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setOtpTimeRemaining(data.expiresIn || 600);
      setCanResendOTP(false);
      setFormData(prev => ({ ...prev, otp: "" }));
      setSuccessMessage("OTP sent to your email!");
      setTimeout(() => {
        setStep(2);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP");
        return;
      }

      setOtpTimeRemaining(data.expiresIn || 600);
      setCanResendOTP(false);
      setFormData(prev => ({ ...prev, otp: "" }));
      setSuccessMessage("New OTP sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.otp) {
        setError("Please enter the OTP");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      setSuccessMessage("OTP verified successfully!");
      setTimeout(() => {
        setStep(3);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password
  const handleSetPassword = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSuccessMessage("Password set successfully!");
    setTimeout(() => {
      setStep(4);
      setSuccessMessage("");
    }, 1500);
  };

  // Step 4: Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }

      if (!agreeTerms) {
        setError("Please agree to terms and conditions");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          address: formData.address,
          profileImage: formData.profileImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to complete registration");
        setLoading(false);
        return;
      }

      // Registration successful
      navigate("/Home", { 
        state: { message: "Welcome to LuxuryStay! Your account has been created successfully." } 
      });
    } catch (err) {
      setError(err.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stepConfig = {
    1: {
      title: "Verify Your Email",
      subtitle: "We'll send you a verification code to get started",
      icon: Mail,
      fields: [
        {
          name: "email",
          label: "Email Address",
          type: "email",
          icon: Mail,
          placeholder: "your.email@example.com"
        }
      ]
    },
    2: {
      title: "Enter Verification Code",
      subtitle: "Check your email for the 6-digit code",
      icon: Shield,
    },
    3: {
      title: "Create Password",
      subtitle: "Set a secure password for your account",
      icon: Lock,
      fields: [
        {
          name: "password",
          label: "Password",
          type: "password",
          icon: Lock,
          placeholder: "At least 6 characters"
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          icon: Lock,
          placeholder: "Re-enter your password"
        }
      ]
    },
    4: {
      title: "Personal Information",
      subtitle: "Tell us a bit about yourself",
      icon: User,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          icon: User,
          placeholder: "Enter your full name"
        },
        {
          name: "address",
          label: "Address (Optional)",
          type: "text",
          icon: MapPin,
          placeholder: "Your complete address"
        }
      ]
    }
  };

  const currentStep = stepConfig[step];

  return (
    <div className="min-h-screen bg-[#1D293D] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <motion.button
            onClick={handleBackClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1C3888] text-white hover:bg-[#1C3888]/90 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                      stepNumber < step
                        ? "bg-[#1C3888] border-[#1C3888] text-white shadow-lg"
                        : stepNumber === step
                        ? "bg-white border-white text-[#1D293D] shadow-lg"
                        : "bg-white/10 border-white/20 text-white/60"
                    }`}>
                      {stepNumber < step ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="font-bold text-lg">{stepNumber}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      stepNumber <= step ? "text-white" : "text-white/40"
                    }`}>
                      {stepConfig[stepNumber].title.split(' ')[0]}
                    </span>
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 rounded ${
                      stepNumber < step ? "bg-[#1C3888]" : "bg-white/20"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#1C3888] flex items-center justify-center">
                  <currentStep.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1D293D]">{currentStep.title}</h1>
                  <p className="text-gray-600 text-sm">{currentStep.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form className="p-8" onSubmit={
              step === 1 ? handleSendOTP :
              step === 2 ? handleVerifyOTP :
              step === 3 ? handleSetPassword :
              handleCompleteRegistration
            }>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Email */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {currentStep.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={field.type}
                          value={formData[field.name]}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C3888] focus:border-[#1C3888] transition placeholder-gray-400"
                        />
                      </div>
                    </div>
                  ))}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1C3888] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 hover:bg-[#1C3888]/90"
                  >
                    {loading ? "Sending OTP..." : "Send Verification Code"}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                      <Shield className="w-10 h-10 text-[#1C3888]" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      We sent a 6-digit verification code to:
                    </p>
                    <p className="text-[#1D293D] font-semibold mt-1">{formData.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Verification Code
                      </label>
                      <span className={`text-xs font-mono font-bold ${
                        otpTimeRemaining > 60 ? "text-green-600" : 
                        otpTimeRemaining > 0 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {otpTimeRemaining > 0 ? `${formatTimeRemaining(otpTimeRemaining)}` : "Code expired"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => updateFormData("otp", e.target.value.slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-[#1C3888] focus:border-[#1C3888] transition placeholder-gray-300"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || otpTimeRemaining === 0}
                    className="w-full bg-[#1C3888] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 hover:bg-[#1C3888]/90"
                  >
                    {loading ? "Verifying..." : "Verify Account"}
                  </motion.button>

                  <div className="space-y-3">
                    {canResendOTP && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleResendOTP}
                        disabled={loading}
                        type="button"
                        className="w-full text-[#1C3888] font-medium py-3 text-sm border border-[#1C3888] rounded-xl hover:bg-[#1C3888] hover:text-white transition"
                      >
                        {loading ? "Sending..." : "Resend Code"}
                      </motion.button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-gray-600 font-medium py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                    >
                      Change Email
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {currentStep.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={
                            field.name.includes("password") 
                              ? (field.name === "password" ? showPassword : showConfirmPassword) ? "text" : "password"
                              : field.type
                          }
                          value={formData[field.name]}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C3888] focus:border-[#1C3888] transition placeholder-gray-400"
                        />
                        {field.name.includes("password") && (
                          <button
                            type="button"
                            onClick={() => 
                              field.name === "password" 
                                ? setShowPassword(!showPassword)
                                : setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          >
                            {(field.name === "password" ? showPassword : showConfirmPassword) ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      <strong>Password requirements:</strong> At least 6 characters for security.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#1C3888] text-white font-semibold py-4 rounded-xl transition-all hover:bg-[#1C3888]/90"
                  >
                    Continue to Profile
                  </motion.button>
                </motion.div>
              )}

              {/* Step 4: Personal Info */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Picture (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-gray-400 transition cursor-pointer">
                        {formData.profileImage ? (
                          <img
                            src={formData.profileImage}
                            alt="Profile"
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span className="block px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition text-center">
                          Choose Profile Image
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Personal Information Fields */}
                  {currentStep.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={field.type}
                          value={formData[field.name]}
                          onChange={(e) => updateFormData(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C3888] focus:border-[#1C3888] transition placeholder-gray-400"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1C3888] focus:ring-[#1C3888] mt-0.5"
                    />
                    <label htmlFor="terms" className="text-gray-700 text-sm leading-relaxed">
                      I agree to the{" "}
                      <span className="text-[#1C3888] font-medium">Terms of Service</span> and{" "}
                      <span className="text-[#1C3888] font-medium">Privacy Policy</span>. 
                      I confirm that all information provided is accurate.
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !agreeTerms}
                    className="w-full bg-[#1C3888] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 hover:bg-[#1C3888]/90"
                  >
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </motion.button>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/80 text-sm">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-[#1C3888] hover:text-[#1C3888]/80 font-medium transition"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section with Background Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C3888]/90 via-[#1D293D]/80 to-[#1C3888]/90"></div>
          
          {/* Additional Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D293D] via-transparent to-[#1C3888]/60"></div>
        </div>
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex items-center justify-center w-full p-12"
        >
          <div className="text-center text-white max-w-2xl">
            {/* Logo and Brand */}
            <div className="mb-12">
              <div className="w-28 h-28 mx-auto mb-6 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                <Building className="w-14 h-14 text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                LuxuryStay
              </h1>
              <p className="text-white/70 text-2xl font-light">
                Premium LuxuryStay
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-8 mb-12">
              <h3 className="text-3xl font-semibold leading-relaxed text-white/90">
                Experience the Future of LuxuryStay
              </h3>
              <p className="text-white/80 text-xl leading-relaxed font-light">
                Join thousands of luxury hotels worldwide that trust LuxuryStay for seamless operations, exceptional guest experiences, and unprecedented growth.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-white/60 text-sm">Luxury Hotels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-white/60 text-sm">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">99%</div>
                <div className="text-white/60 text-sm">Satisfaction</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/80 text-lg italic mb-4 leading-relaxed">
                "LuxuryStay transformed our 5-star hotel operations. Our efficiency increased by 40% and guest satisfaction scores reached new heights. The registration process was incredibly smooth!"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1C3888] to-[#1D293D] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Sarah Mitchell</p>
                  <p className="text-white/60 text-sm">General Manager, LuxuryStay</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#1C3888]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1C3888]/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
}