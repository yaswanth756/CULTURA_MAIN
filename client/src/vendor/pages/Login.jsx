import React, { useState } from 'react'
import { buildApiUrl } from '../../utils/api'
import { X, ChevronDown, Music, Camera, Utensils, Palette, Flower, Car, Headphones, Mic, Upload, Trash2, FileText, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isNewVendor, setIsNewVendor] = useState(true)
  const [showServiceMenu, setShowServiceMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  
  const [vendorDetails, setVendorDetails] = useState({
    firstName: '',
    phone: '',
    businessName: '',
    city: '',
    address: '',
    services: [],
    panImage: '',
    aadhaarImage: '',
    businessRegImage: ''
  })

  // Document upload states
  const [documentUploads, setDocumentUploads] = useState({
    pan: { preview: null, file: null, uploading: false, uploaded: false },
    aadhaar: { preview: null, file: null, uploading: false, uploaded: false },
    businessReg: { preview: null, file: null, uploading: false, uploaded: false }
  })

  // Services data with icons
  const services = [
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'videography', label: 'Videography', icon: Camera },
    { value: 'catering', label: 'Catering', icon: Utensils },
    { value: 'decoration', label: 'Decoration', icon: Palette },
    { value: 'dj', label: 'Music & DJ', icon: Music },
    { value: 'venue', label: 'Venue', icon: Flower },
    { value: 'transportation', label: 'Transport', icon: Car },
    { value: 'mehendi', label: 'Mehendi Artist', icon: Palette },
    { value: 'makeup', label: 'Makeup Artist', icon: Palette },
    { value: 'priest', label: 'Priest Services', icon: Mic },
    { value: 'invitation', label: 'Invitations', icon: Palette },
    { value: 'gifts', label: 'Gifts & Favors', icon: Flower }
  ]

  // E.164 helpers
  const isE164 = (p) => /^\+[1-9]\d{1,14}$/.test(p)
  const normalizeToE164 = (raw) => {
    if (!raw) return ''
    const rawTrim = raw.trim()
    const digitsPlus = rawTrim.replace(/[^\d+]/g, '')
    const justDigits = digitsPlus.replace(/\D/g, '')
    if (!digitsPlus.startsWith('+') && /^\d{10}$/.test(justDigits) && /^[6-9]/.test(justDigits)) {
      return `+91${justDigits}`
    }
    if (digitsPlus.startsWith('+')) return digitsPlus
    return `+${justDigits}`
  }

  // Handle document file selection
  const handleDocumentSelect = (docType, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, or WebP)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)
    setDocumentUploads(prev => ({
      ...prev,
      [docType]: { ...prev[docType], preview, file, uploaded: false }
    }))
  }

  // Upload document to server
  const handleDocumentUpload = async (docType) => {
    const doc = documentUploads[docType]
    if (!doc.file) {
      toast.error('Please select a file first')
      return
    }

    setDocumentUploads(prev => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true }
    }))

    try {
      const formData = new FormData()
      formData.append('images', doc.file)

      const response = await fetch(buildApiUrl('/api/upload/multiple'), {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.urls && data.urls.length > 0) {
        const imageUrl = data.urls[0].url
        
        // Update vendor details with the image URL
        const fieldMap = {
          pan: 'panImage',
          aadhaar: 'aadhaarImage',
          businessReg: 'businessRegImage'
        }
        
        setVendorDetails(prev => ({
          ...prev,
          [fieldMap[docType]]: imageUrl
        }))

        setDocumentUploads(prev => ({
          ...prev,
          [docType]: { ...prev[docType], uploading: false, uploaded: true }
        }))

        toast.success('Document uploaded successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document')
      setDocumentUploads(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }))
    }
  }

  // Delete document
  const handleDocumentDelete = (docType) => {
    const doc = documentUploads[docType]
    if (doc.preview) {
      URL.revokeObjectURL(doc.preview)
    }

    const fieldMap = {
      pan: 'panImage',
      aadhaar: 'aadhaarImage',
      businessReg: 'businessRegImage'
    }

    setVendorDetails(prev => ({
      ...prev,
      [fieldMap[docType]]: ''
    }))

    setDocumentUploads(prev => ({
      ...prev,
      [docType]: { preview: null, file: null, uploading: false, uploaded: false }
    }))

    toast.info('Document removed')
  }

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/vendor/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await response.json()

      if (data.success) {
        setIsNewVendor(data.userType === 'new')
        setOtpExpiry(Date.now() + (data.expiresIn * 1000))
        setStep(2)
        toast.success('OTP sent successfully!')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP and Complete Registration/Login
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    // Validate new vendor details
    if (isNewVendor) {
      if (!vendorDetails.firstName.trim()) {
        toast.error('Please enter your full name')
        return
      }
      if (!vendorDetails.phone.trim()) {
        toast.error('Please enter your phone number')
        return
      }
      const phoneE164 = normalizeToE164(vendorDetails.phone.trim())
      if (!isE164(phoneE164)) {
        toast.error('Enter a valid phone in E.164 (e.g., +919876543210)')
        return
      }
      if (!vendorDetails.businessName.trim()) {
        toast.error('Please enter your business name')
        return
      }
      if (!vendorDetails.city.trim()) {
        toast.error('Please enter your city')
        return
      }
      if (!vendorDetails.address.trim()) {
        toast.error('Please enter your address')
        return
      }
      if (!vendorDetails.services || vendorDetails.services.length === 0) {
        toast.error('Please select at least one service')
        return
      }
      if (!vendorDetails.panImage) {
        toast.error('Please upload PAN card image')
        return
      }
      if (!vendorDetails.aadhaarImage) {
        toast.error('Please upload Aadhaar card image')
        return
      }
      if (!vendorDetails.businessRegImage) {
        toast.error('Please upload Business Registration document')
        return
      }
      if (!agreedToTerms) {
        toast.error('You must agree to the Terms and Conditions to sign up')
        return
      }
    }

    setIsLoading(true)
    try {
      const requestBody = {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      }

      if (isNewVendor) {
        const phoneE164 = normalizeToE164(vendorDetails.phone.trim())
        requestBody.vendorDetails = {
          firstName: vendorDetails.firstName.trim(),
          phone: phoneE164,
          businessName: vendorDetails.businessName.trim(),
          city: vendorDetails.city.trim(),
          address: vendorDetails.address.trim(),
          services: vendorDetails.services,
          panImage: vendorDetails.panImage,
          aadhaarImage: vendorDetails.aadhaarImage,
          businessRegImage: vendorDetails.businessRegImage
        }
        requestBody.agreedToTerms = agreedToTerms
      }

      const response = await fetch(buildApiUrl('/api/vendor/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      const data = await response.json()

      if (data.success) {
        localStorage.setItem('vendorToken', data.token)
        localStorage.setItem('vendorUser', JSON.stringify(data.user))
        toast.success(data.message)
        const redirectPath = "/vendor/dashboard"
        navigate(redirectPath, { replace: true })
        window.location.reload()
      } else {
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/vendor/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await response.json()

      if (data.success) {
        setOtpExpiry(Date.now() + (data.expiresIn * 1000))
        setOtp('')
        toast.success('New OTP sent successfully!')
      } else {
        toast.error(data.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailChange = (field, value) => {
    setVendorDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectService = (serviceValue) => {
    const currentServices = vendorDetails.services || []
    const isSelected = currentServices.includes(serviceValue)
    if (isSelected) {
      handleDetailChange('services', currentServices.filter(s => s !== serviceValue))
    } else {
      handleDetailChange('services', [...currentServices, serviceValue])
    }
  }

  const getSelectedServicesText = () => {
    const selectedServices = vendorDetails.services || []
    if (selectedServices.length === 0) return 'Select services'
    if (selectedServices.length === 1) {
      const service = services.find(s => s.value === selectedServices[0])
      return service?.label || 'Selected'
    }
    return `${selectedServices.length} Selected`
  }

  // Document Upload Component
  const DocumentUploadField = ({ docType, label, icon: Icon }) => {
    const doc = documentUploads[docType]
    const fileInputRef = React.useRef(null)

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        
        {!doc.preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-anzac-400 transition-all bg-gray-50 hover:bg-gray-100"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleDocumentSelect(docType, e)}
              className="hidden"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-anzac-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-anzac-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload {label}</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP (Max 5MB)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative border-2 border-gray-200 rounded-2xl p-4 bg-white">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={doc.preview}
                  alt={label}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.file?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(doc.file?.size / 1024).toFixed(2)} KB
                </p>
                {doc.uploaded && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Uploaded</span>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {!doc.uploaded && !doc.uploading && (
                    <button
                      type="button"
                      onClick={() => handleDocumentUpload(docType)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 bg-anzac-500 text-white rounded-lg hover:bg-anzac-600 transition-colors disabled:opacity-50"
                    >
                      Upload
                    </button>
                  )}
                  {doc.uploading && (
                    <span className="text-xs text-gray-500 px-3 py-1.5">Uploading...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDocumentDelete(docType)}
                    disabled={isLoading || doc.uploading}
                    className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-50 relative py-8 ">
      <div className='space-y-6 mx-4'>
        <div className="flex items-center gap-3 justify-center">
          <img
            src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
            alt="Cultura logo"
            className="h-12 w-auto rounded-full object-cover"
          />
          <h1 className="text-2xl font-bold text-anzac-500">Utsavlokam</h1>
        </div>
        
        <div className='bg-white border border-gray-200 rounded-2xl shadow-sm'>
          <div className="p-8">
            {step === 1 ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Login</h2>
                  <p className="text-sm text-gray-600">Enter your email to continue</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                      placeholder="vendor@business.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-anzac-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-anzac-600 focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending OTP...' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isNewVendor ? 'Complete Registration' : 'Verify OTP'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    OTP sent to <span className="font-medium text-anzac-500">{email}</span>
                  </p>
                </div>
                
                <div className="space-y-5">
                  {/* OTP Field */}
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* New Vendor Fields */}
                  {isNewVendor && (
                    <div className="space-y-5 pt-4 border-t border-gray-100">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={vendorDetails.firstName}
                            onChange={(e) => handleDetailChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={vendorDetails.phone}
                            onChange={(e) => handleDetailChange('phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                            placeholder="+91 9876543210"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="businessName"
                            value={vendorDetails.businessName}
                            onChange={(e) => handleDetailChange('businessName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                            placeholder="Your Business Name"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={vendorDetails.city}
                            onChange={(e) => handleDetailChange('city', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                            placeholder="Mumbai"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="address"
                          value={vendorDetails.address}
                          onChange={(e) => handleDetailChange('address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all"
                          placeholder="Street, Area, Landmark"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {/* Services */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Services Offered <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowServiceMenu(true)}
                          disabled={isLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-anzac-500 focus:border-transparent outline-none transition-all text-left flex items-center justify-between hover:border-gray-400 disabled:opacity-50"
                        >
                          <span className={vendorDetails.services?.length ? 'text-gray-900' : 'text-gray-500'}>
                            {getSelectedServicesText()}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Document Uploads Section */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Upload Documents</h3>
                        <p className="text-xs text-gray-600 -mt-2">Please upload clear images of the following documents</p>
                        
                        <div className="gap-5 space-y-2">
                          <DocumentUploadField 
                            docType="pan" 
                            label="PAN Card" 
                            icon={FileText}
                          />
                          <DocumentUploadField 
                            docType="aadhaar" 
                            label="Aadhaar Card" 
                            icon={FileText}
                          />
                          <DocumentUploadField 
                            docType="businessReg" 
                            label="Business Registration" 
                            icon={FileText}
                          />
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 text-anzac-500 border-gray-300 rounded focus:ring-anzac-500"
                          disabled={isLoading}
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{' '}
                          <a href="/terms-and-conditions" target="_blank" className="text-anzac-500 hover:text-anzac-600 underline">
                            Terms and Conditions
                          </a>
                          {' '}and{' '}
                          <a href="/privacy-policy" target="_blank" className="text-anzac-500 hover:text-anzac-600 underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-anzac-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-anzac-600 focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (isNewVendor ? 'Complete Registration' : 'Verify & Login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="w-full text-gray-600 py-2 px-4 text-sm hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    ← Back to email
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-anzac-500 hover:text-anzac-600 transition-colors disabled:opacity-50"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our{' '}
              <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-anzac-500 hover:text-anzac-600">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy-policy" target='_blank' className="text-anzac-500 hover:text-anzac-600">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Services Selection Modal */}
      {showServiceMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Services</h3>
                  <p className="text-sm text-gray-600 mt-1">Choose the services you offer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServiceMenu(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <ul className="flex flex-wrap gap-3">
                {services.map(({ value, label, icon: Icon }) => {
                  const isSelected = vendorDetails.services?.includes(value)
                  return (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => handleSelectService(value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 text-gray-800 hover:border-gray-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {vendorDetails.services?.length || 0} selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowServiceMenu(false)}
                  className="px-6 py-2 bg-anzac-500 text-white rounded-lg font-medium hover:bg-anzac-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
